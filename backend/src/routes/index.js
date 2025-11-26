import authRouter from './authRoute.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
}