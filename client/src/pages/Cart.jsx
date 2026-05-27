import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  // Get Cart Products
  const getCart = () => {
    let tempArray = [];

    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);

      if (product) {
        tempArray.push({
          ...product,
          quantity: cartItems[key],
        });
      }
    }

    setCartArray(tempArray);
  };

  // Get User Addresses
  const getUserAddresss = async () => {
    try {
      const { data } = await axios.get("/api/address/get");

      if (data.success) {
        setAddresses(data.addresses);

        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Place Order
  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      if (cartArray.length === 0) {
        return toast.error("Cart is empty");
      }

      // COD
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", {
          userId: user._id,
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        });

        if (data.success) {
          toast.success(data.message);

          // Clear Cart
          setCartItems({});

          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }

      } else {

        // Stripe Payment
        const { data } = await axios.post("/api/order/stripe", {
          userId: user._id,
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        });

        if (data.success) {

          // FIXED HERE
          setCartItems({});

          window.location.replace(data.url);

        } else {
          toast.error(data.message);
        }
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddresss();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 flex flex-col md:flex-row gap-10">

      {/* LEFT SIDE */}
      <div className="flex-1">

        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">
            {getCartCount()} Items
          </span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium py-4 border-b"
          >
            <div className="flex items-center gap-4 md:gap-6">

              <div
                onClick={() => {
                  navigate(
                    `/products/${product.category.toLowerCase()}/${product._id}`
                  );

                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden bg-white"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={product.image[0]}
                  alt={product.name}
                />
              </div>

              <div>
                <p className="font-semibold">{product.name}</p>

                <div className="font-normal text-gray-500/70 text-sm">

                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <p>Qty:</p>

                    <select
                      value={product.quantity}
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      className="border border-gray-300 px-1 py-0.5 rounded outline-none"
                    >
                      {Array(
                        (cartItems[product._id] || 1) > 9
                          ? cartItems[product._id]
                          : 9
                      )
                        .fill("")
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto"
            >
              <img
                src={assets.remove_icon}
                alt="remove"
                className="w-5 h-5"
              />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            navigate("/products");

            scrollTo(0, 0);
          }}
          className="group flex items-center mt-8 gap-2 text-primary font-medium"
        >
          <img
            className="group-hover:translate-x-1 transition"
            src={assets.arrow_right_icon_colored}
            alt="arrow"
          />

          Continue Shopping
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[360px] bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-fit">

        <h2 className="text-xl font-medium">
          Order Summary
        </h2>

        <hr className="border-gray-300 my-5" />

        {/* DELIVERY ADDRESS */}
        <div className="mb-6">

          <p className="text-sm font-medium uppercase">
            Delivery Address
          </p>

          <div className="relative flex justify-between items-start mt-2">

            <p className="text-gray-500 text-sm">
              {selectedAddress
                ? `
${selectedAddress.firstName}
${selectedAddress.lastName},
${selectedAddress.street},
${selectedAddress.city},
${selectedAddress.state},
${selectedAddress.zipcode},
${selectedAddress.country}
`
                : "No address found"}
            </p>

            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary text-sm"
            >
              Change
            </button>

            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full shadow-md rounded z-10">

                {addresses.map((address, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {`${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode}`}
                  </p>
                ))}

                <p
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10"
                >
                  Add address
                </p>

              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">
            Payment Method
          </p>

          <select
            value={paymentOption}
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none rounded"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>

        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2 text-sm">

          <p className="flex justify-between">
            <span>Price</span>

            <span>
              {currency}
              {getCartAmount()}
            </span>
          </p>

          <p className="flex justify-between">
            <span>Shipping Fee</span>

            <span className="text-green-600">
              Free
            </span>
          </p>

          <p className="flex justify-between">
            <span>Tax (2%)</span>

            <span>
              {currency}
              {(getCartAmount() * 2) / 100}
            </span>
          </p>

          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>

            <span>
              {currency}
              {getCartAmount() + (getCartAmount() * 2) / 100}
            </span>
          </p>

        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 bg-primary text-white font-medium rounded"
        >
          {paymentOption === "COD"
            ? "Place Order"
            : "Proceed to Checkout"}
        </button>

      </div>
    </div>
  );
};

export default Cart;