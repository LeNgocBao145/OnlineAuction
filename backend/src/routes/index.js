import authRouter from './authRoute.js';
import adminRouter from './adminRoute.js';
import bidderRouter from './bidderRoute.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/admins', adminRouter);
    app.use('/api/bidders', bidderRouter);
}