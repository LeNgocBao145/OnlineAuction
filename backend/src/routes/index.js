import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
<<<<<<< HEAD
import userRouter from './userRoute.js';
import productRouter from './productRoute.js';
import homeRouter from './homeRoute.js';
=======
import productRouter from './productRoute.js';
import userRouter from './userRoute.js';
import homeRouter from './homeRoute.js';
import messageRouter from './messageRoute.js';
>>>>>>> c46e0db9a330a97c3badd20fe063b55337c8a7c2
import { authenticateToken } from '../middlewares/authMiddleware.js'

export default function route(app) {
    app.use('/api', homeRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/products', productRouter);
<<<<<<< HEAD

    app.use('/api/admins', authenticateToken, adminRouter);
    app.use('/api/users', authenticateToken, userRouter);
=======
    app.use('/api/admins', authenticateToken, adminRouter);
    app.use('/api/users', userRouter);
    app.use('/api/messages', authenticateToken, messageRouter);
>>>>>>> c46e0db9a330a97c3badd20fe063b55337c8a7c2
}