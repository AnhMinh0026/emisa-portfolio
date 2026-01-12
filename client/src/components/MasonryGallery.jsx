import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

const MasonryGallery = ({
  images,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}) => {
  const [selectedId, setSelectedId] = useState(null);
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

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 p-4">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="break-inside-avoid relative group cursor-zoom-in overflow-hidden"
            onClick={() => setSelectedId(image.id)}
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

      <AnimatePresence>
        {selectedId && (
          <Modal
            selectedId={selectedId}
            images={images}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
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
        src={optimizeCloudinaryUrl(image.url, 1920, 90)}
        alt={image.id}
        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
};

export default MasonryGallery;
