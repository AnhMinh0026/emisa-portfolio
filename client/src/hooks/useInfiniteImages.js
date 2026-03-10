import { useEffect } from 'react';
import useImageStore from '../store/useImageStore';

/**
 * Hook for infinite scroll image loading using Zustand
 * @param {string} category - Image category filter
 * @param {number} limit - Images per page
 */
const useInfiniteImages = (category, limit = 10) => {
  const key = category || 'all';
  const { 
    imagesByCategory, 
    loadingByCategory, 
    loadingMoreByCategory,
    errorByCategory,
    hasMoreByCategory,
    fetchImages,
    loadMoreImages
  } = useImageStore();

  const images = imagesByCategory[key] || [];
  const error = errorByCategory[key] || null;
  const hasMore = hasMoreByCategory[key] !== false; // Default to true if not explicitly false
  const loadingMore = loadingMoreByCategory[key] || false;

  useEffect(() => {
    fetchImages(category, limit);
  }, [category, limit, fetchImages]);

  // Adjust loading state to correctly reflect either initial load or already loaded
  const loading = imagesByCategory[key] !== undefined ? loadingByCategory[key] || false : true;

  const loadMore = () => {
    loadMoreImages(category, limit);
  };

  return { 
    images, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMore 
  };
};

export default useInfiniteImages;
