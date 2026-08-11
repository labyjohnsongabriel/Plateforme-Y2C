import { ProjectRepository } from '../repositories/project.repository';
import { ProjectMetricRepository } from '../repositories/projectMetric.repository';
import { CreateProjectDTO, UpdateProjectDTO, CreateProjectMetricDTO } from '../types/dto/project.dto';
import { ApiError } from '../utils/ApiError';
import { Project } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private metricRepository: ProjectMetricRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.metricRepository = new ProjectMetricRepository();
  }

  async findAll(params?: any): Promise<Project[]> {
    return this.projectRepository.findMany(params);
  }

  async findById(id: string): Promise<Project> {
    return this.projectRepository.findByIdOrThrow(id);
  }

  async create(data: CreateProjectDTO): Promise<Project> {
    const slug = await generateUniqueSlug(data.title, this.projectRepository, 'slug');
    return this.projectRepository.create({
      ...data,
      slug,
      status: data.status || 'PLANNING',
    });
  }

  async update(id: string, data: UpdateProjectDTO): Promise<Project> {
    const project = await this.projectRepository.findByIdOrThrow(id);
    let slug = project.slug;
    if (data.title && data.title !== project.title) {
      slug = await generateUniqueSlug(data.title, this.projectRepository, 'slug');
    }
    return this.projectRepository.update(id, { ...data, slug });
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async getBySlug(slug: string): Promise<Project | null> {
    return this.projectRepository.findBySlug(slug);
  }

  async getFeatured(): Promise<Project[]> {
    return this.projectRepository.findFeatured();
  }

  async getByCategory(category: string): Promise<Project[]> {
    return this.projectRepository.findByCategory(category);
  }

  async getByYear(year: number): Promise<Project[]> {
    return this.projectRepository.findByYear(year);
  }

  async searchProjects(search: string): Promise<Project[]> {
    return this.projectRepository.searchProjects(search);
  }

  async getStats() {
    return this.projectRepository.getStats();
  }

  async getProjectsWithMetrics(id: string): Promise<Project | null> {
    return this.projectRepository.findWithMetrics(id);
  }

  // ============ METRICS ============
  async addMetric(projectId: string, data: CreateProjectMetricDTO): Promise<any> {
    await this.projectRepository.findByIdOrThrow(projectId);
    // ✅ Utilisation de la relation Prisma
    return this.metricRepository.create({
      ...data,
      project: {
        connect: { id: projectId }
      }
    });
  }

  async updateMetric(id: string, data: Partial<CreateProjectMetricDTO>): Promise<any> {
    return this.metricRepository.update(id, data);
  }

  async deleteMetric(id: string): Promise<void> {
    await this.metricRepository.delete(id);
  }

  async getProjectMetrics(projectId: string): Promise<any[]> {
    return this.metricRepository.findByProject(projectId);
  }

  toDTO(project: Project): any {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      objectives: project.objectives,
      impact: project.impact,
      technologies: project.technologies,
      images: project.images,
      year: project.year,
      category: project.category,
      isFeatured: project.isFeatured,
      status: project.status,
      client: project.client,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}