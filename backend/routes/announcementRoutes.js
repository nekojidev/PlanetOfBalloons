import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";
import { authenticateUser, authorizeRoles } from "../middleware/authentication.js";
const router = express.Router();

// Отримати всі активні оголошення
router.get("/", getAnnouncements);

// Отримати оголошення за ID
router.get("/:id", getAnnouncementById);

// Додати нове оголошення (адмін)
router.post("/",authenticateUser, authorizeRoles('admin'), createAnnouncement);

// Оновити оголошення (адмін)
router.patch("/:id",authenticateUser, authorizeRoles('admin'), updateAnnouncement);

// Видалити оголошення (адмін)
router.delete("/:id",authenticateUser, authorizeRoles('admin'), deleteAnnouncement);

export default router;
