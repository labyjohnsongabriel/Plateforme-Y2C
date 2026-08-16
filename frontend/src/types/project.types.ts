// src/types/project.types.ts

// ============================================================
// PAGINATION (définie ici pour éviter l'import cassé)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// ENUMS (alignés sur le backend Prisma)
// ============================================================
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  EVALUATING = 'EVALUATING',
}

// ============================================================
// RÉFÉRENCE UTILISATEUR (pour éviter l'import circulaire)
// ============================================================
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  impact?: string;
  technologies: string[];
  images: string[];
  year: number;
  category: string;
  isFeatured: boolean;
  status: ProjectStatus; // ✅ utilise l'enum
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
  metrics?: ProjectMetric[];
  users?: UserRef[]; // ✅ référence minimale
}

export interface ProjectMetric {
  id: string;
  projectId: string;
  metricKey: string;
  metricValue: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface ProjectCreateDTO {
  title: string;
  description: string;
  objectives?: string;
  impact?: string;
  technologies: string[];
  images: string[];
  year: number;
  category: string;
  isFeatured?: boolean;
  status?: ProjectStatus;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface ProjectUpdateDTO extends Partial<ProjectCreateDTO> {
  status?: ProjectStatus;
  isFeatured?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface ProjectFilters extends PaginationParams {
  category?: string;
  status?: ProjectStatus;
  year?: number;
  technology?: string;
  isFeatured?: boolean;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface ProjectStats {
  total: number;
  byStatus: Record<ProjectStatus, number>; // ✅ clé typée
  byCategory: Record<string, number>;
  byYear: { year: number; count: number }[];
  featured: number;
  technologies: { name: string; count: number }[];
}