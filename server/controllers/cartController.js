import User from "../models/User.js";

//update user :/api/cart/update

export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems } = req.body;

    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.log(error.message);

    res.json({ success: false, message: error.message });
  }
};