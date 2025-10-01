import { Request, Response } from 'express';
import { query } from '../utils/db';

export const dashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log('[DASHBOARD] Incoming request. Decoded userId:', userId);
    if (!userId) {
      console.error('[DASHBOARD] Unauthorized: No userId in token. Raw req.user:', req.user);
      res.setHeader('X-Login-Error', '[DASHBOARD] Unauthorized: No userId in token');
      return res.status(401).json({ message: 'Unauthorized', details: 'No userId in token', rawUser: req.user });
    }
    // Get all user fields needed for dashboard
    let userResult;
    try {
      userResult = await query(
        'SELECT user_id, name, first_name, last_name, email, phone_number, impairment_level, device_id, is_verified, created_at, updated_at, relationship, blind_full_name, blind_age, blind_phone_number FROM user WHERE user_id = ?',
        [userId]
      );
    } catch (dbErr) {
      console.error('[DASHBOARD] DB error on user lookup:', dbErr);
      res.setHeader('X-Login-Error', '[DASHBOARD] DB error on user lookup');
      return res.status(500).json({ message: 'Database error', error: dbErr });
    }
    const userRows = Array.isArray(userResult.rows) ? userResult.rows : [];
    const user = userRows[0];
    if (!user) {
      console.error('[DASHBOARD] User not found for userId:', userId);
      res.setHeader('X-Login-Error', '[DASHBOARD] User not found');
      return res.status(404).json({ message: 'User not found', userId });
    }
    (user as any).device_serial_number = (user as any).device_id;
    // Example: Get recent history (limit 5)
  let recent: { action: string; date: string }[] = [];
    try {
      const historyResult = await query('SELECT action, date FROM history WHERE user_id = ? ORDER BY date DESC LIMIT 5', [userId]);
      // Ensure result is always an array of {action, date}
      if (Array.isArray(historyResult.rows)) {
        recent = historyResult.rows.map((row: any) => ({
          action: row.action ?? '',
          date: row.date ?? ''
        }));
      } else {
        recent = [];
      }
    } catch (err) {
      console.warn('[DASHBOARD] History DB error:', err);
      recent = [];
    }
    console.log('[DASHBOARD] Success. Returning dashboard data for userId:', userId);
    res.setHeader('X-Login-Info', '[DASHBOARD] Success');
    res.json({
      message: 'Dashboard data',
      user,
      recent,
      // You can add more fields here if you have them in your DB
      // batteryLevel, location, etc.
    });
  } catch (error) {
    console.error('[DASHBOARD] Unexpected error:', error);
    res.setHeader('X-Login-Error', '[DASHBOARD] Unexpected error');
    res.status(500).json({ message: 'Database error', error });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = await query('SELECT id, fullName AS name, email, phone_number AS phone FROM user WHERE id = ?', [userId]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile data', user });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};


export const history = async (req: Request, res: Response) => {
  // Mock history data
  res.json({
    message: 'History data',
    records: [
      { date: '2025-09-25', action: 'Login' },
      { date: '2025-09-26', action: 'Sensor check' }
    ]
  });
};

export const location = async (req: Request, res: Response) => {
  // Mock location data
  res.json({
    message: 'Location data',
    locations: [
      { lat: 14.5995, lng: 120.9842, timestamp: '2025-09-27T10:00:00Z' }
    ]
  });
};

export const sensor = async (req: Request, res: Response) => {
  // Mock sensor data
  res.json({
    message: 'Sensor data',
    sensors: [
      { type: 'Temperature', value: 36.5, unit: 'C', timestamp: '2025-09-27T10:05:00Z' }
    ]
  });
};
