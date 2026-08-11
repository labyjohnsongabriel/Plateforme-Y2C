import { body, param } from 'express-validator';

// ─── CANDIDATURES ──────────────────────────────────────────

export const createCandidatureValidator = [
  body('recruitmentId').isUUID().withMessage('ID de recrutement invalide'),
  body('fullName').notEmpty().withMessage('Le nom complet est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').optional().isString(),
  body('coverLetter').optional().isString(),
  body('resumeUrl').optional().isURL().withMessage('URL du CV invalide'),
  body('linkedinUrl').optional().isURL(),
  body('portfolioUrl').optional().isURL(),
  body('experience').optional().isString(),
  body('education').optional().isString(),
  body('skills').optional().isString(),
  body('status').optional().isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED']),
];

export const updateCandidatureValidator = [
  param('id').isUUID().withMessage('ID de candidature invalide'),
  body('fullName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('coverLetter').optional().isString(),
  body('resumeUrl').optional().isURL(),
  body('linkedinUrl').optional().isURL(),
  body('portfolioUrl').optional().isURL(),
  body('experience').optional().isString(),
  body('education').optional().isString(),
  body('skills').optional().isString(),
  body('status').optional().isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED']),
];

// ─── INTERVIEWS ──────────────────────────────────────────

export const createInterviewValidator = [
  param('id').isUUID().withMessage('ID de candidature invalide'),
  body('scheduledAt').isISO8601().withMessage('Date et heure de l\'entretien requises'),
  body('duration').optional().isInt({ min: 5, max: 120 }),
  body('location').optional().isString(),
  body('interviewType').optional().isIn(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL']),
  body('notes').optional().isString(),
  body('interviewers').optional().isArray(),
];

// ─── EVALUATIONS ──────────────────────────────────────────

export const createEvaluationValidator = [
  param('id').isUUID().withMessage('ID de candidature invalide'),
  body('criteria').notEmpty().withMessage('Le critère d\'évaluation est requis'),
  body('score').isInt({ min: 1, max: 10 }).withMessage('Le score doit être entre 1 et 10'),
  body('comment').optional().isString(),
  body('evaluatorId').optional().isUUID(),
];