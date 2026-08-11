import { PaginationParams } from '../index';

export interface CandidatureDTO {
  id: string;
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  interviews?: InterviewDTO[];
  evaluations?: EvaluationDTO[];
  recruitment?: {
    id: string;
    title: string;
    position: string;
  };
}

export interface InterviewDTO {
  id: string;
  candidatureId: string;
  scheduledAt: Date;
  interviewer: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationDTO {
  id: string;
  candidatureId: string;
  evaluatorId: string;
  evaluator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  criteria: string;
  score: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidatureDTO {
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
}

export interface UpdateCandidatureDTO {
  status?: string;
  notes?: string;
}

export interface CreateInterviewDTO {
  scheduledAt: Date;
  interviewer: string;
  notes?: string;
}

export interface UpdateInterviewDTO {
  scheduledAt?: Date;
  interviewer?: string;
  notes?: string;
  status?: string;
}

export interface CreateEvaluationDTO {
  criteria: string;
  score: number;
  comments?: string;
}

export interface CandidatureFilterParams extends PaginationParams {
  search?: string;
  recruitmentId?: string;
  status?: string;
}

export interface CandidatureListDTO {
  candidatures: CandidatureDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CandidatureStatsDTO {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interviewed: number;
  accepted: number;
  rejected: number;
  byRecruitment: {
    [key: string]: number;
  };
}