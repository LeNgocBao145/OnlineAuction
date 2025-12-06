import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId/favorites', UserController.getFavorites);
router.post('/:userId/favorites/:productId', UserController.markFavorite);
router.delete('/:userId/favorites/:productId', UserController.unmarkFavorite);

export default router;