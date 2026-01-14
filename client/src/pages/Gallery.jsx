import React from "react";
import { useParams } from "react-router-dom";
import useInfiniteImages from "../hooks/useInfiniteImages";
import MasonryGallery from "../components/MasonryGallery";
import Header from "../components/Header";
import { motion } from "framer-motion";

const Gallery = () => {
  const { category } = useParams();
  const actualCategory = category === "all" ? undefined : category;
  const { images, loading, loadingMore, error, hasMore, loadMore } =
    useInfiniteImages(actualCategory, 10);

  const displayTitle = category === "all" ? "All Layout" : category;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={category} // Re-animate on category change
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-luxury-black uppercase tracking-wide">
            {displayTitle}
          </h2>
        </motion.div>

        {error ? (
          <div className="text-center text-red-500 tracking-widest text-sm">
            ERROR LOADING IMAGES: {error.message}
          </div>
        ) : (
          <MasonryGallery
            images={images}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        )}
      </main>
    </div>
  );
};

export default Gallery;
