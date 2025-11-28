import express from 'express';
import AdminController from '../controllers/adminController.js';

const router = express.Router();

router.get('/accounts', AdminController.getUsers);
router.post('/addAccount', AdminController.createUser);
router.delete('/:accountId', AdminController.deleteUser);
router.put('/:accountId', AdminController.updateUser);
export default router;