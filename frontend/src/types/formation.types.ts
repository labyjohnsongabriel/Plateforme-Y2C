// src/types/formation.types.ts

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
export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  WAITING_LIST = 'WAITING_LIST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export enum FormationLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  sessions?: FormationSession[];
  registrations?: Registration[];
}

export interface FormationSession {
  id: string;
  formationId: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  sessionId: string;
  formationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  motivation?: string;
  status: RegistrationStatus; // ✅ type enum
  paymentStatus: PaymentStatus; // ✅ type enum
  paymentAmount?: number;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface FormationCreateDTO {
  title: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

export interface FormationUpdateDTO extends Partial<FormationCreateDTO> {}

// ============================================================
// FILTRES
// ============================================================
export interface FormationFilters extends PaginationParams {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface FormationStats {
  total: number;
  published: number;
  draft: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
  totalRegistrations: number;
  avgPrice: number;
  mostPopular?: Formation;
}