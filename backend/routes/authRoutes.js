import express from 'express';
import { registerUser , loginUser, getMe, logoutUser } from '../controllers/authController.js';
// import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/register', registerUser )
router.post('/login', loginUser )
router.get('/me', getMe )
router.get('/logout', logoutUser )

export default router;
