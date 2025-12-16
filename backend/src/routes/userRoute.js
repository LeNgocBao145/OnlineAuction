import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId', UserController.getUser);
router.patch('/:userId', UserController.updateUser);
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

export default router;