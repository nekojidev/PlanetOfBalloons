import express from 'express'

import { getCategories, createCategory, updateCategory, deleteCategory,getCategoriesProducts} from '../controllers/categoryController.js'

const router = express.Router()

router.get('/', getCategories )
router.get('/:id', getCategoriesProducts )
router.post('/', createCategory )
router.patch('/updateCategory', updateCategory )
router.delete('/deleteCategory', deleteCategory )



export default router
