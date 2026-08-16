import { BaseService } from './base.service';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDTO, UpdateEventDTO, CreateEventRegistrationDTO } from '../types/dto/event.dto';
import { ApiError } from '../utils/ApiError';
import { Event } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class EventService extends BaseService<Event, CreateEventDTO, UpdateEventDTO> {
  private eventRepository: EventRepository;

  constructor() {
    super(new EventRepository());
    this.eventRepository = new EventRepository();
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateEventDTO): Promise<Event> {
    // ✅ Correction : passer le nom du modèle 'event'
    const slug = await generateUniqueSlug(data.title, 'event');
    return this.eventRepository.create({
      ...data,
      slug,
      isPublished: data.isPublished || false,
      isPaid: data.isPaid || false,
    });
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepository.findByIdOrThrow(id);

    let slug = event.slug;
    if (data.title && data.title !== event.title) {
      // ✅ Correction : passer le nom du modèle 'event'
      slug = await generateUniqueSlug(data.title, 'event');
    }

    return this.eventRepository.update(id, {
      ...data,
      slug,
    });
  }

  // ─── AUTRES MÉTHODES ──────────────────────────────────────
  async getBySlug(slug: string): Promise<Event | null> {
    return this.eventRepository.findBySlug(slug);
  }

  async getPublishedEvents(params: any): Promise<any> {
    return this.eventRepository.findPublished(params);
  }

  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    return this.eventRepository.findUpcoming(limit);
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return this.eventRepository.findByType(type);
  }

  async getStats() {
    return this.eventRepository.getStats();
  }

  // ─── INSCRIPTIONS ──────────────────────────────────────────
  async registerForEvent(eventId: string, data: CreateEventRegistrationDTO): Promise<any> {
    const event = await this.eventRepository.findByIdOrThrow(eventId);

    // Vérifier la capacité
    if (event.maxAttendees) {
      const registrations = await this.eventRepository.getRegistrations(eventId);
      if (registrations.length >= event.maxAttendees) {
        throw ApiError.badRequest('Event is full');
      }
    }

    // Vérifier si déjà inscrit
    const existingRegistrations = await this.eventRepository.getRegistrations(eventId);
    const alreadyRegistered = existingRegistrations.some(r => r.email === data.email);
    if (alreadyRegistered) {
      throw ApiError.conflict('You are already registered for this event');
    }

    const registration = await this.eventRepository.createRegistration({
      eventId,
      ...data,
      status: 'PENDING',
    });

    // Envoyer la confirmation
    try {
      await mailer.sendTemplatedEmail(data.email, 'event-registration', {
        name: data.name,
        content: `
          <h2>Inscription confirmée</h2>
          <p>Vous êtes inscrit à l'événement : ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Heure:</strong> ${event.time}</p>
          <p><strong>Lieu:</strong> ${event.location}</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send event registration email:', error);
    }

    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<any[]> {
    return this.eventRepository.getRegistrations(eventId);
  }

  async confirmRegistration(id: string): Promise<any> {
    return this.eventRepository.updateRegistration(id, {
      status: 'CONFIRMED',
    });
  }

  async cancelRegistration(id: string): Promise<any> {
    return this.eventRepository.updateRegistration(id, {
      status: 'CANCELLED',
    });
  }

  toDTO(event: Event): any {
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      maxAttendees: event.maxAttendees,
      isPaid: event.isPaid,
      price: event.price,
      imageUrl: event.imageUrl,
      isPublished: event.isPublished,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}