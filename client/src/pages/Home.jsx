import React from "react";
import Header from "../components/Header";
import useImages from "../hooks/useImages";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";
import { motion } from "framer-motion";

const Home = () => {
  // Fetch images from beauty category for the carousel
  const { images, loading } = useImages("beauty");
  const [selectedId, setSelectedId] = React.useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  // Check if user has seen the welcome modal before
  React.useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcomeModal(false);
  };

  // Duplicate images to create seamless loop effect
  // We need enough copies to fill the screen + buffer for smooth infinite scroll
  const carouselImages =
    images && images.length > 0
      ? [...images, ...images, ...images, ...images]
      : [];

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      <Header />
      <main className="flex-grow flex items-start pt-24 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-luxury-black tracking-widest text-xs animate-pulse">
            LOADING GALLERY...
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden group">
            <div
              className="flex space-x-6 animate-scroll"
              style={{ width: "max-content" }}
            >
              {carouselImages.map((img, index) => (
                <div
                  key={`${img.id}-${index}`}
                  className="flex-shrink-0 h-[calc(100vh-9rem)] w-[65vh] overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedId(img.id)}
                >
                  <img
                    src={optimizeCloudinaryUrl(img.url, 800, 85)}
                    alt="Portfolio"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-in-out hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-4 bg-white text-center">
        <p className="text-[10px] tracking-widest text-gray-400 uppercase">
          Copyright © All rights reserved.
        </p>
      </footer>

      {/* Modal for viewing images */}
      {selectedId && (
        <Modal
          selectedId={selectedId}
          images={images}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcome} />}

      <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } 
                }
                .animate-scroll {
                    animation: scroll 480s linear infinite;
                }
            `}</style>
    </div>
  );
};

const Modal = ({ selectedId, images, onClose }) => {
  const image = images.find((img) => img.id === selectedId);
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
    >
      <motion.img
        layoutId={selectedId}
        src={image.url}
        alt={image.id}
        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
};

const WelcomeModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-luxury-black transition-colors duration-300 z-10"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-[1px] bg-luxury-black mx-auto mb-6" />
            <h2 className="text-3xl md:text-3xl text-luxury-black uppercase tracking-wide mb-4">
              Hướng Dẫn Sử Dụng Website
            </h2>
            <div className="w-16 h-[1px] bg-luxury-black mx-auto mt-6" />
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-base md:text-lg">
              Website này được xây dựng như một{" "}
              <strong>portfolio cá nhân</strong>, nhằm giới thiệu các layout
              makeup, concept và phong cách làm việc của Emisa.
            </p>

            <p className="text-base md:text-lg">
              Mỗi danh mục{" "}
              <span className="text-luxury-black font-medium">
                (Beauty, Bridal, Event, Editorial, Fashion)
              </span>{" "}
              thể hiện một phong cách makeup khác nhau, giúp bạn dễ dàng tham
              khảo và lựa chọn mà không cần chờ Emisa gửi ảnh thủ công.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mt-6">
              <p className="text-base font-medium text-luxury-black mb-3">
                Vui lòng liên hệ trực tiếp nếu bạn cần:
              </p>
              <ul className="space-y-2 text-sm md:text-base list-disc list-inside text-gray-600">
                <li>Tư vấn layout phù hợp với gương mặt và concept</li>
                <li>Báo giá theo yêu cầu riêng</li>
                <li>Lịch makeup ngoài giờ hoặc ngoài khu vực</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-base ">
                <span className="text-gray-500">SDT:</span>
                <a
                  href="tel:0961073839"
                  className="text-luxury-black font-medium hover:opacity-60 transition-opacity"
                >
                  0961 073 839
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-base">
                <span className="text-gray-500">Facebook:</span>
                <a
                  href="https://www.facebook.com/ngan071004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-luxury-black font-medium hover:opacity-60 transition-opacity"
                >
                  facebook.com/ngan071004
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
