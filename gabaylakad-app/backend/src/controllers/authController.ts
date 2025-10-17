
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../utils/db';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from '../utils/email';
import crypto from 'crypto';
// ...existing code...
import { blacklistToken, setSession, getSession } from '../utils/redisHelpers';

// Helper to hash refresh tokens for Redis keying
function hashRefreshToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
    // Extract token from Authorization header
    const rawAuthHeader = req.headers['authorization'];
    const token = rawAuthHeader?.split(' ')[1];
    const { refreshToken } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'No token provided for logout.' });
    }
    try {
        await blacklistToken(token, process.env.JWT_SECRET || 'your_secret_key');
        // Blacklist refresh token in Redis
        if (refreshToken) {
            const hashedRefresh = hashRefreshToken(refreshToken);
            await setSession(`refresh:${hashedRefresh}`, '', 1); // expire immediately
        }
        return res.status(200).json({ message: 'Logout successful! Token and refresh token blacklisted.' });
    } catch (err) {
        console.error('[LOGOUT] Error blacklisting token:', err);
        return res.status(500).json({ message: 'Logout failed. Could not blacklist token.', error: err });
    }
};


// Helper to generate refresh token
function generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex');
}


export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log('[LOGIN] Request received:', { email });
    if (!email || !password) {
        const msg = '[LOGIN] Missing email or password';
        console.warn(msg);
        res.setHeader('X-Login-Error', msg);
        return res.status(400).json({ message: 'Please fill in all fields' });
    }
    try {
        const result = await query('SELECT * FROM user WHERE email = ?', [email]);
        const rows = Array.isArray(result.rows) ? result.rows : [];
        console.log('[LOGIN] DB user lookup result:', rows);
        const user = rows[0] as any;
        if (!user) {
            const msg = '[LOGIN] User not found for email: ' + email;
            console.warn(msg);
            res.setHeader('X-Login-Error', msg);
            return res.status(404).json({ message: 'User not found!' });
        }
        if (!user.is_verified) {
            const msg = '[LOGIN] User not verified: ' + email;
            console.warn(msg);
            res.setHeader('X-Login-Error', msg);
            return res.status(401).json({ message: 'Please verify your email before logging in.', token: null });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('[LOGIN] Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            const msg = '[LOGIN] Incorrect password for email: ' + email;
            console.warn(msg);
            res.setHeader('X-Login-Error', msg);
            return res.status(401).json({ message: 'Incorrect password!', token: null });
        }
        const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '10m' });
        const refreshToken = generateRefreshToken();
        // Save refresh token in DB
        await query('UPDATE user SET refresh_token = ? WHERE user_id = ?', [refreshToken, user.user_id]);
        // Store hashed refresh token in Redis with TTL (30 days)
        const hashedRefresh = hashRefreshToken(refreshToken);
        await setSession(`refresh:${hashedRefresh}`, String(user.user_id), 30 * 24 * 60 * 60); // 30 days
        console.log('[LOGIN] JWT token generated:', token);
        console.log('[LOGIN] Refresh token generated:', refreshToken);
        res.setHeader('X-Login-Info', '[LOGIN] JWT token generated');
        return res.status(200).json({ message: 'Login successful!', token, refreshToken });
    } catch (error) {
        console.error('[LOGIN] Error:', error);
        return res.status(500).json({ message: 'Database error occurred', error });
    }
};


// Endpoint to refresh access token
export const handleRefreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Missing refresh token' });
    }
    try {
        const hashedRefresh = hashRefreshToken(refreshToken);
        // Check Redis for valid refresh token
        const userId = await getSession(`refresh:${hashedRefresh}`);
        if (!userId) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        // Optionally, check DB for user existence
        const { rows } = await query('SELECT * FROM user WHERE user_id = ?', [userId]);
        const user = Array.isArray(rows) ? rows[0] as any : undefined;
        if (!user) {
            return res.status(401).json({ message: 'User not found for refresh token' });
        }
        // Rotate refresh token: generate new, update DB, update Redis
        const newRefreshToken = generateRefreshToken();
        await query('UPDATE user SET refresh_token = ? WHERE user_id = ?', [newRefreshToken, user.user_id]);
        const newHashedRefresh = hashRefreshToken(newRefreshToken);
        await setSession(`refresh:${newHashedRefresh}`, String(user.user_id), 30 * 24 * 60 * 60); // 30 days
        // Blacklist old refresh token in Redis (delete session)
        await setSession(`refresh:${hashedRefresh}`, '', 1); // expire immediately
        // Issue new access token
        const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '10m' });
        return res.status(200).json({ token, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(500).json({ message: 'Database error occurred', error });
    }
};


