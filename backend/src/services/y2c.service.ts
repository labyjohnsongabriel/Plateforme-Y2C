import { BaseService } from './base.service';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { Y2CEventRepository } from '../repositories/y2cEvent.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { CreateY2CMemberDTO, UpdateY2CMemberDTO, CreateY2CEventDTO, UpdateY2CEventDTO } from '../types/dto/y2c.dto';
import { ApiError } from '../utils/ApiError';
import { Prisma, Y2CMember, Y2CEvent, Y2CMemberStatus, PaymentStatus } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { generateUniqueSlug } from '../utils/slugify';

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
          <p><strong>Numéro de badge:</strong> ${member.badgeNumber}</p>
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

  // ============ EVENTS ============
  async createEvent(data: CreateY2CEventDTO): Promise<Y2CEvent> {
    const slug = await generateUniqueSlug(data.title, this.eventRepository, 'slug');
    // Cast explicite pour éviter l'erreur de typage
    const createData = { ...data, slug } as Prisma.Y2CEventCreateInput;
    return this.eventRepository.create(createData);
  }

  async updateEvent(id: string, data: UpdateY2CEventDTO): Promise<Y2CEvent> {
    await this.eventRepository.findByIdOrThrow(id);
    return this.eventRepository.update(id, data);
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
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Lieu:</strong> ${event.location}</p>
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

  // ============ HELPERS ============
  private async generateBadgeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count() + 1;
    const padded = String(count).padStart(4, '0');
    return `Y2C-${year}-${padded}`;
  }
}