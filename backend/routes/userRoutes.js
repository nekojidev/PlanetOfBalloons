import express from 'express';
import {getUsers, getUserById, updateUser, deleteUser, updateUserPassword} from '../controllers/userController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authentication.js';
const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin'), getUsers)
router.get('/:id', authenticateUser, getUserById)
router.patch('/updateUser',authenticateUser, updateUser)
router.delete('/:userId',authenticateUser, deleteUser) 
router.patch('/updateUserPassword',authenticateUser, updateUserPassword)

export default router;






