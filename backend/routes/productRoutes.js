import express from 'express';

import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getPopularProducts,  // Add this import
  toggleProductPopularity  // Add this import
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authentication.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/popular', getPopularProducts); // Fix the route for popular products - ensure it's at the root level, not nested
router.get('/:id', getProductById);

// Admin routes (protected)
router.post('/', authenticateUser, authorizeRoles('admin'), createProduct);
router.patch('/:id', authenticateUser, authorizeRoles('admin'), updateProduct);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteProduct);
router.patch('/toggle-popular/:id', authenticateUser, authorizeRoles('admin'), toggleProductPopularity); // Add this route

export default router;


