import { body, param } from 'express-validator';

export const createContactMessageValidator = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('subject').notEmpty().withMessage('Le sujet est requis'),
  body('message').notEmpty().withMessage('Le message est requis'),
];

export const replyContactMessageValidator = [
  param('id').isUUID().withMessage('ID de message invalide'),
  body('replyContent').notEmpty().withMessage('Le contenu de la réponse est requis'),
  body('repliedBy').optional().isUUID(),
];