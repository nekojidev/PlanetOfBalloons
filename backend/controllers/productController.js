import Product from '../models/Product.js';
import Category from '../models/Category.js';

import cloudinary from '../config/cloudinary.js';
import {tmpUploadsDir} from '../utils/tmpUploadsDir.js';
import { log } from 'console';


export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await Product.find({ deleted: { $ne: true } }) // Exclude deleted products
      .populate('category', 'name description')
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId }).populate(
      'category',
      'name description'
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If the product is deleted, add a note in the response
    if (product.deleted) {
      product._doc.deletedNote = "This product has been removed from the catalog but is preserved for order history.";
    }
    
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error });
  }
};

// Add this new function to get popular products
export const getPopularProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query; // Default to 8 popular products
    const popularProducts = await Product.find({ 
      popular: true,
      deleted: { $ne: true } // Exclude deleted products
    })
      .populate('category', 'name description')
      .limit(parseInt(limit));
    res.status(200).json({ products: popularProducts });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({ message: 'Failed to fetch popular products', error });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, cloudinaryId, category, stock, popular = false } = req.body;
    // Added popular flag with default false
    
    // For image, check if it's a string in req.body or a file in req.files
    let imageData = req.body.image || null;
    let imageFile = null;
    
    if (req.files && req.files.image) {
      imageFile = req.files.image;
      // Don't assign to imageData yet - we'll upload it to Cloudinary first
    }
    
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    let finalImageUrl = imageData;
    let finalCloudinaryId = cloudinaryId;
    
    // Handle file upload if present
    if (imageFile) {
      try {
        // Use the new uploadImageToCloudinary function instead of creating temp files
        const result = await uploadImageToCloudinary(imageFile);
        finalImageUrl = result.url;
        finalCloudinaryId = result.id;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
      }
    } else if (finalImageUrl && typeof finalImageUrl === 'string' && !finalCloudinaryId) {
      // Handle string URL - generate cloudinaryId if it's a Cloudinary URL
      if (finalImageUrl.includes('cloudinary.com')) {
        const urlParts = finalImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0]; // Get filename without extension
        finalCloudinaryId = `planet-of-balloons/products/${fileName}`;
      } else {
        // Generate a unique id based on timestamp and random string
        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substring(2, 10);
        finalCloudinaryId = `planet-of-balloons/products/product_${timestamp}_${randomStr}`;
      }
    }
    
    // Create the product with the image URL and cloudinaryId
    const product = await Product.create({
      name,
      description,
      price,
      image: finalImageUrl,
      cloudinaryId: finalCloudinaryId,
      category,
      stock,
      popular, // Include the popular flag
    });
    
    categoryExists.products.push(product._id);
    await categoryExists.save();
    
    res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, cloudinaryId, stock, image, popular } = req.body;
    
    const { id } = req.params;

    if (!id || !name || !description || !price || !category || !stock) {
      return res
        .status(400)
        .json({ message: 'Please provide id, name, description, price, category and stock' });
    }

    // Fetch the old product before updating
    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload if there's a file
    let finalImageUrl = image || oldProduct.image;
    let finalCloudinaryId = cloudinaryId || oldProduct.cloudinaryId;
    
    if (req.files && req.files.image) {
      try {
        // Delete old image if it exists
        if (oldProduct.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(oldProduct.cloudinaryId);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
          }
        }
        
        // Upload new image using our direct upload function
        const result = await uploadImageToCloudinary(req.files.image);
        finalImageUrl = result.url;
        finalCloudinaryId = result.id;
      } catch (uploadError) {
        return res.status(400).json({ message: uploadError.message });
      }
    } 
    // If string image URL changed but no new cloudinaryId provided
    else if (image && image !== oldProduct.image && !cloudinaryId && typeof image === 'string') {
      if (image.includes('cloudinary.com')) {
        const urlParts = image.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        finalCloudinaryId = `planet-of-balloons/products/${fileName}`;
      } else {
        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substring(2, 10);
        finalCloudinaryId = `planet-of-balloons/products/product_${timestamp}_${randomStr}`;
      }
      
      // Delete old image if it changed and exists in Cloudinary
      if (oldProduct.cloudinaryId && finalCloudinaryId !== oldProduct.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(oldProduct.cloudinaryId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        image: finalImageUrl,
        cloudinaryId: finalCloudinaryId,
        category,
        stock,
        popular: popular !== undefined ? popular : oldProduct.popular, // Update popular status if provided
      },
      { new: true }
    );

    // Update category relationships if needed
    if (oldProduct.category.toString() !== category) {
      // Remove the product from the old category
      const oldCategory = await Category.findById(oldProduct.category);
      if (oldCategory) {
        oldCategory.products = oldCategory.products.filter(
          (productId) => productId.toString() !== id
        );
        await oldCategory.save();
      }

      // Add the product to the new category
      const newCategory = await Category.findById(category);
      if (newCategory) {
        newCategory.products.push(id);
        await newCategory.save();
      }
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

// Function to toggle product popularity
export const toggleProductPopularity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.popular = !product.popular;
    await product.save();
    
    res.status(200).json({ 
      success: true, 
      popular: product.popular, 
      message: `Product marked as ${product.popular ? 'popular' : 'not popular'}`
    });
  } catch (error) {
    console.error('Error toggling product popularity:', error);
    res.status(500).json({ message: 'Failed to update product popularity', error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Please provide id' });
    }
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product image from Cloudinary if exists
    if (product.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryId);
        console.log(`Product image ${product.cloudinaryId} deleted from Cloudinary`);
      } catch (cloudinaryError) {
        console.error('Error deleting product image from Cloudinary:', cloudinaryError);
        // Continue even if deletion fails
      }
    }

    // Remove the product from the category's products array
    const category = await Category.findById(product.category._id);
    if (category) {
      category.products = category.products.filter(
        (productId) => productId.toString() !== id
      );
      await category.save();
    }

    // Instead of deleting the product, we can mark it as deleted
    // This way it remains in the database for order history, but won't appear in product listings
    product.stock = 0; // Set stock to 0
    product.deleted = true; // Add a 'deleted' flag (we'll need to add this to the schema)
    await product.save();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }
};





    
// Add this function after your imports

// Utility function to handle image upload to Cloudinary
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