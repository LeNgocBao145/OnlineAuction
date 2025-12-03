import express from 'express';
import AdminController from '../controllers/adminController.js';

const router = express.Router();

// User Account Management
router.get('/accounts', AdminController.getUsers);
router.post('/accounts', AdminController.createUser);
router.delete('/accounts/:accountId', AdminController.deleteUser);
router.put('/accounts/:accountId', AdminController.updateUser);

// Category Management
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:categoryId', AdminController.updateCategory);
router.delete('/categories/:categoryId', AdminController.deleteCategory);

// Product Management
router.delete('/products/:productId', AdminController.deleteProduct);

export default router;