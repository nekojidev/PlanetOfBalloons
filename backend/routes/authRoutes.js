import express from 'express';
import { registerUser , loginUser, getMe, logoutUser } from '../controllers/authController.js';
// import { protect } from '../middleware/authMiddleware.js';
import { authenticateUser } from '../middleware/authentication.js';

const router = express.Router();

router.post('/register', registerUser )
router.post('/login', loginUser )
router.get('/me', authenticateUser, getMe )
router.get('/logout', logoutUser )

export default router;
