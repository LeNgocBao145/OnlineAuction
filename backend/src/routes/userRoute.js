import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.patch('/:userId', UserController.updateUser);
router.patch('/:userId/verify-otp', UserController.verifyOTP);

export default router;