import { mailer } from '@config/mailer';
import { logger } from '@config/logger';
import { env } from '@config/env';

export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await mailer.sendTemplatedEmail(email, 'welcome', {
        name,
        content: `
          <p>Bienvenue sur la plateforme Youth Computing !</p>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>Pour commencer, explorez nos formations et événements.</p>
          <p>
            <a href="${env.FRONTEND_URL}/formations">Voir les formations</a>
          </p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendRegistrationConfirmation(email: string, name: string, formation: string, date: string): Promise<void> {
    try {
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
    } catch (error) {
      logger.error('Failed to send registration confirmation:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(email: string, name: string, amount: number, reference: string): Promise<void> {
    try {
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
    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
      throw error;
    }
  }

  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    try {
      await mailer.sendTemplatedEmail(email, 'reset-password', {
        name,
        content: `
          <h2>Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous :</p>
          <p>
            <a href="${env.FRONTEND_URL}/reset-password?token=${token}">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien expire dans 15 minutes.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendNewsletter(email: string, subject: string, content: string): Promise<void> {
    try {
      await mailer.sendMail({
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #010B40; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
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
    } catch (error) {
      logger.error('Failed to send newsletter:', error);
      throw error;
    }
  }
}