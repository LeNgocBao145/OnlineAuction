import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access token is required' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }

            // Set user info to request
            req.user = {
                id: decoded.userId
            };

            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const optionalAuthenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // If token is present but invalid, we still continue but without user info
                return next();
            }

            req.user = {
                id: decoded.userId
            };
            next();
        });
    } catch (error) {
        next();
    }
};