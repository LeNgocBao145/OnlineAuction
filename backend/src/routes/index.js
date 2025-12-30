import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
import productRouter from './productRoute.js';
import userRouter from './userRoute.js';
import homeRouter from './homeRoute.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'

export default function route(app) {
    app.use('/api', homeRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/products', productRouter);
    app.use('/api/admins', authenticateToken, adminRouter);
    app.use('/api/users', authenticateToken, userRouter);
}