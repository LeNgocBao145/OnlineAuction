import express from 'express';
import AdminController from '../controllers/adminController.js';

const router = express.Router();

router.get('/accounts', AdminController.getUsers);
router.post('/addAccount', AdminController.createUser);
router.delete('/:accountId', AdminController.deleteUser);
router.put('/:accountId', AdminController.updateUser);

// Product Management
router.delete('/products/:productId', AdminController.deleteProduct);

export default router;