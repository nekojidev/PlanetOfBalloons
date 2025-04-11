import Announcement from "../models/Announcement.js";
import cloudinary from '../config/cloudinary.js';
import {tmpUploadsDir} from '../utils/tmpUploadsDir.js';

// Utility function to handle image upload to Cloudinary using buffer
const uploadImageToCloudinary = async (imageFile, folder = 'planet-of-balloons/announcements') => {
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Validate file type
  if (!imageFile.mimetype.startsWith('image')) {
    throw new Error('Please upload an image file');
  }
  
  // Check file size (limit to 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (imageFile.size > maxSize) {
    throw new Error('Image size should be less than 2MB');
  }
  
  try {
    // Upload directly to Cloudinary using buffer (no file system access needed)
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder,
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      
      uploadStream.end(imageFile.data);
    });
    
    return {
      url: result.secure_url,
      id: result.public_id
    };
  } catch (error) {
    console.error('Error in uploadImageToCloudinary:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  const { title, content, startDate, endDate, isActive } = req.body;
  let { image } = req.body;

  if (!title || !content || !startDate || !endDate) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    let cloudinaryId = '';

    // Handle image upload if a file was provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      
      try {
        const result = await uploadImageToCloudinary(imageFile);
        image = result.url;
        cloudinaryId = result.id;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
      }
    }

    // Handle explicit "no image" request
    if (image === "no-image") {
      image = null;
      cloudinaryId = null;
    }

    const announcement = await Announcement.create({
      title,
      content,
      image,
      cloudinaryId,
      startDate,
      endDate,
      isActive: isActive === undefined ? true : isActive === "true",
    });

    res.status(201).json({ announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
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
  const { title, content, startDate, endDate, isActive } = req.body;
  let { image } = req.body;

  try {
    // Find the existing announcement
    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    let cloudinaryId = existingAnnouncement.cloudinaryId || '';

    // Handle image upload if a file was provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      
      try {
        // Delete old image from Cloudinary if it exists
        if (existingAnnouncement.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(existingAnnouncement.cloudinaryId);
            console.log(`Announcement image ${existingAnnouncement.cloudinaryId} deleted from Cloudinary`);
          } catch (deleteError) {
            console.error('Error deleting old image from Cloudinary:', deleteError);
            // Continue even if deletion fails
          }
        }
        
        const result = await uploadImageToCloudinary(imageFile);
        image = result.url;
        cloudinaryId = result.id;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
      }
    } else if (image === "no-image") {
      // If "no-image" is explicitly specified, remove the image
      if (existingAnnouncement.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(existingAnnouncement.cloudinaryId);
          console.log(`Announcement image ${existingAnnouncement.cloudinaryId} deleted from Cloudinary`);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
          // Continue even if deletion fails
        }
      }
      
      image = null;
      cloudinaryId = null;
    } else if (!image) {
      // If image is not specified at all, keep the existing one
      image = existingAnnouncement.image;
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title: title || existingAnnouncement.title,
        content: content || existingAnnouncement.content,
        image,
        cloudinaryId,
        startDate: startDate || existingAnnouncement.startDate,
        endDate: endDate || existingAnnouncement.endDate,
        isActive: isActive === undefined ? existingAnnouncement.isActive : isActive === "true"
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
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