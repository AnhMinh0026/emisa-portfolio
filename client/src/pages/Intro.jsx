import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HomeImage from "../assets/HomeImage/Home1.png";

const Intro = () => {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row items-center justify-center bg-white overflow-hidden">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="w-full md:w-1/2 flex flex-col items-center md:items-end justify-center p-8 md:pr-16 lg:pr-24 z-10"
      >
        <div className="text-center md:text-right space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-luxury-black uppercase">
            Emisa
          </h1>
          <div className="flex flex-col space-y-2 text-[10px] md:text-xs tracking-[0.2em] text-gray-500 font-medium uppercase">
            <span>Pro Makeup Artist</span>
          </div>

          <div className="pt-8">
            <Link
              to="/home"
              className="inline-block px-8 py-3 border-2 border-luxury-black text-luxury-black hover:scale-110 transition-all duration-500 ease-in-out rounded"
            >
              <span className="text-xs tracking-[0.3em] uppercase font-medium">
                Enter Site
              </span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Right Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full md:w-1/2 h-[50vh] md:h-full flex items-center justify-center md:justify-start p-4 md:pl-0"
      >
        <div className="relative w-64 h-64 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]">
          <img
            src={HomeImage}
            alt="Emisa Makeup Artistry"
            className="w-full h-full object-cover rounded-full shadow-2xl"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Intro;
