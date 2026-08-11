import { PaginationParams } from '../index';

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt?: Date;
  repliedBy?: string;
  replyContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactMessageDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ReplyContactMessageDTO {
  replyContent: string;
  repliedBy: string;
}

export interface ContactMessageFilterParams extends PaginationParams {
  search?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ContactMessageListDTO {
  messages: ContactMessageDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContactMessageStatsDTO {
  total: number;
  unread: number;
  read: number;
  replied: number;
  thisWeek: number;
  thisMonth: number;
}

export interface ContactInfoDTO {
  address: string;
  phone: string;
  email: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  mapEmbedUrl?: string;
}