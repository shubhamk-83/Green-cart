import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false }
);

// Prevent model overwrite error in dev (like  nodemon)
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;