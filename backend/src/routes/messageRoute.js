import express from 'express';
import MessageController from '../controllers/MessageController.js';

const router = express.Router();

router.post('/', MessageController.sendMessage);
router.get('/:productId', MessageController.getMessages);

export default router;