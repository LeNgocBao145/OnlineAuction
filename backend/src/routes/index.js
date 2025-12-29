import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
import homeRouter from './homeRoute.js';
import userRouter from './userRoute.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export default function route(app) {
    app.use('/api', homeRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);
    //app.use(authenticateToken);
    app.use('/api/admins', adminRouter);
}