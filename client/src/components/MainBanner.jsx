import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <section className="relative w-full">

      {/* Background Images */}
      <picture>
        <source media="(min-width: 768px)" srcSet={assets.main_banner_bg} />
        <img
          src={assets.main_banner_bg_sm}
          alt="banner"
          className="w-full object-cover"
        />
      </picture>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-center md:items-start px-4 md:px-16 lg:px-24 pb-20 md:pb-0">

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-xs md:max-w-md lg:max-w-lg leading-tight">
          Freshness you can trust, savings you will love!
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-5 font-medium">

          {/* Shop Now */}
          <Link
            to="/products"
            className="group flex items-center justify-center gap-1.5 px-4 md:px-6 py-2 bg-primary hover:bg-primary-dull transition-all duration-300 rounded text-white text-sm md:text-base"
          >
            Shop now
            <img
              src={assets.white_arrow_icon}
              alt="arrow"
              className="md:hidden w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Explore Deals (desktop only) */}
          <Link
            to="/products"
            className="hidden md:flex group items-center gap-1.5 px-4 md:px-6 py-2 text-sm md:text-base"
          >
            Explore deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default MainBanner;