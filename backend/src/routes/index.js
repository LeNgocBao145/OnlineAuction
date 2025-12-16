import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
import userRouter from './userRoute.js';
import productRouter from './productRoute.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/admins', adminRouter);
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
}