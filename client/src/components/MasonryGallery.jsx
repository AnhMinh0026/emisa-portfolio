import React, { useState, useEffect, useRef, useMemo } from "react";
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

  // Group images by groupId to construct rows
  const imageGroups = useMemo(() => {
    if (!images) return [];
    const groups = [];
    images.forEach((img) => {
      // For legacy images without groupId, fallback to their own ID so they show up individually (layout 1)
      const groupId = img.groupId || img.id;
      let group = groups.find((g) => g.groupId === groupId);
      if (!group) {
        group = {
          groupId,
          layout: img.layout || 1, // Default to 1 if no layout specified
          images: [],
        };
        groups.push(group);
      }
      group.images.push(img);
    });
    return groups;
  }, [images]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm tracking-widest text-gray-400">
        LOADING...
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm tracking-widest text-gray-400">
        NO IMAGES FOUND
      </div>
    );
  }

  // Prepare slides for lightbox using original flat array to maintain correct indexes
  const slides = images.map((image) => ({
    src: optimizeCloudinaryUrl(image.url, 1920, 90),
    alt: image.id,
  }));

  const handleImageClick = (globalIndex) => {
    setCurrentIndex(globalIndex);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="flex flex-col space-y-4 md:space-y-6">
        {imageGroups.map((group) => {
          // Determine grid layout CSS based on requested layout
          let gridClass = "grid grid-cols-1 gap-4 md:gap-6";
          if (group.layout === 3) {
            gridClass = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6";
          } else if (group.layout === 2) {
            gridClass = "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6";
          }

          // Image sizing strategy based on layout
          // Layout 1: Auto height, natural width
          // Layout 2/3: Fixed aspect ratio so they align perfectly in the same row
          const imageClass = group.layout === 1 
              ? "w-full h-auto object-cover" 
              : "w-full h-[400px] md:h-[600px] object-cover";

          return (
            <div key={group.groupId} className={gridClass}>
              {group.images.map((image) => {
                // Find global index in the flat array for lightbox navigation
                const globalIndex = images.findIndex((img) => img.id === image.id);
                return (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative group overflow-hidden cursor-zoom-in bg-gray-50 flex items-center justify-center"
                    onClick={() => handleImageClick(globalIndex)}
                  >
                    <img
                      src={optimizeCloudinaryUrl(image.url, group.layout === 1 ? 1200 : 800, 85)}
                      alt={image.id}
                      className={`${imageClass} transition-transform duration-700 group-hover:scale-105`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
          {loadingMore && (
            <div className="text-sm tracking-widest text-gray-400 animate-pulse uppercase">
              Loading More...
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
