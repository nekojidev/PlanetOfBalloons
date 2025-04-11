import cloudinary from '../config/cloudinary.js';

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
  }
  
  try {
    // Use a promise to properly handle the stream upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: 'planet-of-balloons/products',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      }, (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        return resolve({
          url: result.secure_url,
          id: result.public_id
        });
      });
      
      // Feed the buffer to the upload stream
      uploadStream.end(imageFile.data);
    });
  } catch (error) {
    console.error('Error in uploadImageToCloudinary:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

export default uploadImageToCloudinary;