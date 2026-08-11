import { PaginationParams } from '../index';

export interface PartnerDTO {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerDTO {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePartnerDTO {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

export interface PartnerFilterParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export interface PartnerListDTO {
  partners: PartnerDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}