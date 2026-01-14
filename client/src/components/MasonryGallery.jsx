import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

const MasonryGallery = ({
  images,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loadMoreRef = useRef(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm tracking-widest text-gray-400">
        LOADING...
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm tracking-widest text-gray-400">
        NO IMAGES FOUND
      </div>
    );
  }

  // Prepare slides for lightbox
  const slides = images.map((image) => ({
    src: optimizeCloudinaryUrl(image.url, 1920, 90),
    alt: image.id,
  }));

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="columns-2 md:columns-2 lg:columns-3 gap-6 space-y-6 p-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="break-inside-avoid relative group overflow-hidden cursor-zoom-in"
            onClick={() => handleImageClick(index)}
          >
            <img
              src={optimizeCloudinaryUrl(image.url, 600, 85)}
              alt={image.id}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
          {loadingMore && (
            <div className="text-sm tracking-widest text-gray-400 animate-pulse">
              LOADING MORE...
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        styles={{
          container: { backgroundColor: "rgb(255, 255, 255)" },
          toolbar: {
            backgroundColor: "rgba(65, 62, 62, 0.77)",
            padding: "12px 16px",
            // borderRadius: "8px",
          },
          button: {
            filter: "none",
          },
          navigationPrev: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            padding: "8px",
            marginLeft: "8px",
          },
          navigationNext: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            padding: "8px",
            marginRight: "8px",
          },
          icon: {
            color: "#ffffff",
          },
        }}
        controller={{
          closeOnBackdropClick: false,
        }}
      />
    </>
  );
};

export default MasonryGallery;
