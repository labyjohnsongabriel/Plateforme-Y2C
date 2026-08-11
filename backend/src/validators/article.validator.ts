import { body } from 'express-validator';
import { ArticleStatus } from '../types/roles.enum';

export const createArticleValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters')
    .trim()
    .escape(),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(Object.values(ArticleStatus))
    .withMessage(`Status must be one of: ${Object.values(ArticleStatus).join(', ')}`),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
];

export const updateArticleValidator = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters')
    .trim()
    .escape(),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(Object.values(ArticleStatus))
    .withMessage(`Status must be one of: ${Object.values(ArticleStatus).join(', ')}`),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
];

export const createCommentValidator = [
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
  body('authorName')
    .notEmpty()
    .withMessage('Author name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('authorEmail')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters')
    .trim()
    .escape(),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
];

export const updateCommentValidator = [
  body('content')
    .optional()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters')
    .trim()
    .escape(),
  body('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean')
    .toBoolean(),
];