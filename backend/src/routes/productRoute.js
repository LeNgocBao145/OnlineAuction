import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.post('/add', productController.addProduct);
router.post('/:productId/add/images', productController.addImages);
router.post('/:productId/add/description', productController.addDescriptions);

export default router;