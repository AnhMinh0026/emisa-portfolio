import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { motion } from "framer-motion";
import usePricingStore from "../store/usePricingStore";

const Pricing = () => {
  const { services, loading, fetchServices } = usePricingStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl w-full space-y-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl  text-luxury-black uppercase tracking-wide mb-12">
            Bảng Giá
          </h2>

          <div className="space-y-10">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-baseline border-b border-gray-100 pb-4"
                >
                  <div className="text-left space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : services.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Đang cập nhật bảng giá...</p>
            ) : (
              services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex flex-col md:flex-row justify-between items-baseline border-b border-gray-100 pb-4 hover:border-gray-300 transition-colors duration-300"
                >
                  <div className="text-left">
                    <h3 className="text-lg md:text-xl text-luxury-black">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="text-lg md:text-xl font-medium text-luxury-black tracking-widest mt-2 md:mt-0">
                    {service.price}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="pt-16 text-sm text-gray-600 space-y-3">
            <p className="text-base">
              Hỗ trợ làm tóc cơ bản - yêu cầu tóc đặc biệt ib mình nhé
            </p>
            <p className="text-base">
              Khách hàng có tình trạng da đặc biệt ib mình tư vấn thêm nhé
            </p>
            <p className="pt-4 text-lg font-semibold text-luxury-black">
              LƯU Ý:
            </p>
            <p className="text-base font-medium text-gray-700">
              Bảng giá chưa bao gồm phí di chuyển / nước (nếu makeup ở quán
              coffee)
            </p>
            <p className="mt-6 text-base text-luxury-black font-medium underline cursor-pointer hover:opacity-70">
              <Link to="/contact">Liên hệ đặt lịch</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Pricing;
