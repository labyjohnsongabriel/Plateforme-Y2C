import { BaseService } from './base.service';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { Y2CEventRepository } from '../repositories/y2cEvent.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import {
  CreateY2CMemberDTO,
  UpdateY2CMemberDTO,
  CreateY2CEventDTO,
  UpdateY2CEventDTO,
} from '../types/dto/y2c.dto';
import { ApiError } from '../utils/ApiError';
import { Prisma, Y2CMember, Y2CEvent, Y2CMemberStatus, PaymentStatus } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { slugify } from '../utils/slugify';
import prisma from '../../prisma/client';

export class Y2CService {
  private memberRepository: Y2CMemberRepository;
  private eventRepository: Y2CEventRepository;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.memberRepository = new Y2CMemberRepository();
    this.eventRepository = new Y2CEventRepository();
    this.paymentRepository = new PaymentRepository();
  }

  // ============ MEMBERS ============

  async createMember(data: CreateY2CMemberDTO): Promise<Y2CMember> {
    const existingMember = await this.memberRepository.findByEmail(data.email);
    if (existingMember) {
      throw ApiError.conflict('Email already registered as Y2C member');
    }
    const badgeNumber = await this.generateBadgeNumber();
    const member = await this.memberRepository.create({
      ...data,
      badgeNumber,
      status: 'PENDING',
      membershipFeePaid: data.membershipFeePaid || 25000,
    });
    try {
      await mailer.sendTemplatedEmail(member.email, 'y2c-welcome', {
        name: member.name,
        content: `
          <h2>Bienvenue dans la communauté Y2C !</h2>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p><strong>Numéro de badge :</strong> ${member.badgeNumber}</p>
          <p>Vous recevrez bientôt votre badge numérique.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send Y2C welcome email:', error);
    }
    return member;
  }

  async updateMember(id: string, data: UpdateY2CMemberDTO): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (data.email && data.email !== member.email) {
      const existing = await this.memberRepository.findByEmail(data.email);
      if (existing) throw ApiError.conflict('Email already registered as Y2C member');
    }
    return this.memberRepository.update(id, data);
  }

  async approveMember(id: string): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (member.status === 'ACTIVE') {
      throw ApiError.badRequest('Member already active');
    }
    const updated = await this.memberRepository.update(id, {
      status: 'ACTIVE',
      joinedAt: new Date(),
    });
    try {
      await mailer.sendTemplatedEmail(member.email, 'y2c-approved', {
        name: member.name,
        content: `
          <h2>Votre adhésion Y2C a été approuvée !</h2>
          <p>Félicitations ! Vous êtes maintenant membre actif de la communauté Y2C.</p>
          <p>Vous pouvez maintenant participer à tous nos événements.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send Y2C approval email:', error);
    }
    return updated;
  }

  async getMemberById(id: string): Promise<Y2CMember> {
    return this.memberRepository.findByIdOrThrow(id);
  }

  async getMemberByEmail(email: string): Promise<Y2CMember | null> {
    return this.memberRepository.findByEmail(email);
  }

  async deleteMember(id: string): Promise<void> {
    await this.memberRepository.findByIdOrThrow(id);
    await this.memberRepository.delete(id);
  }

  async getMemberStats() {
    return this.memberRepository.getStats();
  }

  async findMembers(params: any) {
    return this.memberRepository.findPaginated(params);
  }

  async generateBadges(): Promise<{ generated: number; message: string }> {
    const allMembers = await this.memberRepository.findMany({});
    const membersWithoutBadge = allMembers.filter((member) => !member.badgeNumber);

    if (membersWithoutBadge.length === 0) {
      return { generated: 0, message: 'Tous les membres ont déjà un badge.' };
    }

    let generatedCount = 0;
    for (const member of membersWithoutBadge) {
      const newBadge = await this.generateBadgeNumber();
      await this.memberRepository.update(member.id, {
        badgeNumber: newBadge,
        status: 'ACTIVE',
      });
      generatedCount++;
      try {
        await mailer.sendTemplatedEmail(member.email, 'y2c-badge-generated', {
          name: member.name,
          badgeNumber: newBadge,
          content: `
            <h2>Votre badge Y2C est prêt !</h2>
            <p>Bonjour ${member.name},</p>
            <p>Votre badge numérique est maintenant disponible.</p>
            <p><strong>Numéro de badge :</strong> ${newBadge}</p>
            <p>Vous pouvez le télécharger depuis votre espace membre.</p>
          `,
        });
      } catch (error) {
        logger.error(`Failed to send badge email to ${member.email}:`, error);
      }
    }

    return {
      generated: generatedCount,
      message: `${generatedCount} badge(s) généré(s) avec succès.`,
    };
  }

  async generateBadgeForMember(id: string): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (member.badgeNumber) {
      throw ApiError.badRequest('Ce membre a déjà un badge.');
    }
    const newBadge = await this.generateBadgeNumber();
    const updated = await this.memberRepository.update(id, {
      badgeNumber: newBadge,
      status: 'ACTIVE',
    });
    try {
      await mailer.sendTemplatedEmail(updated.email, 'y2c-badge-generated', {
        name: updated.name,
        badgeNumber: newBadge,
        content: `
          <h2>Votre badge Y2C est prêt !</h2>
          <p>Bonjour ${updated.name},</p>
          <p>Votre badge numérique est maintenant disponible.</p>
          <p><strong>Numéro de badge :</strong> ${newBadge}</p>
          <p>Vous pouvez le télécharger depuis votre espace membre.</p>
        `,
      });
    } catch (error) {
      logger.error(`Failed to send badge email to ${updated.email}:`, error);
    }
    return updated;
  }

  private async generateBadgeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count() + 1;
    const padded = String(count).padStart(4, '0');
    return `Y2C-${year}-${padded}`;
  }

  // ============ EVENTS ============

  async createEvent(data: CreateY2CEventDTO): Promise<Y2CEvent> {
    // Générer le slug manuellement avec prisma
    let baseSlug = slugify(data.title);
    if (!baseSlug) baseSlug = 'event';

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.y2CEvent.findFirst({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const createData = {
      ...data,
      slug,
      isPublished: data.isPublished ?? false,
      isPaid: data.isPaid ?? false,
    } as Prisma.Y2CEventCreateInput;
    return this.eventRepository.create(createData);
  }

  async updateEvent(id: string, data: UpdateY2CEventDTO): Promise<Y2CEvent> {
    const event = await this.eventRepository.findByIdOrThrow(id);
    let slug = event.slug;

    if (data.title && data.title !== event.title) {
      let baseSlug = slugify(data.title);
      if (!baseSlug) baseSlug = 'event';
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.y2CEvent.findFirst({
          where: {
            slug,
            // ✅ Correction : on utilise NOT avec id: event.id
            NOT: { id: event.id },
          },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return this.eventRepository.update(id, { ...data, slug });
  }

  async getEvent(id: string): Promise<Y2CEvent> {
    return this.eventRepository.findByIdOrThrow(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventRepository.findByIdOrThrow(id);
    await this.eventRepository.delete(id);
  }

  async getEventStats() {
    return this.eventRepository.getStats();
  }

  async findEvents(params: any) {
    return this.eventRepository.findPaginated(params);
  }

  async registerForEvent(eventId: string, data: any): Promise<any> {
    const event = await this.eventRepository.findByIdOrThrow(eventId);
    if (event.maxParticipants) {
      const registrations = await this.eventRepository.getRegistrations(eventId);
      if (registrations.length >= event.maxParticipants) {
        throw ApiError.badRequest('Event is full');
      }
    }
    const registration = await this.eventRepository.createRegistration({
      eventId,
      ...data,
      status: 'PENDING',
    });
    try {
      await mailer.sendTemplatedEmail(data.email, 'y2c-event-registration', {
        name: data.name,
        content: `
          <h2>Inscription confirmée</h2>
          <p>Vous êtes inscrit à l'événement Y2C : ${event.title}</p>
          <p><strong>Date :</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Lieu :</strong> ${event.location}</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send event registration email:', error);
    }
    return registration;
  }

  async getEventRegistrations(eventId: string) {
    return this.eventRepository.getRegistrations(eventId);
  }
}