import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Отримати всі активні оголошення
router.get("/", getAnnouncements);

// Отримати оголошення за ID
router.get("/:id", getAnnouncementById);

// Додати нове оголошення (адмін)
router.post("/", createAnnouncement);

// Оновити оголошення (адмін)
router.patch("/:id", updateAnnouncement);

// Видалити оголошення (адмін)
router.delete("/:id", deleteAnnouncement);

export default router;
