import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true }, // Відсоток знижки
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Продукти в акції
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Promotion", promotionSchema);
