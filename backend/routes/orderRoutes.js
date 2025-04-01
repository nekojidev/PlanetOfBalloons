import express from 'express'

import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from "../controllers/orderController.js";

const router = express.Router()

router.get("/",  getOrders);  // Отримати всі замовлення
router.get("/:id", getOrderById);  // Отримати замовлення за ID
router.post("/", createOrder);  // Створити замовлення
router.patch("/updateOrder", updateOrder);  // Оновити статус замовлення
router.delete("/deleteOrder", deleteOrder);  // Видалити замовлення




export default router
