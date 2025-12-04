import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.products);
router.post('/add', productController.addProduct);
router.post('/add/images', productController.addImages);
router.post('/add/description', productController.addDescription);

export default router;