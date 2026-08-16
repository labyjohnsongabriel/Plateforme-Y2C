// src/services/EmailService.ts
import { mailer } from '@config/mailer';
import { logger } from '@config/logger';
import { env } from '@config/env';

export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) {
        logger.warn(`📧 Welcome email not sent to ${email}: mailer unavailable`);
        return false;
      }
      await mailer.sendTemplatedEmail(email, 'welcome', {
        name,
        content: `
          <p>Bienvenue sur la plateforme Youth Computing !</p>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>Pour commencer, explorez nos formations et événements.</p>
          <p style="text-align:center; margin-top:20px;">
            <a href="${env.FRONTEND_URL}/formations" style="background:#010B40;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Voir les formations</a>
          </p>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  async sendRegistrationConfirmation(email: string, name: string, formation: string, date: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;
      await mailer.sendTemplatedEmail(email, 'registration-confirmation', {
        name,
        content: `
          <h2>Confirmation d'inscription</h2>
          <p>Votre inscription a été confirmée.</p>
          <p><strong>Formation:</strong> ${formation}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p>Nous vous attendons avec impatience !</p>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send registration confirmation to ${email}:`, error);
      return false;
    }
  }

  async sendPaymentConfirmation(email: string, name: string, amount: number, reference: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;
      await mailer.sendTemplatedEmail(email, 'payment-confirmation', {
        name,
        content: `
          <h2>Confirmation de paiement</h2>
          <p>Nous avons bien reçu votre paiement.</p>
          <p><strong>Montant:</strong> ${amount} MGA</p>
          <p><strong>Référence:</strong> ${reference}</p>
          <p>Merci pour votre confiance.</p>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send payment confirmation to ${email}:`, error);
      return false;
    }
  }

  async sendPasswordReset(email: string, name: string, token: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;
      await mailer.sendTemplatedEmail(email, 'reset-password', {
        name,
        content: `
          <h2>Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous :</p>
          <p style="text-align:center; margin-top:20px;">
            <a href="${env.FRONTEND_URL}/reset-password?token=${token}" style="background:#010B40;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Réinitialiser mon mot de passe</a>
          </p>
          <p><small>Ce lien expire dans 15 minutes.</small></p>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  async sendNewsletter(email: string, subject: string, content: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;
      await mailer.sendMail({
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
                .header { background: #010B40; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Youth Computing</h1>
                </div>
                <div class="content">
                  ${content}
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Youth Computing. Tous droits réservés.</p>
                  <p>
                    <a href="${env.FRONTEND_URL}">Site web</a> |
                    <a href="${env.FRONTEND_URL}/unsubscribe">Se désabonner</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send newsletter to ${email}:`, error);
      return false;
    }
  }
}