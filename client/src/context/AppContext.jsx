import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setshowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);

  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  //Fetch seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");

      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Fetch user Auth status,user data and cart items

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch (error) {
      setUser(null);

      const guestCart = localStorage.getItem("guestCart");

      if (guestCart) {
        setCartItems(JSON.parse(guestCart));
      }
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        // setProducts([...dummyProducts, ...data.products]); isme change krenge toh display ho hayega assests folder image
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //add to cart
  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);

    // Guest User
    if (!user) {
      localStorage.setItem("guestCart", JSON.stringify(cartData));
      toast.success("Added to Cart");
      return;
    }

    // Logged In User
    try {
      const { data } = await axios.post("/api/cart/update", {
        userId: user._id,
        cartItems: cartData,
      });

      if (data.success) {
        toast.success("Added to Cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // update cart item
  const updateCartItem = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId] = quantity;

    if (quantity <= 0) {
      delete cartData[itemId];
    }

    setCartItems(cartData);

    // Guest User
    if (!user) {
      localStorage.setItem("guestCart", JSON.stringify(cartData));
      return;
    }

    // Logged In User
    try {
      const { data } = await axios.post("/api/cart/update", {
        userId: user._id,
        cartItems: cartData,
      });

      if (data.success) {
        toast.success("Cart Updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  // Remove From Cart
  const removeFromCart = async (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId]--;

      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }

    setCartItems(cartData);

    // Guest User
    if (!user) {
      localStorage.setItem("guestCart", JSON.stringify(cartData));
      return;
    }

    // Logged In User
    try {
      const { data } = await axios.post("/api/cart/update", {
        userId: user._id,
        cartItems: cartData,
      });

      if (data.success) {
        toast.success("Removed from Cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  // Get cart items count
  const getCartCount = () => {
    let totalCount = 0;

    for (const item in cartItems) {
      totalCount += cartItems[item];
    }

    return totalCount;
  };

  // Get cart total amount
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const itemInfo = products.find((product) => product._id === itemId);

      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }

    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    setIsSeller,
    isSeller,
    showUserLogin,
    setshowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
