import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.listProducts);
router.post('/add', productController.addProduct);
router.post('/:productId/add/description', productController.addDescription);
router.post('/:productId/refuse', productController.refuse);

export default router;