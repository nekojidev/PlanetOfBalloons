import mongoose from "mongoose";

const singleOrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [singleOrderItemSchema],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    paymentDetails: { type: Object }, // Store LiqPay transaction details
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'courier', 'novaPoshta', 'ukrPoshta'],
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['liqpay', 'cashOnDelivery'],
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);