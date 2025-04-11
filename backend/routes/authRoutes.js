import express from 'express';
const router = express.Router();

import { 
  registerUser, 
  loginUser, 
  getMe, 
  logoutUser,
  checkAuthStatus
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authentication.js';

router.post('/register', registerUser )
router.post('/login', loginUser )
router.get('/me', authenticateUser, getMe )
router.post('/logout', logoutUser )
router.get('/check-auth', authenticateUser, checkAuthStatus)

export default router;
