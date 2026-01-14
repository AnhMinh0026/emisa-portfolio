import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { motion } from "framer-motion";

const Pricing = () => {
  const services = [
    {
      name: "Wedding / TVC / Quay MV / Thương mại",
      price: "Liên hệ inbox",
      description: " Dịch vụ đặc biệt",
    },
    {
      name: "Shooting",
      price: "500.000đ - 600.000đ",
      description: "Makeup chụp hình studio & ngoại cảnh",
    },
    {
      name: "LookBook - Special Concept",
      price: "600.000đ - 1.000.000đ",
      description: "Makeup theo concept riêng",
    },
    {
      name: "Make up Party - Event",
      price: "500.000đ - 2.000.000đ",
      description: "Makeup dự tiệc, sự kiện, gala, chương trình biểu diễn",
    },
    {
      name: "Tốt nghiệp - Kỷ yếu - Bưng quả",
      price: "400.000đ",
      description: "Makeup cho lễ tốt nghiệp, chụp ảnh kỷ yếu, bưng quả",
    },
  ];

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
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex flex-col md:flex-row justify-between items-baseline border-b border-gray-100 pb-4 hover:border-gray-300 transition-colors duration-300"
              >
                <div className="text-left">
                  <h3 className="text-lg md:text-xl text-luxury-black">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.description}
                  </p>
                </div>
                <div className="text-lg md:text-xl font-medium text-luxury-black tracking-widest mt-2 md:mt-0">
                  {service.price}
                </div>
              </motion.div>
            ))}
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
