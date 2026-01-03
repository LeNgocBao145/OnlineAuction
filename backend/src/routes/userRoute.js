import express from 'express';
import UserController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { transactionMiddleware } from '../middlewares/transactionMiddleware.js';
import { uploadTransactionImage } from '../middlewares/upload/uploadTransactionImage.js';

const router = express.Router();

// Specific routes first to avoid conflict with :userId
router.get('/me', authenticateToken, UserController.authMe);

// Dynamic routes
router.get('/:userId', UserController.getUser);
router.patch('/:userId', UserController.updateUser);
router.post('/:userId/send-otp', UserController.sendOTP);
router.patch('/:userId/verify-otp', UserController.verifyOTP);
router.patch('/:userId/change-password', UserController.changePassword);
router.get('/:userId/favorites', UserController.getFavorites);
router.get('/:userId/ratings', UserController.getRatings);
router.get('/:userId/biddings', UserController.getBiddings);
router.get('/:userId/sellings', UserController.getSellings);
router.get('/:userId/wons', UserController.getWons);
router.post('/:userId/request-to-be-seller', UserController.requestToBeSeller);
router.post('/:userId/rate-seller/:productId', UserController.rateSeller);
router.post('/:userId/favorites/:productId', UserController.markFavorite);
router.delete('/:userId/favorites/:productId', UserController.unmarkFavorite);
router.get('/trade-verifications/:productId', UserController.tradeVerification);
router.get('/trade-verifications/:productId/winner', UserController.getWinner);
router.patch('/trade-verifications/:productId/bidder-submit', uploadTransactionImage.single("invoiceImage"), UserController.bidderSubmission);
router.patch('/trade-verifications/:productId/seller-confirm', UserController.sellerConfirmation);
router.patch('/trade-verifications/:productId/bidder-confirm', UserController.bidderConfirmation);
router.patch('/trade-verifications/:productId/cancel', UserController.tradeCancellation);
router.post('/trade-verifications/:productId/review', UserController.rating);

export default router;