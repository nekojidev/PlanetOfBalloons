


const uploadImageToCloudinary = async (imageFile) => {
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
    // Import fs and path dynamically if needed
    const fs = await import('fs');
    const path = await import('path');
    
    const tmpUploadsDir = path.default.join(__dirname, 'tmpUploads');
    if (!fs.default.existsSync(tmpUploadsDir)) {
      fs.default.mkdirSync(tmpUploadsDir, { recursive: true });
    }
    const tempFilePath = path.default.join(tmpUploadsDir, `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`);
    
    try {
      // Move the uploaded file to the temp directory
      await imageFile.mv(tempFilePath);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        use_filename: true,
        folder: 'planet-of-balloons/products',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      });
      
      return {
        url: result.secure_url,
        id: result.public_id
      };
    } catch (error) {
      console.error('Error in uploadImageToCloudinary:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    } finally {
      // Clean up - remove the temporary file
      if (fs.default.existsSync(tempFilePath)) {
        fs.default.unlinkSync(tempFilePath);
      }
    }
  };