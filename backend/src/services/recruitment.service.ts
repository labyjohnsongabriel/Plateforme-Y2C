// backend/src/services/recruitment.service.ts

import { BaseService } from './base.service';
import { RecruitmentRepository } from '../repositories/recruitment.repository';
import { CandidatureRepository } from '../repositories/candidature.repository';
import { CreateRecruitmentDTO, UpdateRecruitmentDTO } from '../types/dto/recruitment.dto';
import { CreateCandidatureDTO } from '../types/dto/candidature.dto';
import { ApiError } from '../utils/ApiError';
import { Recruitment } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class RecruitmentService extends BaseService<Recruitment, CreateRecruitmentDTO, UpdateRecruitmentDTO> {
  private recruitmentRepository: RecruitmentRepository;
  private candidatureRepository: CandidatureRepository;

  constructor() {
    super(new RecruitmentRepository());
    this.recruitmentRepository = new RecruitmentRepository();
    this.candidatureRepository = new CandidatureRepository();
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateRecruitmentDTO): Promise<Recruitment> {
    // ✅ Correction : passer le nom du modèle 'recruitment'
    const slug = await generateUniqueSlug(data.title, 'recruitment');
    return this.recruitmentRepository.create({
      ...data,
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateRecruitmentDTO): Promise<Recruitment> {
    const recruitment = await this.recruitmentRepository.findByIdOrThrow(id);
    let slug = recruitment.slug;
    if (data.title && data.title !== recruitment.title) {
      // ✅ Correction : passer le nom du modèle 'recruitment'
      slug = await generateUniqueSlug(data.title, 'recruitment');
    }
    return this.recruitmentRepository.update(id, { ...data, slug });
  }

  // ─── AUTRES MÉTHODES ──────────────────────────────────────
  async getBySlug(slug: string): Promise<Recruitment | null> {
    return this.recruitmentRepository.findBySlug(slug);
  }

  async getActiveRecruitments(): Promise<Recruitment[]> {
    return this.recruitmentRepository.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<any> {
    const total = await this.recruitmentRepository.count();
    const active = await this.recruitmentRepository.count({ isActive: true });
    const closed = await this.recruitmentRepository.count({ isActive: false });
    const byDepartment = await this.recruitmentRepository.groupBy('department');
    const totalCandidatures = await this.candidatureRepository.count();
    return { total, active, closed, byDepartment, totalCandidatures };
  }

  // ─── CANDIDATURES ──────────────────────────────────────────
  async applyForPosition(data: CreateCandidatureDTO): Promise<any> {
    const recruitment = await this.recruitmentRepository.findByIdOrThrow(data.recruitmentId);

    if (!recruitment.isActive) {
      throw ApiError.badRequest('This position is no longer accepting applications');
    }

    // Vérifier les doublons
    const existingCandidatures = await this.candidatureRepository.findMany({
      where: {
        recruitmentId: data.recruitmentId,
        email: data.email,
      },
    });

    if (existingCandidatures.length > 0) {
      throw ApiError.conflict('You have already applied for this position');
    }

    // ✅ Utilisation de la relation Prisma "Recruitment" (majuscule)
    const candidature = await this.candidatureRepository.create({
      ...data,
      Recruitment: {
        connect: { id: data.recruitmentId }
      }
    });

    // Envoyer un email de confirmation
    try {
      await mailer.sendTemplatedEmail(data.email, 'application-confirmation', {
        name: data.fullName,
        content: `
          <h2>Confirmation de candidature</h2>
          <p>Nous avons bien reçu votre candidature pour le poste de ${recruitment.position}.</p>
          <p>Nous vous contacterons prochainement pour la suite du processus.</p>
          <p><strong>Référence:</strong> ${candidature.id}</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send application confirmation:', error);
    }

    return candidature;
  }

  async getCandidatures(recruitmentId: string): Promise<any[]> {
    return this.candidatureRepository.findMany({
      where: { recruitmentId },
      include: {
        interviews: true,
        evaluations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCandidatureStatus(id: string, status: string): Promise<any> {
    return this.candidatureRepository.update(id, { status });
  }

  async getCandidatureStats(recruitmentId: string): Promise<any> {
    const total = await this.candidatureRepository.count({ recruitmentId });
    const pending = await this.candidatureRepository.count({ recruitmentId, status: 'PENDING' });
    const reviewed = await this.candidatureRepository.count({ recruitmentId, status: 'REVIEWED' });
    const shortlisted = await this.candidatureRepository.count({ recruitmentId, status: 'SHORTLISTED' });
    const interviewed = await this.candidatureRepository.count({ recruitmentId, status: 'INTERVIEWED' });
    const accepted = await this.candidatureRepository.count({ recruitmentId, status: 'ACCEPTED' });
    const rejected = await this.candidatureRepository.count({ recruitmentId, status: 'REJECTED' });

    return {
      total,
      pending,
      reviewed,
      shortlisted,
      interviewed,
      accepted,
      rejected,
    };
  }

  toDTO(recruitment: Recruitment): any {
    return {
      id: recruitment.id,
      title: recruitment.title,
      slug: recruitment.slug,
      description: recruitment.description,
      requirements: recruitment.requirements,
      department: recruitment.department,
      position: recruitment.position,
      isActive: recruitment.isActive,
      deadline: recruitment.deadline,
      createdAt: recruitment.createdAt,
      updatedAt: recruitment.updatedAt,
    };
  }
}