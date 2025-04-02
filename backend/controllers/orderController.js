import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { generateLiqPayData } from "../utils/generateLiqPayData.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";


export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch orders", error });
    }
}
export const getOrdersUser = async (req, res) => {
    
}

export const getOrderById = async (req, res) => {
    
}



export const createOrder = async (req, res) => {
    try {
      const { orderItems } = req.body;
  
      if (!orderItems || orderItems.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "No order items provided" });
      }
  
      // Fetch product details and calculate total price
      let totalPrice = 0;
      const populatedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Product with ID ${item.product} not found`);
          }
  
          // Calculate the price for the current item
          const itemTotal = product.price * item.amount;
          totalPrice += itemTotal;
  
          return {
            name: product.name,
            image: product.image,
            price: product.price,
            amount: item.amount,
            product: product._id,
          };
        })
      );
  
      // Create the order
      const order = await Order.create({
        user: req.user.userId,
        orderItems: populatedOrderItems,
        totalPrice,
      });
  
      // LiqPay parameters
      const params = {
        public_key: process.env.LIQPAY_PUBLIC_KEY, // Include the public key
        action: "pay",
        amount: totalPrice,
        currency: "UAH",
        description: `Payment for order ${order._id}`,
        order_id: order._id.toString(),
        version: "3",
        result_url: `${process.env.CLIENT_URL}/payment-success`, // Redirect after successful payment
        server_url: `${process.env.SERVER_URL}/api/v1/orders/payment-callback`, // LiqPay callback URL
      };
  
      // Generate data and signature
      const privateKey = process.env.LIQPAY_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("LIQPAY_PRIVATE_KEY is not defined in environment variables");
      }
      const { data, signature } = generateLiqPayData(params, privateKey);
  
      // LiqPay payment link
      const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
  
      res.status(StatusCodes.CREATED).json({ order, paymentLink });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create order", error: error.message });
    }
  };



export const updateOrder = async (req, res) => {
    
}



export const handlePaymentCallback = async (req, res) => {
    console.log("Callback triggered:", req.body); // Log the incoming request
    try {
      const { data, signature } = req.body;
  
      // Verify the signature
      const expectedSignature = crypto
        .createHash("sha1")
        .update(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY)
        .digest("base64");
  
      if (signature !== expectedSignature) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid signature" });
      }
  
      const paymentData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  
      const order = await Order.findById(paymentData.order_id);
      if (!order) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
      }
  
      // Update order payment status and order status
      if (paymentData.status === "success" || paymentData.status === "sandbox") {
        order.paymentStatus = "Paid";
        order.status = "Processing"; // Update the order status to "Processing"
        order.paymentDetails = paymentData;
      } else {
        order.paymentStatus = "Failed";
        order.status = "Pending"; // Keep the order status as "Pending" if payment fails
      }
  
      await order.save();
  
      res.status(StatusCodes.OK).json({ message: "Payment processed successfully" });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to process payment", error });
    }
  };