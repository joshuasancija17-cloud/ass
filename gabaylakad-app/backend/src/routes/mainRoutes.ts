import { Router } from 'express';
import { dashboard, profile, updateProfile, history, location, sensor } from '../controllers/mainController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', authenticateToken, dashboard);
router.get('/profile', authenticateToken, profile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/history', authenticateToken, history);
router.get('/location', authenticateToken, location);
router.get('/sensor', authenticateToken, sensor);

export default router;
