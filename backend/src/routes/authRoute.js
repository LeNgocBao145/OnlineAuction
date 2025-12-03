import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;