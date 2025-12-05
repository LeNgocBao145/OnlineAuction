import express from 'express';
import UserController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/favorites', UserController.getFavorites);
router.post('/favorites/:productId', UserController.markFavorite);
router.delete('/favorites/:productId', UserController.unmarkFavorite);

export default router;