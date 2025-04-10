import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { generateLiqPayData } from "../utils/generateLiqPayData.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { notDeepEqual } from "assert";


export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort("-createdAt");
        res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch orders", error });
    }
}

export const getAllOrdersUser = async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not authenticated" });
    }
    
    let userId = req.params.id

    
    // Find orders for the specific user
    const orders = await Order.find({ user: userId })
      .sort('-createdAt') // Sort by most recent orders first
      .populate({
        path: 'orderItems.product',
        select: 'name price image'
      });
    
    if (!orders || orders.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No orders found for this user" });
    }
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to fetch user orders", 
      error: error.message 
    });
  }
}

export const getOrdersUser = async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not authenticated" });
    }
    
    

     let userId = req.user.userId;

    
    // Find orders for the specific user
    const orders = await Order.find({ user: userId })
      .sort('-createdAt') // Sort by most recent orders first
      .populate({
        path: 'orderItems.product',
        select: 'name price image'
      });
    

    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to fetch user orders", 
      error: error.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order by ID and populate user and product details
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name price image'
      });
    
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
    }
    
    // Check if the user is authorized to view this order (admin or the order owner)
    const isAdmin = req.user.role === 'admin';
    const isOrderOwner = order.user._id.toString() === req.user.userId;
    
    if (!isAdmin && !isOrderOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Not authorized to view this order" });
    }
    
    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to fetch order", 
      error: error.message 
    });
  }
};



