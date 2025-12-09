import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyOTP);
router.get('/google', AuthController.googleLogin);
router.get('/google/callback', AuthController.googleCallback);
router.get('/facebook', AuthController.facebookLogin);
router.get('/facebook/callback', AuthController.facebookCallback);
router.get('/twitter', AuthController.twitterLogin);
router.get('/twitter/callback', AuthController.twitterCallback);
router.post('/complete-oauth-registration', AuthController.completeOAuthRegistration);

export default router;