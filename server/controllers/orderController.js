import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";

// ==============================
// Place Order COD : /api/order/cod
// ==============================
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

    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed",
    });

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

// ==============================
// Place Order Stripe : /api/order/stripe
// ==============================
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;

    const userId = req.user.id;
    const origin = "http://localhost:5173";

    if (!address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    let productData = [];
    let amount = 0;

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

    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
      status: "Pending",
    });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    console.log("Created Order:", order._id);
    console.log("Metadata Sent:", {
      orderId: order._id.toString(),
      userId,
    });

    console.log("Stripe Session URL:", session.url);

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

// ==============================
// Stripe Webhook : /stripe
// ==============================
export const stripeWebhooks = async (request, response) => {
  console.log("========== WEBHOOK HIT ==========");

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Event Type:", event.type);
  } catch (error) {
    console.log("Webhook Error:", error.message);

    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("SESSION:", session);
        console.log("SESSION METADATA:", session.metadata);

        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;

        console.log("Order ID:", orderId);
        console.log("User ID:", userId);

        if (!orderId || !userId) {
          console.log("Metadata missing");
          break;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            isPaid: true,
            paymentType: "Online",
            status: "Order Placed",
          },
          { new: true }
        );

        console.log("Updated Order:", updatedOrder);

        await User.findByIdAndUpdate(userId, {
          cartItems: {},
        });

        console.log("Payment Successful");

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;

        const orderId = session.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndDelete(orderId);
        }

        console.log("Payment Expired");
        break;
      }

      default:
        console.log("Unhandled Event:", event.type);
        break;
    }

    return response.json({
      received: true,
    });
  } catch (error) {
    console.log("Webhook Processing Error:", error);

    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get User Orders : /api/order/user
// ==============================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
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

// ==============================
// Get All Orders : /api/order/seller
// ==============================
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