import { PrismaClient, Prisma } from '@prisma/client';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { FormationRepository } from '../repositories/formation.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ArticleRepository } from '../repositories/article.repository';
import { logger } from '../config/logger';
import * as XLSX from 'xlsx';
// @ts-ignore – les types @types/pdfkit peuvent manquer
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

type RegistrationWithIncludes = Prisma.RegistrationGetPayload<{
  include: { formation: true; session: true };
}>;

type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: { select: { firstName: true; lastName: true } } };
}>;

export class ExportService {
  private prisma: PrismaClient;
  private registrationRepository: RegistrationRepository;
  private y2cMemberRepository: Y2CMemberRepository;
  private paymentRepository: PaymentRepository;
  private formationRepository: FormationRepository;
  private projectRepository: ProjectRepository;
  private articleRepository: ArticleRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.registrationRepository = new RegistrationRepository();
    this.y2cMemberRepository = new Y2CMemberRepository();
    this.paymentRepository = new PaymentRepository();
    this.formationRepository = new FormationRepository();
    this.projectRepository = new ProjectRepository();
    this.articleRepository = new ArticleRepository();
  }

  async exportRegistrations(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const registrations = await this.prisma.registration.findMany({
      where: filters,
      include: {
        formation: true,
        session: true,
      },
    }) as RegistrationWithIncludes[];

    const data = registrations.map(r => ({
      'ID': r.id,
      'Prénom': r.firstName,
      'Nom': r.lastName,
      'Email': r.email,
      'Téléphone': r.phone,
      'Formation': r.formation?.title || 'N/A',
      'Session': r.session?.startDate ? new Date(r.session.startDate).toLocaleDateString() : 'N/A',
      'Statut': r.status,
      'Statut Paiement': r.paymentStatus,
      'Montant': r.paymentAmount || 0,
      'Date Inscription': new Date(r.createdAt).toLocaleDateString(),
    }));

    return this.generateExport(data, format, 'inscriptions');
  }

  async exportMembers(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const members = await this.y2cMemberRepository.findMany({ where: filters });

    const data = members.map(m => ({
      'ID': m.id,
      'Nom': m.name,
      'Email': m.email,
      'Téléphone': m.phone,
      'Institution': m.institution || 'N/A',
      'Numéro Badge': m.badgeNumber,
      'Statut': m.status,
      'Cotisation': m.membershipFeePaid || 0,
      'Date Adhésion': new Date(m.joinedAt).toLocaleDateString(),
    }));

    return this.generateExport(data, format, 'membres-y2c');
  }

  async exportPayments(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const payments = await this.paymentRepository.findMany({ where: filters });

    const data = payments.map(p => ({
      'ID': p.id,
      'Référence': p.paymentReference,
      'Montant': p.amount,
      'Devise': p.currency,
      'Méthode': p.paymentMethod,
      'Statut': p.status,
      'Date Paiement': p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A',
      'Date Création': new Date(p.createdAt).toLocaleDateString(),
    }));

    return this.generateExport(data, format, 'paiements');
  }

  async exportFormations(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const formations = await this.formationRepository.findMany({ where: filters });

    const data = formations.map(f => ({
      'ID': f.id,
      'Titre': f.title,
      'Description': f.description,
      'Durée': f.duration,
      'Niveau': f.level,
      'Prix': f.price || 0,
      'Catégorie': f.category,
      'Statut': f.isPublished ? 'Publiée' : 'Brouillon',
      'Date Création': new Date(f.createdAt).toLocaleDateString(),
    }));

    return this.generateExport(data, format, 'formations');
  }

  async exportProjects(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const projects = await this.projectRepository.findMany({ where: filters });

    const data = projects.map(p => ({
      'ID': p.id,
      'Titre': p.title,
      'Description': p.description,
      'Technologies': p.technologies.join(', '),
      'Année': p.year,
      'Catégorie': p.category,
      'Statut': p.status,
      'Client': p.client || 'N/A',
      'Date Création': new Date(p.createdAt).toLocaleDateString(),
    }));

    return this.generateExport(data, format, 'projets');
  }

  async exportArticles(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const articles = await this.prisma.article.findMany({
      where: filters,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }) as ArticleWithAuthor[];

    const data = articles.map(a => ({
      'ID': a.id,
      'Titre': a.title,
      'Extrait': a.excerpt || 'N/A',
      'Catégorie': a.category,
      'Tags': a.tags.join(', '),
      'Statut': a.status,
      'Auteur': `${a.author?.firstName || ''} ${a.author?.lastName || ''}`,
      'Vues': a.views || 0,
      'Date Publication': a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A',
    }));

    return this.generateExport(data, format, 'articles');
  }

  private async generateExport(
    data: any[],
    format: 'csv' | 'excel' | 'pdf',
    name: string
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    switch (format) {
      case 'csv':
        return this.generateCSV(data, name, timestamp);
      case 'excel':
        return this.generateExcel(data, name, timestamp);
      case 'pdf':
        return this.generatePDF(data, name, timestamp);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private generateCSV(
    data: any[],
    name: string,
    timestamp: string
  ): { buffer: Buffer; filename: string; contentType: string } {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => headers.map(h => item[h] || ''));
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return {
      buffer: Buffer.from(csvContent),
      filename: `${name}-${timestamp}.csv`,
      contentType: 'text/csv',
    };
  }

  private generateExcel(
    data: any[],
    name: string,
    timestamp: string
  ): { buffer: Buffer; filename: string; contentType: string } {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      buffer,
      filename: `${name}-${timestamp}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private generatePDF(
    data: any[],
    name: string,
    timestamp: string
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `${name}-${timestamp}.pdf`,
          contentType: 'application/pdf',
        });
      });

      doc.pipe(stream);

      // Titre
      doc.fontSize(18).text(`Export: ${name}`, { align: 'center' });
      doc.fontSize(12).text(`Généré le: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      const headers = Object.keys(data[0] || []);
      const columnWidth = 120;

      let y = doc.y;
      doc.fontSize(10);

      let x = 30;
      headers.forEach((header) => {
        doc.text(header, x, y, { width: columnWidth });
        x += columnWidth;
      });

      doc.moveDown();
      y = doc.y;

      for (const row of data) {
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 30;
        }

        x = 30;
        headers.forEach((header) => {
          doc.text(String(row[header] || ''), x, y, { width: columnWidth });
          x += columnWidth;
        });

        y = doc.y;
        doc.moveDown();
      }

      doc.end();
    });
  }
}