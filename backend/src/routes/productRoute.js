import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/filter', ProductController.filterProducts);

export default router;