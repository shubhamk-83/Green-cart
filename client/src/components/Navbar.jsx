import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const {
    user,
    setUser,
    setshowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");

      if (data.success) {
        toast.success(data.message);
        setUser(null);
        setOpen(false);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="relative flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white">
      {/* Logo */}
      <NavLink to="/" onClick={() => setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="Logo" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">All Products</NavLink>
        <NavLink to="/">Contact</NavLink>

        {/* Desktop Search */}
        <div className="hidden lg:flex items-center gap-2 border border-gray-300 px-3 rounded-full text-sm">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5 bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search products"
          />
          <img
            src={assets.search_icon}
            alt="Search"
            className="w-4 h-4"
          />
        </div>

        {/* Cart */}
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img
            src={assets.nav_cart_icon}
            alt="Cart"
            className="w-6 opacity-80"
          />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>

        {/* Login / Profile */}
        {!user ? (
          <button
            onClick={() => setshowUserLogin(true)}
            className="px-8 py-2 bg-primary hover:bg-primary-dull text-white rounded-full transition"
          >
            Login
          </button>
        ) : (
          <div className="relative group">
            <img
              src={assets.profile_icon}
              alt="Profile"
              className="w-10 cursor-pointer"
            />

            <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow-lg border border-gray-200 rounded-md w-36 py-2 text-sm z-50">
              <li
                onClick={() => navigate("/my-orders")}
                className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
              >
                My Orders
              </li>

              <li
                onClick={logout}
                className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Top Icons */}
      <div className="flex items-center gap-5 sm:hidden">
        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <img
            src={assets.nav_cart_icon}
            alt="Cart"
            className="w-6 opacity-80"
          />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>

        <button onClick={() => setOpen(!open)}>
          <img src={assets.menu_icon} alt="Menu" className="w-6" />
        </button>
      </div>

      {/* Mobile Search */}
      <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 px-4 py-3 sm:hidden z-40">
        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 bg-transparent outline-none text-sm placeholder-gray-500"
            type="text"
            placeholder="Search products..."
          />
          <img
            src={assets.search_icon}
            alt="Search"
            className="w-4 h-4"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full left-0 mt-16 w-full bg-white shadow-lg border-t border-gray-200 z-50 flex flex-col gap-4 px-6 py-5 sm:hidden transition-all">
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>

          <NavLink to="/products" onClick={() => setOpen(false)}>
            All Products
          </NavLink>

          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)}>
              My Orders
            </NavLink>
          )}

          <NavLink to="/" onClick={() => setOpen(false)}>
            Contact
          </NavLink>

          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setshowUserLogin(true);
              }}
              className="mt-2 px-6 py-2 bg-primary text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="mt-2 px-6 py-2 bg-primary text-white rounded-full"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;