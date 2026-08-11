import { body } from 'express-validator';
import { ProjectStatus } from '../types/roles.enum';

export const createProjectValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
    .trim(),
  body('objectives')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Objectives must not exceed 1000 characters')
    .trim(),
  body('impact')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Impact must not exceed 1000 characters')
    .trim(),
  body('technologies')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('technologies.*')
    .isString()
    .withMessage('Each technology must be a string')
    .trim()
    .escape(),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 2000 and ${new Date().getFullYear() + 1}`)
    .toInt(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}`),
  body('client')
    .optional()
    .isString()
    .withMessage('Client must be a string')
    .trim()
    .escape(),
  body('projectUrl')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
];

export const updateProjectValidator = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
    .trim(),
  body('objectives')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Objectives must not exceed 1000 characters')
    .trim(),
  body('impact')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Impact must not exceed 1000 characters')
    .trim(),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array'),
  body('technologies.*')
    .optional()
    .isString()
    .withMessage('Each technology must be a string')
    .trim()
    .escape(),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 2000 and ${new Date().getFullYear() + 1}`)
    .toInt(),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}`),
  body('client')
    .optional()
    .isString()
    .withMessage('Client must be a string')
    .trim()
    .escape(),
  body('projectUrl')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
];

export const createMetricValidator = [
  body('metricKey')
    .notEmpty()
    .withMessage('Metric key is required')
    .isString()
    .withMessage('Metric key must be a string')
    .trim()
    .escape(),
  body('metricValue')
    .notEmpty()
    .withMessage('Metric value is required')
    .isString()
    .withMessage('Metric value must be a string')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
];

export const updateMetricValidator = [
  body('metricValue')
    .optional()
    .isString()
    .withMessage('Metric value must be a string')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
];