export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, notes, deliveryMethod, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "No order items provided" });
    }

    // Fetch product details, calculate total price, and update stock
    let subtotal = 0;
    const populatedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID ${item.product} not found`);
        }

        // Check if there is enough stock
        if (product.stock < item.amount) {
          throw new Error(`Not enough stock for ${product.name}. Only ${product.stock} available.`);
        }

        // Calculate the price for the current item
        const itemTotal = product.price * item.amount;
        subtotal += itemTotal;

        // Update product stock
        product.stock = product.stock - item.amount;
        await product.save();

        return {
          name: product.name,
          image: product.image,
          price: product.price,         
          amount: item.amount,
          product: product._id,
        };
      })
    );

    // Calculate delivery fee based on method
    let deliveryFee = 0;
    switch(deliveryMethod) {
      case 'pickup':
        deliveryFee = 0; // Self-pickup is free
        break;
      case 'courier':
        deliveryFee = (subtotal >= 1000) ? 0 : 100; // Free for orders over 1000 UAH
        break;
      case 'novaPoshta':
        // This would be calculated based on Nova Poshta API or set manually by admin
        deliveryFee = shippingAddress.novaPoshtaFee || 0;
        break;
      case 'ukrPoshta':
        // This would be calculated based on UkrPoshta API or set manually by admin
        deliveryFee = shippingAddress.ukrPoshtaFee || 0;
        break;
      default:
        deliveryFee = 0;
    }

    // Calculate total price including delivery
    const totalPrice = subtotal + deliveryFee;

    // Create the order
    const order = await Order.create({
      user: req.user.userId,
      orderItems: populatedOrderItems,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        phone: shippingAddress.phone,
        novaPoshtaOffice: shippingAddress.novaPoshtaOffice,
        ukrPoshtaOffice: shippingAddress.ukrPoshtaOffice,
      },
      notes: notes || "",
      deliveryMethod,
      paymentMethod,
      deliveryFee,
      subtotal,
      totalPrice,
    });

    // Handle payment based on method
    let paymentLink = null;

    if (paymentMethod === 'liqpay') {
      // LiqPay parameters
      const params = {
        public_key: process.env.LIQPAY_PUBLIC_KEY,
        action: "pay",
        amount: totalPrice,
        currency: "UAH",
        description: `Payment for order ${order._id}`,
        order_id: order._id.toString(),
        version: "3",
        result_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
        server_url: `${process.env.SERVER_URL.replace(/\/$/, "")}/api/v1/orders/payment-callback`,
      };

      // Generate data and signature
      const privateKey = process.env.LIQPAY_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("LIQPAY_PRIVATE_KEY is not defined in environment variables");
      }
      const { data, signature } = generateLiqPayData(params, privateKey);

      // LiqPay payment link
      paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
    } else if (paymentMethod === 'cashOnDelivery') {

      order.paymentStatus = 'Pending';
      await order.save();
    }

    res.status(StatusCodes.CREATED).json({ 
      order, 
      paymentLink,
      message: paymentMethod === 'cashOnDelivery' ? 
        "Order created successfully. Payment will be collected upon delivery." : 
        "Order created successfully. Please proceed to payment."
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create order", error: error.message });
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate the status value
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "Invalid status value", 
        validStatuses 
      });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
    }
    
    // Check if the order is being cancelled and was not already cancelled
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      // Restore stock for all products in the order
      console.log("Restoring stock for cancelled order:", id);
      
      await Promise.all(
        order.orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock = product.stock + item.amount;
            console.log(`Restoring ${item.amount} units to product ${product.name}, new stock: ${product.stock}`);
            await product.save();
          } else {
            console.warn(`Product ${item.product} not found when trying to restore stock`);
          }
        })
      );
    }
    
    if (status) {
      order.status = status;
    }
    
    // Save the updated order
    await order.save();
    
    res.status(StatusCodes.OK).json({ 
      message: "Order updated successfully", 
      order 
    });
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to update order", 
      error: error.message 
    });
  }
};
  



export const handlePaymentCallback = async (req, res) => {
  console.log("Callback triggered. Body:", req.body, "Query:", req.query); // Log both body and query
  try {
    // Check various places where LiqPay might send the data
    let data, signature;
    
    // First check request body (typical JSON format)
    if (req.body.data && req.body.signature) {
      data = req.body.data;
      signature = req.body.signature;
    } 
    // Then check query parameters (LiqPay sometimes sends as URL params)
    else if (req.query.data && req.query.signature) {
      data = req.query.data;
      signature = req.query.signature;
    }
    else if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      if (typeof req.body === 'object') {
        const possibleDataKeys = ['data', 'DATA', 'payment_data'];
        const possibleSignatureKeys = ['signature', 'SIGNATURE', 'payment_signature'];
        
        for (const key of Object.keys(req.body)) {
          if (possibleDataKeys.includes(key.toLowerCase())) {
            data = req.body[key];
          } else if (possibleSignatureKeys.includes(key.toLowerCase())) {
            signature = req.body[key];
          }
        }
      }
    }

    if (!data || !signature) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing data or signature" });
    }

    // Verify the signature
    const expectedSignature = crypto
      .createHash("sha1")
      .update(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("Invalid signature in callback");
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid signature" });
    }

    const paymentData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    console.log("Decoded payment data:", paymentData);

    const order = await Order.findById(paymentData.order_id);
    if (!order) {
      console.error(`Order not found: ${paymentData.order_id}`);
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
    }

    // Update order payment status and order status
    if (paymentData.status === "success" || paymentData.status === "sandbox") {
      // Set payment status explicitly to "Paid" - not "Pending"
      order.paymentStatus = "Paid";
      // Set order status to "Processing"
      order.status = "Processing";
      order.paymentDetails = paymentData;
      console.log(`Payment successful for order ${order._id}. Updated payment status to ${order.paymentStatus} and order status to ${order.status}`);
    } else {
      order.paymentStatus = "Failed";
      order.status = "Pending"; // Keep the order status as "Pending" if payment fails
      
      // If payment failed, restore the stock levels
      await Promise.all(
        order.orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock = product.stock + item.amount;
            await product.save();
          }
        })
      );
      
      console.log(`Payment failed for order ${order._id}, stock restored`);
    }

    // Make sure the order is properly saved to the database
    try {
      await order.save();
      console.log(`Order ${order._id} successfully saved with payment status: ${order.paymentStatus}`);
    } catch (saveError) {
      console.error("Error saving order:", saveError);
      throw saveError; // Re-throw to be caught by the outer try/catch
    }

    // Send a simple text response since LiqPay might be expecting that
    res.status(StatusCodes.OK).send("ok");
  } catch (error) {
    console.error("Payment callback error:", error); // Log the error for debugging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to process payment", error: error.toString() });
  }
};