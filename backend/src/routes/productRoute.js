import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/:productId', ProductController.getProductDetails);

export default router;