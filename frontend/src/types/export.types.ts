// src/types/export.types.ts
// ============================================================
import { PaginationParams } from './common.types';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filters?: any;
  columns?: string[];
  limit?: number;
}

export interface ExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface ExportFilters extends PaginationParams {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}