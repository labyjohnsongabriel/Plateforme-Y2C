// backend/src/services/candidature.service.ts

import { CandidatureRepository } from '../repositories/candidature.repository';
import { InterviewRepository } from '../repositories/interview.repository';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import {
  CreateCandidatureDTO,
  UpdateCandidatureDTO,
  CreateInterviewDTO,
  CreateEvaluationDTO,
} from '../types/dto/candidature.dto';
import { ApiError } from '../utils/ApiError';
import { Candidature } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class CandidatureService {
  private candidatureRepository: CandidatureRepository;
  private interviewRepository: InterviewRepository;
  private evaluationRepository: EvaluationRepository;

  constructor() {
    this.candidatureRepository = new CandidatureRepository();
    this.interviewRepository = new InterviewRepository();
    this.evaluationRepository = new EvaluationRepository();
  }

  // ─── CRUD CANDIDATURE ──────────────────────────────
  async findAll(params?: any): Promise<Candidature[]> {
    return this.candidatureRepository.findMany(params);
  }

  async findById(id: string): Promise<Candidature> {
    return this.candidatureRepository.findByIdOrThrow(id);
  }

  async create(data: CreateCandidatureDTO): Promise<Candidature> {
    const candidature = await this.candidatureRepository.create({
      ...data,
      Recruitment: {
        connect: { id: data.recruitmentId },
      },
    });

    try {
      await mailer.sendTemplatedEmail(data.email, 'candidature-received', {
        name: data.fullName,
        content: `<p>Votre candidature a bien été enregistrée.</p>`,
      });
    } catch (error) {
      logger.error('Failed to send candidature email:', error);
    }

    return candidature;
  }

  async update(id: string, data: UpdateCandidatureDTO): Promise<Candidature> {
    await this.candidatureRepository.findByIdOrThrow(id);
    return this.candidatureRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.candidatureRepository.delete(id);
  }

  async getByRecruitment(recruitmentId: string): Promise<Candidature[]> {
    return this.candidatureRepository.findMany({
      where: { recruitmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByEmail(email: string): Promise<Candidature[]> {
    return this.candidatureRepository.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string): Promise<Candidature> {
    await this.candidatureRepository.findByIdOrThrow(id);
    return this.candidatureRepository.update(id, { status });
  }

  // ─── INTERVIEWS ──────────────────────────────────────
  // ✅ Prend candidatureId en premier paramètre
  async addInterview(candidatureId: string, data: Omit<CreateInterviewDTO, 'candidatureId'>): Promise<any> {
    await this.candidatureRepository.findByIdOrThrow(candidatureId);
    return this.interviewRepository.create({
      ...data,
      Candidature: {
        connect: { id: candidatureId },
      },
    });
  }

  // ✅ Alias pour le contrôleur (appelé scheduleInterview)
  async scheduleInterview(candidatureId: string, data: any): Promise<any> {
    return this.addInterview(candidatureId, data);
  }

  async updateInterview(id: string, data: Partial<CreateInterviewDTO>): Promise<any> {
    return this.interviewRepository.update(id, data);
  }

  async deleteInterview(id: string): Promise<void> {
    await this.interviewRepository.delete(id);
  }

  async getInterviews(candidatureId: string): Promise<any[]> {
    return this.interviewRepository.findMany({
      where: { candidatureId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // ─── EVALUATIONS ─────────────────────────────────────
  // ✅ Version avec 3 arguments (candidatureId, data, evaluatorId)
  async addEvaluation(
    candidatureId: string,
    data: Omit<CreateEvaluationDTO, 'candidatureId' | 'evaluatorId'>,
    evaluatorId: string
  ): Promise<any> {
    await this.candidatureRepository.findByIdOrThrow(candidatureId);

    // ✅ Construire l'objet avec les deux relations
    return this.evaluationRepository.create({
      ...data,
      Candidature: {
        connect: { id: candidatureId },
      },
      User: {
        connect: { id: evaluatorId },
      },
    });
  }

  async updateEvaluation(id: string, data: Partial<CreateEvaluationDTO>): Promise<any> {
    return this.evaluationRepository.update(id, data);
  }

  async deleteEvaluation(id: string): Promise<void> {
    await this.evaluationRepository.delete(id);
  }

  async getEvaluations(candidatureId: string): Promise<any[]> {
    return this.evaluationRepository.findMany({
      where: { candidatureId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageScore(candidatureId: string): Promise<number | null> {
    const evaluations = await this.evaluationRepository.findMany({
      where: { candidatureId },
      select: { score: true },
    });
    if (evaluations.length === 0) return null;
    const sum = evaluations.reduce((acc, e) => acc + e.score, 0);
    return sum / evaluations.length;
  }

  // ─── STATISTIQUES ─────────────────────────────────────
  async getStats() {
    const total = await this.candidatureRepository.count();
    const byStatus = await this.candidatureRepository.groupBy('status');
    return { total, byStatus };
  }

  // ─── DTO ──────────────────────────────────────────────
  toDTO(candidature: Candidature): any {
    return {
      id: candidature.id,
      fullName: candidature.fullName,
      email: candidature.email,
      phone: candidature.phone,
      cvUrl: candidature.cvUrl,
      coverLetter: candidature.coverLetter,
      status: candidature.status,
      notes: candidature.notes,
      recruitmentId: candidature.recruitmentId,
      createdAt: candidature.createdAt,
      updatedAt: candidature.updatedAt,
    };
  }
}