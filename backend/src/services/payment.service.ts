import { BaseService } from './base.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../types/dto/payment.dto';
import { ApiError } from '../utils/ApiError';
import { Payment, PaymentStatus } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService extends BaseService<Payment, CreatePaymentDTO, UpdatePaymentDTO> {
  private paymentRepository: PaymentRepository;
  private registrationRepository: RegistrationRepository;
  private y2cMemberRepository: Y2CMemberRepository;

  constructor() {
    super(new PaymentRepository());
    this.paymentRepository = new PaymentRepository();
    this.registrationRepository = new RegistrationRepository();
    this.y2cMemberRepository = new Y2CMemberRepository();
  }

  async create(data: CreatePaymentDTO): Promise<Payment> {
    const reference = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const payment = await this.paymentRepository.create({
      ...data,
      paymentReference: data.paymentReference || reference,
      status: 'PENDING',
    });

    if (data.registrationId) {
      await this.registrationRepository.update(data.registrationId, {
        paymentStatus: 'PENDING',
        paymentAmount: data.amount,
        paymentReference: payment.paymentReference,
      });
    }

    if (data.y2cMemberId) {
      await this.y2cMemberRepository.update(data.y2cMemberId, {
        membershipFeePaid: data.amount,
      });
    }

    try {
      await this.sendPaymentConfirmation(payment);
    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
    }

    return payment;
  }

  async confirmPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    if (payment.status === 'PAID') {
      throw ApiError.badRequest('Payment already confirmed');
    }

    const updated = await this.paymentRepository.update(id, {
      status: 'PAID',
      paidAt: new Date(),
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'PAID',
      });
    }

    if (payment.y2cMemberId) {
      await this.y2cMemberRepository.update(payment.y2cMemberId, {
        status: 'ACTIVE',
      });
    }

    try {
      await this.sendPaymentSuccess(updated);
    } catch (error) {
      logger.error('Failed to send payment success email:', error);
    }

    return updated;
  }

  async failPayment(id: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    const updated = await this.paymentRepository.update(id, {
      status: 'FAILED',
      metadata: {
        ...(payment.metadata as any || {}),
        failureReason: reason,
        failedAt: new Date(),
      },
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'FAILED',
      });
    }

    return updated;
  }

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    if (payment.status !== 'PAID') {
      throw ApiError.badRequest('Only paid payments can be refunded');
    }

    const updated = await this.paymentRepository.update(id, {
      status: 'REFUNDED',
      metadata: {
        ...(payment.metadata as any || {}),
        refundedAt: new Date(),
      },
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'REFUNDED',
      });
    }

    return updated;
  }

  async getStats(): Promise<any> {
    const total = await this.paymentRepository.count();
    const totalAmount = await this.paymentRepository.sum('amount', { status: 'PAID' });
    const pending = await this.paymentRepository.count({ status: 'PENDING' });
    const paid = await this.paymentRepository.count({ status: 'PAID' });
    const failed = await this.paymentRepository.count({ status: 'FAILED' });
    const refunded = await this.paymentRepository.count({ status: 'REFUNDED' });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const todayAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: todayStart },
    });
    const monthAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: monthStart },
    });
    const yearAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: yearStart },
    });

    const byMethod = await this.paymentRepository.groupBy('paymentMethod');

    return {
      total,
      totalAmount: totalAmount || 0,
      pending,
      paid,
      failed,
      refunded,
      today: { amount: todayAmount || 0 },
      thisMonth: { amount: monthAmount || 0 },
      thisYear: { amount: yearAmount || 0 },
      byMethod,
    };
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const registrations = await this.registrationRepository.findByEmail(userId);
    const registrationIds = registrations.map(r => r.id);

    return this.paymentRepository.findMany({
      where: {
        registrationId: { in: registrationIds },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async sendPaymentConfirmation(payment: Payment): Promise<void> {
    let email = '';
    let name = '';

    if (payment.registrationId) {
      const registration = await this.registrationRepository.findById(payment.registrationId);
      if (registration) {
        email = registration.email;
        name = `${registration.firstName} ${registration.lastName}`;
      }
    } else if (payment.y2cMemberId) {
      const member = await this.y2cMemberRepository.findById(payment.y2cMemberId);
      if (member) {
        email = member.email;
        name = member.name;
      }
    }

    if (email) {
      await mailer.sendTemplatedEmail(email, 'payment-confirmation', {
        name,
        content: `
          <h2>Confirmation de paiement</h2>
          <p>Nous avons bien reçu votre paiement.</p>
          <p><strong>Référence:</strong> ${payment.paymentReference}</p>
          <p><strong>Montant:</strong> ${payment.amount} ${payment.currency}</p>
          <p><strong>Méthode:</strong> ${payment.paymentMethod}</p>
          <p>Votre paiement est en cours de traitement.</p>
        `,
      });
    }
  }

  private async sendPaymentSuccess(payment: Payment): Promise<void> {
    let email = '';
    let name = '';

    if (payment.registrationId) {
      const registration = await this.registrationRepository.findById(payment.registrationId);
      if (registration) {
        email = registration.email;
        name = `${registration.firstName} ${registration.lastName}`;
      }
    } else if (payment.y2cMemberId) {
      const member = await this.y2cMemberRepository.findById(payment.y2cMemberId);
      if (member) {
        email = member.email;
        name = member.name;
      }
    }

    if (email) {
      await mailer.sendTemplatedEmail(email, 'payment-success', {
        name,
        content: `
          <h2>Paiement confirmé</h2>
          <p>Votre paiement a été confirmé avec succès.</p>
          <p><strong>Référence:</strong> ${payment.paymentReference}</p>
          <p><strong>Montant:</strong> ${payment.amount} ${payment.currency}</p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    }
  }

  toDTO(payment: Payment): any {
    return {
      id: payment.id,
      registrationId: payment.registrationId,
      y2cMemberId: payment.y2cMemberId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference,
      status: payment.status,
      metadata: payment.metadata,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}