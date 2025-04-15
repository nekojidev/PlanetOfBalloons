import Promotion from "../models/Promotion.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";

export const createPromotion = async (req, res) => {
  try {
    const { title, description, discount, products, startDate, endDate } = req.body;

    if (!title || !description || !discount || !products || !startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide all required fields" });
    }
    // Validate discount
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid discount value. It must be a number between 0 and 100.",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid startDate or endDate. Ensure startDate is before endDate.",
      });
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
      // Calculate discounted price consistently using the original price
      product.price = product.originalPrice * (1 - discount / 100);
    }

    try {
      // Use bulkSave for better efficiency
      await Product.bulkSave(validProducts);
    } catch (bulkError) {
      console.error("Bulk save error:", bulkError);
      // Fallback to individual saves if bulk operation fails
      for (const product of validProducts) {
        await product.save();
      }
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
    console.error("Error creating promotion:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to create promotion", error: error.message });
  }
};
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

    // Validate startDate and endDate
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid startDate or endDate. Ensure startDate is before endDate.",
        });
      }
    }

    // Validate discount
    if (discount !== undefined && (isNaN(discount) || discount < 0 || discount > 100)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid discount value. It must be a number between 0 and 100.",
      });
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
    }

    if (isActive === false && promotion.isActive === true) {
      // Revert prices of all products in the promotion
      const productsToRevert = await Product.find({ _id: { $in: promotion.products } });
      for (const product of productsToRevert) {
        if (product.originalPrice) {
          product.price = product.originalPrice; // Revert to original price
          product.originalPrice = undefined; // Clear the original price
        }
      }
      try {
        await Product.bulkSave(productsToRevert); // Bulk save for efficiency
      } catch (bulkError) {
        console.error("Bulk save error:", bulkError);
        // Fallback to individual saves if bulk operation fails
        for (const product of productsToRevert) {
          await product.save();
        }
      }
    } else if (isActive === true && promotion.isActive === false) {
      // Apply discounts when promotion is reactivated
      const productsToDiscount = await Product.find({ _id: { $in: promotion.products } });
      for (const product of productsToDiscount) {
        // Store original price if not already stored
        if (!product.originalPrice) {
          product.originalPrice = product.price;
        }
        // Apply discount
        product.price = product.originalPrice * (1 - promotion.discount / 100);
      }
      try {
        await Product.bulkSave(productsToDiscount); // Bulk save for efficiency
      } catch (bulkError) {
        console.error("Bulk save error:", bulkError);
        // Fallback to individual saves if bulk operation fails
        for (const product of productsToDiscount) {
          await product.save();
        }
      }
    }

    if (products) {
      // Find products that are removed from the promotion
      const removedProductIds = promotion.products.filter(
        (productId) => !products.includes(productId.toString()),
      );

      if (removedProductIds.length > 0) {
        // Revert prices of removed products
        const productsToRevert = await Product.find({ _id: { $in: removedProductIds } });
        for (const product of productsToRevert) {
          if (product.originalPrice) {
            product.price = product.originalPrice; // Revert to original price
            product.originalPrice = undefined; // Clear the original price
          }
        }
        try {
          await Product.bulkSave(productsToRevert); // Bulk save for efficiency
        } catch (bulkError) {
          console.error("Bulk save error:", bulkError);
          // Fallback to individual saves if bulk operation fails
          for (const product of productsToRevert) {
            await product.save();
          }
        }
      }

      // Find products that are added to the promotion
      const existingProductIds = promotion.products.map((id) => id.toString());
      const newProductIds = products.filter((id) => !existingProductIds.includes(id));

      if (newProductIds.length > 0) {
        // Validate new products
        const validProducts = await Product.find({ _id: { $in: newProductIds } });
        if (validProducts.length !== newProductIds.length) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product IDs provided" });
        }

        // Apply discount to new products
        const discountToApply = discount || promotion.discount;
        for (const product of validProducts) {
          if (!product.originalPrice) {
            product.originalPrice = product.price; // Store the original price
          }
          product.price = product.originalPrice * (1 - discountToApply / 100); // Apply discount consistently
        }

        try {
          await Product.bulkSave(validProducts); // Bulk save for efficiency
        } catch (bulkError) {
          console.error("Bulk save error:", bulkError);
          // Fallback to individual saves if bulk operation fails
          for (const product of validProducts) {
            await product.save();
          }
        }
      }

      // If discount changed, update prices for existing products
      if (discount && discount !== promotion.discount && promotion.isActive) {
        // Get existing products that remain in the promotion
        const remainingProductIds = existingProductIds.filter((id) => products.includes(id));
        if (remainingProductIds.length > 0) {
          const productsToUpdate = await Product.find({ _id: { $in: remainingProductIds } });
          for (const product of productsToUpdate) {
            if (product.originalPrice) {
              product.price = product.originalPrice * (1 - discount / 100); // Apply new discount
            }
          }

          try {
            await Product.bulkSave(productsToUpdate); // Bulk save for efficiency
          } catch (bulkError) {
            console.error("Bulk save error:", bulkError);
            // Fallback to individual saves if bulk operation fails
            for (const product of productsToUpdate) {
              await product.save();
            }
          }
        }
      }

      promotion.products = products; // Update the products in the promotion
    }

    promotion.title = title || promotion.title;
    promotion.description = description || promotion.description;

    if (discount) {
      promotion.discount = discount;
    }

    if (startDate) {
      promotion.startDate = startDate;
    }

    if (endDate) {
      promotion.endDate = endDate;
    }

    promotion.isActive = isActive !== undefined ? isActive : promotion.isActive;

    await promotion.save();

    res.status(StatusCodes.OK).json({ promotion });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update promotion", error: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Promotion not found" });
    }

    // Revert product prices regardless of promotion status
    // This ensures all products have their prices reverted
    const productsToRevert = await Product.find({ _id: { $in: promotion.products } });
    for (const product of productsToRevert) {
      if (product.originalPrice) {
        product.price = product.originalPrice; // Revert to original price
        product.originalPrice = undefined; // Clear the original price
      }
    }

    try {
      await Product.bulkSave(productsToRevert); // Bulk save for efficiency
    } catch (bulkError) {
      console.error("Bulk save error:", bulkError);
      // Fallback to individual saves if bulk operation fails
      for (const product of productsToRevert) {
        await product.save();
      }
    }

    await promotion.deleteOne();

    res.status(StatusCodes.OK).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete promotion",
      error: error.message,
    });
  }
};

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

    if (!promotion.isActive) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot add products to an inactive promotion" });
    }

    // Validate new products
    const validProducts = await Product.find({ _id: { $in: products } });
    if (validProducts.length !== products.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product IDs provided" });
    }

    // Filter out products that are already in the promotion
    const existingProductIds = promotion.products.map((product) => product._id.toString());
    const newProducts = validProducts.filter(
      (product) => !existingProductIds.includes(product._id.toString()),
    );

    if (newProducts.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "All provided products are already in the promotion" });
    }

    // Apply discount to new products and store their original prices
    for (const product of newProducts) {
      if (!product.originalPrice) {
        product.originalPrice = product.price; // Store the original price
      }
      // Calculate new price with the discount directly from the original price
      product.price = product.originalPrice * (1 - promotion.discount / 100);
    }

    try {
      // Use bulkSave for better efficiency
      await Product.bulkSave(newProducts);
    } catch (bulkError) {
      console.error("Bulk save error:", bulkError);
      // Fallback to individual saves if bulk operation fails
      for (const product of newProducts) {
        await product.save();
      }
    }

    // Add new products to the promotion
    promotion.products.push(...newProducts.map((product) => product._id));
    await promotion.save();

    res.status(StatusCodes.OK).json({ message: "Products added to promotion successfully", promotion });
  } catch (error) {
    console.error("Error adding products to promotion:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to add products to promotion", error: error.message });
  }
};
