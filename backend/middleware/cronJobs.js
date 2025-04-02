import cron from "node-cron";
import Promotion from "../models/Promotion.js";
import Product from "../models/Product.js";

export const schedulePromotionRevert = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      // Find expired promotions
      const expiredPromotions = await Promotion.find({ endDate: { $lte: now }, isActive: true });

      for (const promotion of expiredPromotions) {
        // Revert product prices
        const products = await Product.find({ _id: { $in: promotion.products } });
        for (const product of products) {
          if (product.originalPrice) {
            product.price = product.originalPrice; // Revert to original price
            product.originalPrice = undefined; // Clear the original price
            await product.save();
          }
        }

        // Mark the promotion as inactive
        promotion.isActive = false;
        await promotion.save();
      }

      console.log("Expired promotions processed successfully.");
    } catch (error) {
      console.error("Error processing expired promotions:", error);
    }
  });
};