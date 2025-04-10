import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cloudinary from './config/cloudinary.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Promotion from './models/Promotion.js';
import Announcement from './models/Announcement.js';
import products from './mockData/products.js';
import categories from './mockData/category.js';
import promotions from './mockData/promotions.js';
import announcements from './mockData/announcement.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the directory name using ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, 'tmp');
// Ensure temp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Function to download image from URL to temporary file
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
};

// Function to upload image to Cloudinary
const uploadToCloudinary = async (filepath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      use_filename: true,
      folder: `planet-of-balloons/${folder}`,
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
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Process an array of items with images
const processImagesForItems = async (items, folderName) => {
  const processedItems = [];
  
  for (const item of items) {
    try {
      if (item.image) {
        const filename = `${Date.now()}-${path.basename(new URL(item.image).pathname)}`;
        const tempFilePath = path.join(tmpDir, filename);
        
        // Download image from URL
        await downloadImage(item.image, tempFilePath);
        
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(tempFilePath, folderName);
        
        // Replace original image URL with Cloudinary URL
        const processedItem = {
          ...item,
          image: uploadResult.url,
          cloudinaryId: uploadResult.id
        };
        
        processedItems.push(processedItem);
        
        // Cleanup temp file
        fs.unlinkSync(tempFilePath);
        console.log(`Uploaded image for ${item.name || item.title}`);
      } else {
        processedItems.push(item);
      }
    } catch (error) {
      console.error(`Error processing image for ${item.name || item.title}:`, error);
      // Include item without changes if image processing fails
      processedItems.push(item);
    }
  }
  
  return processedItems;
};

// Main import function
const importData = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    await Promotion.deleteMany();
    await Announcement.deleteMany();

    console.log('Processing product images...');
    const processedProducts = await processImagesForItems(products, 'products');
    
    console.log('Processing announcement images...');
    const processedAnnouncements = await processImagesForItems(announcements, 'announcements');
    
    // Skip image processing for promotions since they don't have images
    console.log('Using promotions without image processing...');
    const processedPromotions = promotions;

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    
    // Create a mapping of category names to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Prepare products with proper category IDs
    const productsWithCategoryIds = processedProducts.map(product => {
      return {
        ...product,
        category: categoryMap[product.category] // Replace category name with ID
      };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsWithCategoryIds);

    // Update categories with their product IDs
    for (const category of createdCategories) {
      const categoryProducts = createdProducts.filter(
        product => product.category.toString() === category._id.toString()
      );
      
      category.products = categoryProducts.map(product => product._id);
      await category.save();
    }
    
    // Process promotions - link them to relevant products
    const finalPromotions = [];
    for (const promo of processedPromotions) {
      // Find relevant products for this promotion based on category or name
      let relevantProducts = [];
      
      // For "геліві кульки" promotion, find products in that category
      if (promo.title.includes('геліві')) {
        relevantProducts = createdProducts.filter(p => 
          p.category.toString() === categoryMap['Геліві кульки']?.toString()
        );
      } 
      // For "фольговані кульки" promotion
      else if (promo.title.includes('ольгова')) {
        relevantProducts = createdProducts.filter(p => 
          p.category.toString() === categoryMap['Фольговані кульки']?.toString()
        );
      }
      // For "Прапор України" promotion
      else if (promo.title.includes('Незалежності')) {
        relevantProducts = createdProducts.filter(p => 
          p.name.includes('Прапор України')
        );
      }
      // For Valentine's day promotion
      else if (promo.title.includes('Закоханих')) {
        relevantProducts = createdProducts.filter(p => 
          p.name.includes('Валентина') || p.name.includes('Серце')
        );
      }
      // For LED balloons
      else if (promo.title.includes('LED')) {
        relevantProducts = createdProducts.filter(p => 
          p.name.includes('LED') || p.name.includes('світло')
        );
      }
      // For birthday sets
      else if (promo.title.includes('день народження')) {
        relevantProducts = createdProducts.filter(p => 
          p.category.toString() === categoryMap['Святкові набори']?.toString()
        );
      }
      
      // Add product IDs to the promotion
      promo.products = relevantProducts.map(p => p._id);
      finalPromotions.push(promo);
    }
    
    // Insert promotions and announcements
    await Promotion.insertMany(finalPromotions);
    await Announcement.insertMany(processedAnnouncements);

    console.log('Data Imported! All images have been uploaded to Cloudinary.');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    await Promotion.deleteMany();
    await Announcement.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}