import express from 'express'

import { getCategories, createCategory, updateCategory, deleteCategory,getCategoriesProducts} from '../controllers/categoryController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authentication.js'
const router = express.Router()

router.get('/', getCategories )
router.get('/:id', getCategoriesProducts )
router.post('/',authenticateUser, authorizeRoles('admin'), createCategory )
router.patch('/updateCategory',authenticateUser, authorizeRoles('admin'), updateCategory )
router.delete('/deleteCategory',authenticateUser, authorizeRoles('admin'), deleteCategory )



export default router
