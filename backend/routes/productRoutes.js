import express from 'express'

import {getProducts, getProductById, createProduct, updateProduct, deleteProduct} from '../controllers/productController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authentication.js'
const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', authenticateUser, authorizeRoles('admin'),  createProduct)
router.patch('/:id',authenticateUser, authorizeRoles('admin'), updateProduct)
router.delete('/deleteProduct',authenticateUser, authorizeRoles('admin'), deleteProduct)





export default router


