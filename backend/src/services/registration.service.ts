// backend/src/services/registration.service.ts

import { RegistrationRepository } from '../repositories/registration.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import {
  CreateRegistrationDTO,
  UpdateRegistrationDTO,
} from '../types/dto/registration.dto';
import { ApiError } from '../utils/ApiError';
import { Registration, RegistrationStatus, PaymentStatus, Prisma } from '@prisma/client';

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
      throw ApiError.conflict('Vous êtes déjà inscrit à cette session');
    }

    // Transaction
    const registration = await this.registrationRepository.transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.create({
        data: {
          email: data.email,
          phone: data.phone || '',
          firstName: data.firstName,
          lastName: data.lastName,
          sessionId: data.sessionId,
          formationId: data.formationId ?? null,
          motivation: data.motivation ?? null,
          status: RegistrationStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentAmount: data.paymentAmount ?? 0,
          notes: data.notes ?? null,
        },
        // ✅ NOMS CORRECTS DES RELATIONS
        include: {
          Formation: true,               // ✅ majuscule
          FormationSession: {            // ✅ majuscule
            include: { Formation: true },
          },
        },
      });

      // Paiement associé
      if (reg.paymentAmount && reg.paymentAmount > 0) {
        await tx.payment.create({
          data: {
            registrationId: reg.id,
            amount: reg.paymentAmount,
            paymentReference: `REG-${reg.id}`,
            status: PaymentStatus.PENDING,
            paymentMethod: 'CASH',
          },
        });
      }

      return reg;
    });

    return registration;
  }

  async update(id: string, data: UpdateRegistrationDTO): Promise<Registration> {
    await this.registrationRepository.findByIdOrThrow(id);
    return this.registrationRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.registrationRepository.delete(id);
  }

  // ─── Recherches ──────────────────────────────────────
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
      throw ApiError.badRequest('Inscription déjà confirmée');
    }

    const updated = await this.registrationRepository.transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
        // ✅ NOMS CORRECTS
        include: {
          Formation: true,
          FormationSession: {
            include: { Formation: true },
          },
        },
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

    return updated;
  }

  async cancelRegistration(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw ApiError.badRequest('Inscription déjà annulée');
    }

    const updated = await this.registrationRepository.update(id, {
      status: RegistrationStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
    });

    return updated;
  }

  async completeRegistration(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.COMPLETED) {
      throw ApiError.badRequest('Inscription déjà complétée');
    }
    return this.registrationRepository.update(id, {
      status: RegistrationStatus.COMPLETED,
    });
  }

  async addToWaitingList(id: string): Promise<Registration> {
    const registration = await this.registrationRepository.findByIdOrThrow(id);
    if (registration.status === RegistrationStatus.WAITING_LIST) {
      throw ApiError.badRequest('Déjà en liste d\'attente');
    }
    return this.registrationRepository.update(id, {
      status: RegistrationStatus.WAITING_LIST,
    });
  }

  // ─── DTO ──────────────────────────────────────────────
  toDTO(registration: Registration & {
    Formation?: any;
    FormationSession?: any;
  }): any {
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
      // ✅ Accès aux relations avec les bons noms
      formation: registration.Formation,
      session: registration.FormationSession,
    };
  }
}