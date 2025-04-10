import Contact from "../models/Contact.js";
import { StatusCodes } from "http-status-codes";

// Create a new contact message
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide all required fields" });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    res.status(StatusCodes.CREATED).json({ 
      contact, 
      message: "Thank you for your message! We'll contact you soon." 
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to save your message", 
      error: error.message 
    });
  }
};

// Get all contact messages (admin only)
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(StatusCodes.OK).json({ contacts });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to fetch contact messages", 
      error: error.message 
    });
  }
};

// Update contact status (admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid status value" });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Contact message not found" });
    }

    res.status(StatusCodes.OK).json({ contact });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to update contact status", 
      error: error.message 
    });
  }
};

// Delete a contact message (admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Contact message not found" });
    }
    
    res.status(StatusCodes.OK).json({ message: "Contact message deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to delete contact message", 
      error: error.message 
    });
  }
};