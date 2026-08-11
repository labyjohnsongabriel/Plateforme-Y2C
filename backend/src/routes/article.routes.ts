import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isEditor, isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createArticleValidator,
  updateArticleValidator,
  createCommentValidator,
} from '../validators/article.validator';

const router = Router();
const articleController = new ArticleController();

// Public routes
router.get(
  '/',
  cacheMiddleware(300),
  articleController.getAll
);

router.get(
  '/published',
  cacheMiddleware(300),
  articleController.getPublished
);

router.get(
  '/stats',
  cacheMiddleware(600),
  articleController.getStats
);

router.get(
  '/most-viewed',
  cacheMiddleware(300),
  articleController.getMostViewed
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  articleController.getBySlug
);

router.get(
  '/id/:id',
  cacheMiddleware(300),
  articleController.getById
);

// Comments (public)
router.post(
  '/comments',
  validate(createCommentValidator),
  articleController.createComment
);

router.get(
  '/:articleId/comments',
  cacheMiddleware(300),
  articleController.getArticleComments
);

// Admin routes
router.post(
  '/',
  authMiddleware,
  isEditor,
  validate(createArticleValidator),
  articleController.create
);

router.put(
  '/:id',
  authMiddleware,
  isEditor,
  validate(updateArticleValidator),
  articleController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  articleController.delete
);

router.patch(
  '/:id/publish',
  authMiddleware,
  isEditor,
  articleController.publish
);

router.patch(
  '/:id/unpublish',
  authMiddleware,
  isEditor,
  articleController.unpublish
);

// Comment management
router.patch(
  '/comments/:id/approve',
  authMiddleware,
  isEditor,
  articleController.approveComment
);

router.delete(
  '/comments/:id',
  authMiddleware,
  isAdmin,
  articleController.deleteComment
);

export default router;