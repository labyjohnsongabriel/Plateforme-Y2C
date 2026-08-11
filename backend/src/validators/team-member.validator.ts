import { body, param } from 'express-validator';

export const createTeamMemberValidator = [
  body('userId').isUUID().withMessage('ID utilisateur invalide'),
  body('role').optional().isString(),
  body('department').optional().isString(),
  body('bio').optional().isString(),
  body('photoUrl').optional().isURL(),
  body('linkedin').optional().isURL(),
  body('displayOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

export const updateTeamMemberValidator = [
  param('id').isUUID().withMessage('ID de membre invalide'),
  body('role').optional().isString(),
  body('department').optional().isString(),
  body('bio').optional().isString(),
  body('photoUrl').optional().isURL(),
  body('linkedin').optional().isURL(),
  body('displayOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
];