import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
// Step 1: nhận thông tin đăng ký + gửi OTP đầu tiên
router.post('/register', AuthController.register);
// Step 1b: resend OTP nếu cần (chỉ cần email, cập nhật OTP mới)
router.post('/send-otp', AuthController.sendOTP);
// Step 2: verify OTP và tạo tài khoản
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;