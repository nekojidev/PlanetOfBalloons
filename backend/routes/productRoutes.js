import express from 'express'

import {getProducts, getProductById, createProduct, updateProduct, deleteProduct} from '../controllers/productController.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.patch('/updateProduct', updateProduct)
router.delete('/deleteProduct', deleteProduct)





export default router