// Register endpoint
export const register = async (req: Request, res: Response) => {
    const {
        firstName,
        lastName,
        fullName,
        email,
        phone_number,
        impairment_level,
        device_id,
        password,
        relationship,
        blind_full_name,
        blind_age,
        blind_phone_number,
    } = req.body;
    const name = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName || !email || !phone_number || !impairment_level || !device_id || !password || !blind_full_name || !blind_age) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    try {
        // Check if device is active (simulate activation check)
        const isActive = true; // Replace with actual activation logic if needed
        if (!isActive) {
            return res.status(403).json({ message: 'Device is not yet activated. Please contact customer service for activation.' });
        }
        // Check if device is already registered to a user
        const deviceUserRes = await query('SELECT * FROM user WHERE device_id = ?', [device_id]);
        const deviceUserRows = Array.isArray(deviceUserRes.rows) ? deviceUserRes.rows : [];
        if (deviceUserRows.length > 0) {
            return res.status(409).json({ message: 'The Device ID you entered already exists. Please check your device manual for the correct Device ID or use a different one.' });
        }
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
        'INSERT INTO user (name, first_name, last_name, email, phone_number, impairment_level, device_id, password, is_verified, verification_code, relationship, blind_full_name, blind_age, blind_phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, firstName, lastName, email, phone_number, impairment_level, device_id, hashedPassword, false, verificationCode, relationship, blind_full_name, blind_age, blind_phone_number]
    );
    const previewUrl = await sendResetEmail(email, verificationCode);
    return res.status(201).json({ message: 'Registration initiated. Please check your email for the verification code.', previewUrl });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Database error occurred', error });
    }
};
// ...existing code for verifyEmail, forgotPassword, resetPassword...

export const verifyEmail = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'Missing email or code' });
    }
    try {
    const result = await query('SELECT * FROM user WHERE email = ?', [email]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const user = rows[0] as any;
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        if (user.is_verified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        if (user.verification_code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
    await query('UPDATE user SET is_verified = ?, verification_code = NULL WHERE email = ?', [true, email]);
        return res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Database error occurred', error });
    }
};

// Helper to hash tokens
function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Forgot password endpoint (request reset)
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || email.trim() === '') {
        console.error('Forgot password error: Missing or invalid email');
        return res.status(400).json({ message: 'If your email exists, you will receive a reset link.' });
    }
    try {
        const result = await query('SELECT * FROM user WHERE email = ?', [email.trim()]);
        const rows = Array.isArray(result.rows) ? result.rows : [];
        const user = rows[0] as any;
        if (!user) {
            console.warn(`Forgot password: No user found for email ${email}`);
            return res.status(200).json({ message: 'If your email exists, you will receive a reset link.' });
        }
        // Generate a secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(rawToken) ?? null;
        const expires = new Date(Date.now() + 15 * 60 * 1000) ?? null; // 15 min
        const userId = user.user_id ?? null;
        // Defensive check for undefined values
        if (hashedToken === undefined || expires === undefined || userId === undefined) {
            console.error('Forgot password: One or more parameters for DB update are undefined', {
                hashedToken, expires, userId
            });
            return res.status(500).json({ message: 'Internal error: missing parameters for password reset.' });
        }
        // Store hashed token and expiry in DB
        await query('UPDATE user SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?', [hashedToken, expires, userId]);
        // Send raw token via email
    const previewUrl = await sendResetEmail(email, rawToken, 'reset');
        return res.status(200).json({ message: 'If your email exists, you will receive a reset link.', previewUrl });
    } catch (error) {
        console.error('Forgot password DB error:', error);
        return res.status(500).json({ message: 'Database error occurred', error });
    }
};

// Reset password endpoint
export const resetPassword = async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: 'Missing token or new password' });
    }
    try {
        const hashedToken = hashToken(resetToken);
        const result = await query('SELECT * FROM user WHERE reset_token = ?', [hashedToken]);
        const rows = Array.isArray(result.rows) ? result.rows : [];
        const user = rows[0] as any;
        if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE user SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?', [hashedPassword, user.user_id]);
        return res.status(200).json({ message: 'Password reset successful!' });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid or expired token', error });
    }
}