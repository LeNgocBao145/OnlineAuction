import express from 'express';
import BidderController from '../controllers/bidderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/favorites', BidderController.getFavorites);
router.post('/favorites/:productId', BidderController.markFavorite);
router.delete('/favorites/:productId', BidderController.unmarkFavorite);

export default router;