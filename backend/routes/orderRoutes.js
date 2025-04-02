import express from 'express'

import { getOrders, getOrderById, createOrder, updateOrder, getOrdersUser,handlePaymentCallback } from "../controllers/orderController.js";
import { authenticateUser, authorizeRoles } from '../middleware/authentication.js'
const router = express.Router()

router.get("/", authenticateUser, authorizeRoles('admin'),  getOrders);  // Отримати всі замовлення
router.get('/user/:id',authenticateUser, getOrdersUser) // Отримати замовлення користувача за ID
router.get("/:id",authenticateUser, getOrderById);  // Отримати замовлення за ID
router.post("/", authenticateUser,  createOrder);  // Створити замовлення
router.patch("/updateOrder", authenticateUser, authorizeRoles('admin'), updateOrder);  // Оновити статус замовлення
router.post("/payment-callback", handlePaymentCallback); // Handle LiqPay payment callback




export default router
