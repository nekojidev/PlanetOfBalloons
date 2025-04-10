import express from "express";
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  addProductToPromotion
} from "../controllers/promotionController.js";
import { authenticateUser, authorizeRoles } from "../middleware/authentication.js";

const router = express.Router();

// Отримати всі акції
router.get("/", getPromotions);

// Отримати акцію за ID
router.get("/:id", getPromotionById);

// Додати нову акцію (адмін)
router.post("/", authenticateUser, authorizeRoles('admin'),  createPromotion);

// Оновити акцію (адмін)
router.put("/:id", authenticateUser, authorizeRoles('admin'),  updatePromotion);

// Видалити акцію (адмін)
router.delete("/:id",authenticateUser, authorizeRoles('admin') ,deletePromotion);

// Add products to an existing promotion
router.post("/:id/products",authenticateUser, authorizeRoles('admin') , addProductToPromotion);

export default router;
