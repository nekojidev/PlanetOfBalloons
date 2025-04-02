import Announcement from "../models/Announcement.js";

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  const { title, content, image, startDate, endDate } = req.body;

  if (!title || !content || !startDate || !endDate) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const announcement = await Announcement.create({
      title,
      content,
      image,
      startDate,
      endDate,
      isActive: true, // Default to active
    });

    res.status(201).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: "Failed to create announcement", error });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json({ announcements });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements", error });
  }
};

// Get a single announcement by ID
export const getAnnouncementById = async (req, res) => {
  const { id } = req.params;

  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcement", error });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, image, startDate, endDate, isActive } = req.body;

  try {
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, image, startDate, endDate, isActive },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: "Failed to update announcement", error });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete announcement", error });
  }
};