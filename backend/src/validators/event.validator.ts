// src/validators/event.validator.ts
import { body, param } from 'express-validator';

export const createEventValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('eventType').optional().isString(),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601(),
  body('location').optional().isString(),
  body('maxAttendees').optional().isInt({ min: 1 }),
  body('isPaid').optional().isBoolean(),
  body('price').optional().isFloat({ min: 0 }),
  body('imageUrl').optional().isURL(),
];

export const updateEventValidator = [
  param('id').isUUID().withMessage('Invalid event ID'),
  body('title').optional().notEmpty(),
  body('description').optional().isString(),
  body('eventType').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().isString(),
  body('maxAttendees').optional().isInt({ min: 1 }),
  body('isPaid').optional().isBoolean(),
  body('price').optional().isFloat({ min: 0 }),
  body('imageUrl').optional().isURL(),
];

export const registerForEventValidator = [
  param('id').isUUID(),
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').optional().isString(),
];