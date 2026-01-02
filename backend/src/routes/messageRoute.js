import express from 'express';
import MessageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/', MessageController.sendMessage);
router.get('/:productId', MessageController.getMessages);

export default router;