import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/', ProductController.filterProducts);
router.get('/filter', ProductController.filterProducts);
router.get('/:productId', ProductController.getProductDetails);
router.post('/:productId/ask/:userId', ProductController.askQuestion);
router.post('/:productId/:questionId/answer/:answererId', ProductController.answerQuestion);

export default router;