import prisma from '../../prisma/client';
import { ApiError } from '../utils/ApiError';
import { SettingsGroup } from '../types/dto/setting.dto';
import { logger } from '../config/logger';

export class SettingService {
  private defaultSettings: SettingsGroup = {
    general: {
      siteName: 'Youth Computing',
      siteUrl: 'https://youthcomputing.mg',
      siteDescription: 'Association pour la promotion des NTIC à Madagascar',
      contactEmail: 'contact@youthcomputing.mg',
      contactPhone: '+261 34 00 000 00',
      address: 'Antananarivo, Madagascar',
      maintenanceMode: false,
      allowRegistration: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      twoFactorAuth: false,
      sslRequired: true,
      sessionIpCheck: true,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'contact@youthcomputing.mg',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: 'contact@youthcomputing.mg',
      fromName: 'Youth Computing',
      replyTo: 'contact@youthcomputing.mg',
    },
    backup: {
      autoBackup: true,
      backupFrequency: 24,
      backupRetention: 30,
      backupStorage: '/backups/youthcomputing/',
    },
    public: {
      allowPublicRegistration: true,
      showStatsOnHome: true,
      defaultLanguage: 'fr',
    },
  };

  // ─── Initialisation ──────────────────────────────────────────────
  async initializeSettings(): Promise<void> {
    try {
      const count = await prisma.setting.count();
      if (count === 0) {
        logger.info('🔧 Initialisation des paramètres par défaut...');
        const entries = this.flattenSettings(this.defaultSettings);
        for (const [key, value] of Object.entries(entries)) {
          const [group] = key.split('.');
          const isPublic = group === 'public';
          await prisma.setting.create({
            data: {
              key,
              value,
              group,
              label: this.getLabel(key),
              description: this.getDescription(key),
              isPublic,
            },
          });
        }
        logger.info('✅ Paramètres initialisés');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation des paramètres:', error);
    }
  }

  private flattenSettings(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flattenSettings(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }

  private getLabel(key: string): string {
    const labels: Record<string, string> = {
      'general.siteName': 'Nom du site',
      'general.siteUrl': 'URL du site',
      'general.siteDescription': 'Description du site',
      'general.contactEmail': 'Email de contact',
      'general.contactPhone': 'Téléphone de contact',
      'general.address': 'Adresse',
      'general.maintenanceMode': 'Mode maintenance',
      'general.allowRegistration': 'Inscriptions autorisées',
      'security.sessionTimeout': 'Durée de session',
      'security.maxLoginAttempts': 'Tentatives max',
      'security.passwordMinLength': 'Longueur min mot de passe',
      'security.twoFactorAuth': 'Authentification 2FA',
      'security.sslRequired': 'SSL requis',
      'security.sessionIpCheck': 'Vérification IP',
      'email.smtpHost': 'Hôte SMTP',
      'email.smtpPort': 'Port SMTP',
      'email.smtpUser': 'Utilisateur SMTP',
      'email.smtpPassword': 'Mot de passe SMTP',
      'email.smtpSecure': 'TLS/SSL',
      'email.fromEmail': 'Email expéditeur',
      'email.fromName': 'Nom expéditeur',
      'email.replyTo': 'Répondre à',
      'backup.autoBackup': 'Sauvegarde automatique',
      'backup.backupFrequency': 'Fréquence (heures)',
      'backup.backupRetention': 'Conservation (jours)',
      'backup.backupStorage': 'Emplacement de stockage',
      'public.allowPublicRegistration': 'Inscriptions publiques',
      'public.showStatsOnHome': 'Afficher les stats sur la page d\'accueil',
      'public.defaultLanguage': 'Langue par défaut',
    };
    return labels[key] || key.split('.').pop() || key;
  }

  private getDescription(key: string): string {
    const descriptions: Record<string, string> = {
      'general.siteName': 'Nom affiché dans le header et les emails',
      'general.siteUrl': 'URL publique du site',
      'general.contactEmail': 'Adresse email pour les contacts',
      'security.sessionTimeout': 'Durée d\'inactivité avant déconnexion',
      'security.maxLoginAttempts': 'Nombre de tentatives avant blocage',
      'email.smtpHost': 'Serveur d\'envoi des emails',
      'email.smtpPort': 'Port du serveur SMTP',
      'public.allowPublicRegistration': 'Autoriser les inscriptions publiques sur le site',
      'public.showStatsOnHome': 'Afficher les statistiques sur la page d\'accueil',
    };
    return descriptions[key] || '';
  }

  // ─── Récupérer tous les paramètres (admin) ──────────────────
  async getAllSettings(): Promise<SettingsGroup> {
    const settings = await prisma.setting.findMany();
    const grouped: any = {};

    for (const setting of settings) {
      const [group, ...rest] = setting.key.split('.');
      const key = rest.join('.');
      if (!grouped[group]) grouped[group] = {};
      grouped[group][key] = setting.value;
    }

    // Fusion avec les valeurs par défaut
    const result = { ...this.defaultSettings };
    for (const [group, values] of Object.entries(grouped)) {
      if (result[group as keyof SettingsGroup]) {
        // ✅ Correction : utiliser Object.assign au lieu du spread
        Object.assign(result[group as keyof SettingsGroup], values);
      }
    }
    return result;
  }

  // ─── Récupérer un groupe spécifique (admin) ──────────────────
  async getGroup(group: string): Promise<Record<string, any>> {
    const settings = await prisma.setting.findMany({
      where: { group },
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      const key = setting.key.replace(`${group}.`, '');
      result[key] = setting.value;
    }

    // Fusionner avec les valeurs par défaut
    const defaultGroup = this.defaultSettings[group as keyof SettingsGroup];
    if (defaultGroup) {
      for (const [key, value] of Object.entries(defaultGroup)) {
        if (!(key in result)) {
          result[key] = value;
        }
      }
    }

    return result;
  }

  // ─── Récupérer les paramètres publics ────────────────────────
  async getPublicSettings(): Promise<Record<string, any>> {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
    });
    const result: Record<string, any> = {};
    for (const setting of settings) {
      const [, ...rest] = setting.key.split('.');
      const key = rest.join('.') || setting.key;
      result[key] = setting.value;
    }
    return result;
  }

  // ─── Mettre à jour un groupe ──────────────────────────────────
  async updateGroup(group: string, data: any): Promise<void> {
    const entries = this.flattenSettings(data, group);
    for (const [key, value] of Object.entries(entries)) {
      const isPublic = group === 'public';
      await prisma.setting.upsert({
        where: { key },
        update: { value, isPublic },
        create: {
          key,
          value,
          group,
          label: this.getLabel(key),
          description: this.getDescription(key),
          isPublic,
        },
      });
    }
  }

  // ─── Récupérer un paramètre par clé ──────────────────────────
  async getSetting(key: string, requireAuth: boolean = false): Promise<any> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    if (!setting) {
      const [group, ...rest] = key.split('.');
      const defaultGroup = this.defaultSettings[group as keyof SettingsGroup];
      if (defaultGroup && rest.length > 0) {
        const value = this.getNestedValue(defaultGroup, rest.join('.'));
        if (value !== undefined) return value;
      }
      throw ApiError.notFound(`Paramètre ${key} introuvable`);
    }
    if (requireAuth && !setting.isPublic) {
      throw ApiError.unauthorized('Accès non autorisé');
    }
    return setting.value;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }

  // ─── Réinitialiser ────────────────────────────────────────────
  async resetSettings(): Promise<void> {
    await prisma.setting.deleteMany();
    await this.initializeSettings();
  }

  // ─── Helper : obtenir une valeur ─────────────────────────────
  async getValue<T>(key: string, defaultValue?: T, requireAuth: boolean = false): Promise<T> {
    try {
      const value = await this.getSetting(key, requireAuth);
      return value as T;
    } catch {
      return defaultValue as T;
    }
  }
}