import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/', ProductController.filterProducts);
router.get('/filter', ProductController.filterProducts);
router.get('/:productId', ProductController.getProductDetails);

export default router;