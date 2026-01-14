import React from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto space-y-12"
        >
          {/* Decorative line */}
          <div className="w-24 h-[1px] bg-luxury-black mx-auto mb-10" />

          <h2 className="text-4xl md:text-5xl text-luxury-black uppercase tracking-wide">
            LIÊN HỆ
          </h2>

          {/* Introduction */}
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            Để đặt lịch hoặc tư vấn về dịch vụ makeup, bạn vui lòng liên hệ qua
            Facebook hoặc Zalo bằng cách nhấn vào link bên dưới.
          </p>

          {/* Contact Methods */}
          <div className="space-y-10 pt-6">
            {/* Facebook */}
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
                Facebook
              </p>
              <a
                href="https://www.facebook.com/ngan071004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-lg text-luxury-black hover:opacity-60 transition-all duration-300 hover:scale-105"
              >
                facebook.com/ngan071004
              </a>
            </div>

            {/* Zalo */}
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
                Zalo
              </p>
              <a
                href="https://zalo.me/0961073839"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-lg text-luxury-black hover:opacity-60 transition-all duration-300 hover:scale-105"
              >
                0961 073 839
              </a>
            </div>

            {/* Address */}
            <div className="space-y-3 pt-4">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
                Địa Chỉ
              </p>
              <p className="text-base text-luxury-black leading-relaxed">
                78/4B Cây Keo, Tam Phú
                <br />
                Thủ Đức, TP Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="w-24 h-[1px] bg-gray-300 mx-auto mt-12" />
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;
