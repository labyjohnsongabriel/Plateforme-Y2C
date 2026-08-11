import { body, param, query } from 'express-validator';
import { RegistrationStatus, PaymentStatus } from '../types/roles.enum';

export const createRegistrationValidator = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('motivation')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Motivation must not exceed 1000 characters')
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(Object.values(RegistrationStatus))
    .withMessage(`Status must be one of: ${Object.values(RegistrationStatus).join(', ')}`),
  body('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Payment status must be one of: ${Object.values(PaymentStatus).join(', ')}`),
  body('paymentAmount')
    .optional()
    .isNumeric()
    .withMessage('Payment amount must be a number')
    .toFloat(),
  body('paymentReference')
    .optional()
    .isString()
    .withMessage('Payment reference must be a string')
    .trim()
    .escape(),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .trim()
    .escape(),
];

export const updateRegistrationValidator = [
  body('status')
    .optional()
    .isIn(Object.values(RegistrationStatus))
    .withMessage(`Status must be one of: ${Object.values(RegistrationStatus).join(', ')}`),
  body('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Payment status must be one of: ${Object.values(PaymentStatus).join(', ')}`),
  body('paymentAmount')
    .optional()
    .isNumeric()
    .withMessage('Payment amount must be a number')
    .toFloat(),
  body('paymentReference')
    .optional()
    .isString()
    .withMessage('Payment reference must be a string')
    .trim()
    .escape(),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
    .trim()
    .escape(),
];

export const registrationIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid registration ID format'),
];

export const registrationFilterValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('status')
    .optional()
    .isIn(Object.values(RegistrationStatus))
    .withMessage(`Status must be one of: ${Object.values(RegistrationStatus).join(', ')}`),
  query('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Payment status must be one of: ${Object.values(PaymentStatus).join(', ')}`),
  query('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  query('formationId')
    .optional()
    .isUUID()
    .withMessage('Formation ID must be a valid UUID'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim()
    .escape(),
];

export default {
  createRegistrationValidator,
  updateRegistrationValidator,
  registrationIdValidator,
  registrationFilterValidator,
};