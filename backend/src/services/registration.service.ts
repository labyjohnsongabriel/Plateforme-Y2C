import { RegistrationRepository } from '../repositories/registration.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { CreateRegistrationDTO, UpdateRegistrationDTO } from '../types/dto/registration.dto';
import { ApiError } from '../utils/ApiError';
import { Registration, RegistrationStatus, PaymentStatus, Prisma } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class RegistrationService {
  private registrationRepository: RegistrationRepository;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.registrationRepository = new RegistrationRepository();
    this.paymentRepository = new PaymentRepository();
  }

  // ─── CRUD ──────────────────────────────────────────────
  async findAll(params?: any): Promise<Registration[]> {
    return this.registrationRepository.findMany(params);
  }

  async findById(id: string): Promise<Registration> {
    return this.registrationRepository.findByIdOrThrow(id);
  }

  async create(data: CreateRegistrationDTO): Promise<Registration> {
    // Vérification des doublons
    const existingRegistrations = await this.registrationRepository.findByEmail(data.email);
    const alreadyRegistered = existingRegistrations.some(
      (r: Registration) => r.sessionId === data.sessionId
    );
    if (alreadyRegistered) {
      throw ApiError.conflict('You are already registered for this session');
    }

    // Transaction : inscription + paiement
    const registration = await this.registrationRepository.transaction(async (tx: Prisma.TransactionClient) => {
      // ✅ On fixe paymentAmount = 0 et notes = null (le DTO ne les fournit pas)
      const reg = await tx.registration.create({
        data: {
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          formationId: data.formationId,
          sessionId: data.sessionId,
          status: RegistrationStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentAmount: 0,               // valeur par défaut
          notes: null,                    // valeur par défaut
        },
        include: { formation: true, session: true },
      });

      // Paiement associé (montant 0)
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: 0,                      // identique à paymentAmount
          paymentReference: `REG-${reg.id}`,
          status: PaymentStatus.PENDING,
          paymentMethod: 'OTHER',         // champ obligatoire dans Prisma
        },
      });

      return reg;
    });

    // Envoi d'email (asynchrone)
    try {
      const fullName = `${data.firstName} ${data.lastName}`;
      await mailer.sendTemplatedEmail(data.email, 'registration-confirmation', {
        name: fullName,
        content: `
          <h2>Inscription confirmée</h2>
          <p>Votre inscription à la formation est en attente de paiement.</p>
          <p>Vous recevrez un email de confirmation dès que le paiement sera validé.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send registration email:', error);
    }

    return registration;
  }

  async update(id: string, data: UpdateRegistrationDTO): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (data.status && data.status !== registration.status) {
      if (data.status === RegistrationStatus.CONFIRMED) {
        await this.sendConfirmationEmail(registration);
      }
    }
    return this.registrationRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.registrationRepository.delete(id);
  }

  // ─── Recherches spécifiques ────────────────────────────
  async getByEmail(email: string): Promise<Registration[]> {
    return this.registrationRepository.findByEmail(email);
  }

  async getBySession(sessionId: string): Promise<Registration[]> {
    return this.registrationRepository.findBySessionId(sessionId);
  }

  async getByFormation(formationId: string): Promise<Registration[]> {
    return this.registrationRepository.findByFormationId(formationId);
  }

  async getByStatus(status: RegistrationStatus): Promise<Registration[]> {
    return this.registrationRepository.findByStatus(status);
  }

  // ─── Statistiques ──────────────────────────────────────
  async getStats() {
    return this.registrationRepository.getStats();
  }

  async getRevenueStats() {
    return this.registrationRepository.getRevenueStats();
  }

  // ─── Actions ──────────────────────────────────────────
  async confirmRegistration(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.CONFIRMED) {
      throw ApiError.badRequest('Registration already confirmed');
    }

    const updated = await this.registrationRepository.transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
        include: { session: true, formation: true },
      });

      await tx.payment.updateMany({
        where: { registrationId: id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      return reg;
    });

    await this.sendConfirmationEmail(updated);
    return updated;
  }

  async cancelRegistration(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw ApiError.badRequest('Registration already cancelled');
    }

    const updated = await this.registrationRepository.update(id, {
      status: RegistrationStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
    });

    try {
      const fullName = `${updated.firstName} ${updated.lastName}`;
      await mailer.sendTemplatedEmail(updated.email, 'registration-cancelled', {
        name: fullName,
        content: `
          <h2>Votre inscription a été annulée</h2>
          <p>Nous avons bien pris en compte votre demande d'annulation.</p>
          <p>Si vous avez déjà effectué un paiement, il sera remboursé sous 48h.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send cancellation email:', error);
    }

    return updated;
  }

  async completeRegistration(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.COMPLETED) {
      throw ApiError.badRequest('Registration already completed');
    }
    return this.registrationRepository.update(id, {
      status: RegistrationStatus.COMPLETED,
    });
  }

  async addToWaitingList(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.WAITING_LIST) {
      throw ApiError.badRequest('Already on waiting list');
    }
    return this.registrationRepository.update(id, {
      status: RegistrationStatus.WAITING_LIST,
    });
  }

  // ─── Helpers ──────────────────────────────────────────
  private async sendConfirmationEmail(registration: Registration): Promise<void> {
    try {
      const fullName = `${registration.firstName} ${registration.lastName}`;
      await mailer.sendTemplatedEmail(registration.email, 'registration-confirmed', {
        name: fullName,
        content: `
          <h2>Inscription confirmée !</h2>
          <p>Votre inscription est maintenant confirmée.</p>
          <p>Vous recevrez prochainement les informations pratiques.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send confirmation email:', error);
    }
  }

  // ─── DTO ───────────────────────────────────────────────
  toDTO(registration: Registration): any {
    return {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      paymentAmount: registration.paymentAmount,
      sessionId: registration.sessionId,
      formationId: registration.formationId,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
    };
  }
}