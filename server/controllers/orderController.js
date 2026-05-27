// Place Order COD : /api/order/cod

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {

    const { items, address } = req.body;

    const userId = req.user.id;

    if (!address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    // Calculate Amount
    let amount = 0;

    for (const item of items) {

      const product = await Product.findById(item.product);

      if (!product) {
        return res.json({
          success: false,
          message: "Product not found",
        });
      }

      amount += product.offerPrice * item.quantity;
    }

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    // Create Order
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
    });

    // Clear User Cart
    await User.findByIdAndUpdate(userId, {
      cartItems: {},
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
    });

  } catch (error) {

    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {

    const { items, address } = req.body;

    const userId = req.user.id;

    // Frontend URL
    const origin = "http://localhost:5173";

    if (!address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    let productData = [];
    let amount = 0;

    // Calculate Amount
    for (const item of items) {

      const product = await Product.findById(item.product);

      if (!product) {
        return res.json({
          success: false,
          message: "Product not found",
        });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
    }

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    // Create Order
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
    });

    // Stripe initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Stripe line items
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "inr",

        product_data: {
          name: item.name,
        },

        unit_amount: Math.floor(item.price * 100),
      },

      quantity: item.quantity,
    }));

    // Create Stripe Session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items,

      mode: "payment",

      success_url: `${origin}/loader?next=/my-orders`,

      cancel_url: `${origin}/cart`,

      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {

    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Stripe Webhooks : /stripe
export const stripeWebhooks = async (request, response) => {

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {

    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (error) {

    console.log(error.message);

    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {

    // PAYMENT SUCCESS
    case "checkout.session.completed": {

      const session = event.data.object;

      console.log("SESSION:", session);

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        console.log("Metadata missing");
        break;
      }

      // Mark order as paid
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paymentType: "Online",
      });

      // Clear cart
      await User.findByIdAndUpdate(userId, {
        cartItems: {},
      });

      console.log("Payment Successful");

      break;
    }

    // PAYMENT FAILED / EXPIRED
    case "checkout.session.expired": {

      const session = event.data.object;

      const { orderId } = session.metadata;

      // Delete failed order
      await Order.findByIdAndDelete(orderId);

      console.log("Payment Failed");

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  response.json({
    received: true,
  });
};

// Get Orders By User Id : /api/order/user
export const getUserOrders = async (req, res) => {
  try {

    const userId = req.user.id;

    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
      userId,
    })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });

  } catch (error) {

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Orders (Seller/Admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });

  } catch (error) {

    return res.json({
      success: false,
      message: error.message,
    });
  }
};