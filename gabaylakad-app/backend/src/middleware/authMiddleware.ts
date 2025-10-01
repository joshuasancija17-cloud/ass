declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'your_secret_key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const rawAuthHeader = req.headers['authorization'];
    console.log('[AUTH MIDDLEWARE] Raw Authorization header:', rawAuthHeader);
    const token = rawAuthHeader?.split(' ')[1];
    console.log('[AUTH MIDDLEWARE] Extracted token:', token);
    if (!token) {
        console.warn('[AUTH MIDDLEWARE] No token provided');
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    jwt.verify(token, secretKey, (err: any, user: any) => {
        if (err) {
            console.error('[AUTH MIDDLEWARE] JWT verification error:', err);
            return res.status(403).json({ message: 'Unauthorized: Invalid or expired token', error: err });
        }
        req.user = user;
        // Issue a new token with a fresh expiry (sliding expiration)
        const newToken = jwt.sign({ userId: user.userId, email: user.email }, secretKey, { expiresIn: '10m' });
        res.setHeader('X-Refreshed-Token', newToken);
        console.log('[AUTH MIDDLEWARE] JWT verified, user:', user, 'New token issued');
        next();
    });
};

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.sendStatus(403);
        }
        next();
    };
};