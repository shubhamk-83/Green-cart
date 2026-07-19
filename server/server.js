import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import "dotenv/config";

import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";

import { stripeWebhooks } from "./controllers/orderController.js";

const app = express();

// Trust proxy (needed for secure cookies behind hosting platforms like Vercel/Render)
app.set("trust proxy", 1);

// Allowed Frontend Origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://green-cart-steel-eta.vercel.app",
];
// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Stripe Webhook Route (must come before express.json())
app.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.send("API is Working");
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Server Port
const PORT = process.env.PORT || 4000;

// Start Server after DB & Cloudinary are ready
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;