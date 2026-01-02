import express from 'express';
import HomeController from '../controllers/homeController.js';

const router = express.Router();

router.get('/', HomeController.getHomeData);
router.get('/categories', HomeController.getCategories);

export default router;
