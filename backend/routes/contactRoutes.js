import express from "express";
import {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact
} from "../controllers/contactController.js";
import { authenticateUser, authorizeRoles } from "../middleware/authentication.js";

const router = express.Router();

// Public route - anyone can submit a contact form
router.post("/", createContact);

// Admin routes - protected
router.get("/", authenticateUser, authorizeRoles('admin'), getContacts);
router.patch("/:id", authenticateUser, authorizeRoles('admin'), updateContactStatus);
router.delete("/:id", authenticateUser, authorizeRoles('admin'), deleteContact);

export default router;