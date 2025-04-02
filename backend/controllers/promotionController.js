import Promotion from "../models/Promotion.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";

export const createPromotion = async (req, res) => {
    try {
        const { title, description, discount, products, startDate, endDate } = req.body;
    
        if (!title || !description || !discount || !products || !startDate || !endDate) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide all required fields" });
        }
    
        // Validate products
        const validProducts = await Product.find({ _id: { $in: products } });
        if (validProducts.length !== products.length) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product IDs provided" });
        }
    
        // Apply discount to products and store original prices
        for (const product of validProducts) {
          if (!product.originalPrice) {
            product.originalPrice = product.price; // Store the original price
          }
          product.price = product.price - (product.price * discount) / 100; // Apply discount
          await product.save();
        }
    
        const promotion = await Promotion.create({
          title,
          description,
          discount,
          products,
          startDate,
          endDate,
          isActive: true,
        });
    
        res.status(StatusCodes.CREATED).json({ promotion });
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create promotion", error });
      }
}
export const getPromotions = async (req, res) => {
    try {
      const promotions = await Promotion.find().populate("products", "name price image");
      res.status(StatusCodes.OK).json({ promotions });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch promotions", error });
    }
  };
  
  export const getPromotionById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const promotion = await Promotion.findById(id).populate("products", "name price image");
      if (!promotion) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
      }
  
      res.status(StatusCodes.OK).json({ promotion });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch promotion", error });
    }
  };
  export const updatePromotion = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, discount, products, startDate, endDate, isActive } = req.body; 
  
      if (discount === undefined || isNaN(discount) || discount < 0 || discount > 100) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid discount value. It must be a number between 0 and 100." });
      }
  
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
      }
  
      // Validate products if provided
      if (products) {
        const validProducts = await Product.find({ _id: { $in: products } });
        if (validProducts.length !== products.length) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product IDs provided" });
        }
  
        // Revert prices of old products
        if (promotion.products && promotion.products.length > 0) {
          for (const productId of promotion.products) {
            const product = await Product.findById(productId);
            if (product && product.originalPrice) {
              product.price = product.originalPrice; // Revert to original price
              // Do not clear the original price to preserve it for future operations
              await product.save();
            }
          }
        }
  
        // Apply discount to new products
        for (const product of validProducts) {
          if (!product.originalPrice) {
            product.originalPrice = product.price; // Store the original price
          }
          product.price = product.originalPrice - (product.originalPrice * discount) / 100; // Apply discount to original price
          await product.save();
        }
  
        promotion.products = products; // Update the products in the promotion
      }
  
      promotion.title = title || promotion.title;
      promotion.description = description || promotion.description;
      promotion.discount = discount || promotion.discount;
      promotion.startDate = startDate || promotion.startDate;
      promotion.endDate = endDate || promotion.endDate;
      promotion.isActive = isActive !== undefined ? isActive : promotion.isActive;
  
      await promotion.save();
  
      res.status(StatusCodes.OK).json({ promotion });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to update promotion", error });
    }
  };

export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
    
        const promotion = await Promotion.findById(id).populate("products");
        if (!promotion) {
          return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
        }
    
        if (promotion.isActive) {
          // Revert product prices
          for (const product of promotion.products) {
            if (product.originalPrice) {
              product.price = product.originalPrice; // Revert to original price
              product.originalPrice = undefined; // Clear the original price
              await product.save();
            }
          }
        }
    
        await promotion.deleteOne();
    
        res.status(StatusCodes.OK).json({ message: "Promotion deleted successfully" });
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete promotion", error });
      }
}


export const addProductToPromotion = async (req, res) => {
    try {
      const { id } = req.params; // Promotion ID
      const { products } = req.body; // New products to add
  
      if (!products || products.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide product IDs to add" });
      }
  
      const promotion = await Promotion.findById(id).populate("products");
      if (!promotion) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
      }
  
      // Validate new products
      const validProducts = await Product.find({ _id: { $in: products } });
      if (validProducts.length !== products.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product IDs provided" });
      }
  
      // Filter out products that are already in the promotion
      const existingProductIds = promotion.products.map((product) => product._id.toString());
      const newProducts = validProducts.filter(
        (product) => !existingProductIds.includes(product._id.toString())
      );
  
      if (newProducts.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "All provided products are already in the promotion" });
      }
  
      // Apply discount to new products and store their original prices
      for (const product of newProducts) {
        if (!product.originalPrice) {
          product.originalPrice = product.price; // Store the original price
        }
        product.price = product.price - (product.price * promotion.discount) / 100; // Apply discount
        await product.save();
      }
  
      // Add new products to the promotion
      promotion.products.push(...newProducts.map((product) => product._id));
      await promotion.save();
  
      res.status(StatusCodes.OK).json({ message: "Products added to promotion successfully", promotion });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add products to promotion", error });
    }
  };