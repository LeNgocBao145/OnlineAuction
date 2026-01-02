import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
import productRouter from './productRoute.js';
import userRouter from './userRoute.js';
import homeRouter from './homeRoute.js';
import categoryRouter from './categoryRoute.js';
import messageRouter from './messageRoute.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'

export default function route(app) {
    app.use('/api', homeRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/categories', categoryRouter);
    app.use('/api/products', productRouter);
    app.use('/api/admins', authenticateToken, adminRouter);
    app.use('/api/users', authenticateToken, userRouter);
    app.use('/api/messages', authenticateToken, messageRouter);
}