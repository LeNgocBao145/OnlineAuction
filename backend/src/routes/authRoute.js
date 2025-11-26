import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.post('/register', AuthController.register);

export default router;