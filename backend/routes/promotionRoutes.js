import express from "express";
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion
} from "../controllers/promotionController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Отримати всі акції
router.get("/", getPromotions);

// Отримати акцію за ID
router.get("/:id", getPromotionById);

// Додати нову акцію (адмін)
router.post("/", createPromotion);

// Оновити акцію (адмін)
router.patch("/:id", updatePromotion);

// Видалити акцію (адмін)
router.delete("/:id",deletePromotion);

export default router;
