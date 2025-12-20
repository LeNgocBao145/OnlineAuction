import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.post('/add', productController.addProduct);
router.post('/:productId/add/description', productController.addDescription);

export default router;