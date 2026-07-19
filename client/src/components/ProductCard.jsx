import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();

  if (!product) return null;

  return (
    <div
      onClick={() => {
        navigate(
          `/products/${String(product.category).toLowerCase()}/${product._id}`
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      className="w-full bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="group flex items-center justify-center">
        <img
          className="w-full h-32 sm:h-36 md:h-40 object-contain group-hover:scale-105 transition duration-300"
          src={
            Array.isArray(product.image)
              ? product.image[0]
              : product.image
          }
          alt={product.name}
        />
      </div>

      {/* Product Details */}
      <div className="mt-3">
        <p className="text-xs sm:text-sm text-gray-500">
          {product.category}
        </p>

        <h3 className="text-gray-800 font-semibold text-base sm:text-lg truncate">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                className="w-3 sm:w-3.5"
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
              />
            ))}

          <span className="text-xs text-gray-500">(4)</span>
        </div>

        {/* Price + Cart */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-primary font-bold text-lg">
              {currency} {product.offerPrice}
            </p>

            <p className="text-gray-400 text-sm line-through">
              {currency} {product.price}
            </p>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
          >
            {!cartItems[product._id] ? (
              <button
                onClick={() => addToCart(product._id)}
                className="flex items-center justify-center gap-1 w-20 h-9 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition"
              >
                <img
                  src={assets.cart_icon}
                  alt="cart"
                  className="w-4 h-4"
                />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-between w-20 h-9 rounded-lg bg-primary/20">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="w-7 h-full text-lg font-bold"
                >
                  -
                </button>

                <span className="text-sm font-medium">
                  {cartItems[product._id]}
                </span>

                <button
                  onClick={() => addToCart(product._id)}
                  className="w-7 h-full text-lg font-bold"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;