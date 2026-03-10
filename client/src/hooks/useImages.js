import { useEffect } from 'react';
import useImageStore from '../store/useImageStore';

const useImages = (category) => {
  const key = category || 'all';
  const { imagesByCategory, loadingByCategory, errorByCategory, fetchImages } = useImageStore();

  const images = imagesByCategory[key] || [];
  const error = errorByCategory[key] || null;

  useEffect(() => {
    fetchImages(category, 100);
  }, [category, fetchImages]);

  // Adjust loading state to correctly reflect either initial load or already loaded
  const isLoading = imagesByCategory[key] !== undefined ? loadingByCategory[key] : true;

  return { images, loading: isLoading, error };
};

export default useImages;
