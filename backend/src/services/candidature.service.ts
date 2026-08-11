import { BaseService } from './base.service';
import { CandidatureRepository } from '../repositories/candidature.repository';
import { InterviewRepository } from '../repositories/interview.repository';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import { CreateCandidatureDTO, UpdateCandidatureDTO, CreateInterviewDTO, CreateEvaluationDTO } from '../types/dto/candidature.dto';
import { ApiError } from '../utils/ApiError';
import { Candidature, Evaluation } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class CandidatureService extends BaseService<Candidature, CreateCandidatureDTO, UpdateCandidatureDTO> {
  private candidatureRepository: CandidatureRepository;
  private interviewRepository: InterviewRepository;
  private evaluationRepository: EvaluationRepository;

  constructor() {
    super(new CandidatureRepository());
    this.candidatureRepository = new CandidatureRepository();
    this.interviewRepository = new InterviewRepository();
    this.evaluationRepository = new EvaluationRepository();
  }

  // ─── CRUD ──────────────────────────────────────────────
  // create utilise la relation Prisma
  async create(data: CreateCandidatureDTO): Promise<Candidature> {
    const existing = await this.candidatureRepository.findMany({
      where: {
        recruitmentId: data.recruitmentId,
        email: data.email,
      },
    });
    if (existing.length > 0) {
      throw ApiError.conflict('You have already applied for this position');
    }
    return this.candidatureRepository.create({
      ...data,
      recruitment: {
        connect: { id: data.recruitmentId }
      }
    });
  }

  // update est héritée de BaseService – on ne la surcharge pas.

  // delete est héritée de BaseService – elle retourne le candidat supprimé (compatible)

  // ─── RECHERCHES ────────────────────────────────────────
  async getByRecruitment(recruitmentId: string): Promise<Candidature[]> {
    return this.candidatureRepository.findMany({
      where: { recruitmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<any> {
    const total = await this.candidatureRepository.count();
    const byRecruitment = await this.candidatureRepository.groupBy('recruitmentId');
    const byStatus = await this.candidatureRepository.groupBy('status');
    return { total, byRecruitment, byStatus };
  }

  // ─── INTERVIEWS ────────────────────────────────────────
  async scheduleInterview(candidatureId: string, data: CreateInterviewDTO): Promise<any> {
    await this.candidatureRepository.findByIdOrThrow(candidatureId);
    return this.interviewRepository.create({
      ...data,
      candidature: {
        connect: { id: candidatureId }
      }
    });
  }

  async updateInterview(id: string, data: any): Promise<any> {
    return this.interviewRepository.update(id, data);
  }

  async getInterviews(candidatureId: string): Promise<any[]> {
    return this.interviewRepository.findMany({
      where: { candidatureId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // ─── EVALUATIONS ───────────────────────────────────────
  async addEvaluation(candidatureId: string, data: CreateEvaluationDTO, evaluatorId: string): Promise<any> {
    await this.candidatureRepository.findByIdOrThrow(candidatureId);
    return this.evaluationRepository.create({
      ...data,
      candidature: {
        connect: { id: candidatureId }
      },
      evaluator: {
        connect: { id: evaluatorId }
      }
    });
  }

  async getEvaluations(candidatureId: string): Promise<Evaluation[]> {
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

  // ─── DTO ───────────────────────────────────────────────
  toDTO(candidature: Candidature): any {
    return {
      id: candidature.id,
      recruitmentId: candidature.recruitmentId,
      fullName: candidature.fullName,
      email: candidature.email,
      phone: candidature.phone,
      cvUrl: candidature.cvUrl,
      coverLetter: candidature.coverLetter || null,
      status: candidature.status,
      notes: candidature.notes || null,
      createdAt: candidature.createdAt,
      updatedAt: candidature.updatedAt,
    };
  }
}