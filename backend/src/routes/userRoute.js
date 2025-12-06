import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.patch('/:userId/verify-otp', UserController.verifyOTP);
router.get('/:userId/profile', UserController.getUserProfile);
router.patch('/:userId/profile', UserController.updateUserProfile);

export default router;