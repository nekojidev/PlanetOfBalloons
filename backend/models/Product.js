import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    cloudinaryId: {
      type: String,
      default: '',
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, default: 0 },
    popular: { type: Boolean, default: false } // Add this field
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  this.price = parseFloat(this.price.toFixed(2));
  if (this.originalPrice) {
    this.originalPrice = parseFloat(this.originalPrice.toFixed(2));
  }
  next();
});


export default mongoose.model("Product", productSchema);
