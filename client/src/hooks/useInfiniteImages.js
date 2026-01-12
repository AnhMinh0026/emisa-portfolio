import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook for infinite scroll image loading
 * @param {string} category - Image category filter
 * @param {number} limit - Images per page
 */
const useInfiniteImages = (category, limit = 10) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  // Initial load
  useEffect(() => {
    const fetchInitialImages = async () => {
      try {
        setLoading(true);
        setImages([]);
        setCursor(null);
        
        const url = category 
          ? `http://localhost:5000/api/images?category=${category}&limit=${limit}`
          : `http://localhost:5000/api/images?limit=${limit}`;
          
        const response = await axios.get(url);
        
        // Handle both old format (array) and new format (object)
        if (Array.isArray(response.data)) {
          setImages(response.data);
          setHasMore(false);
        } else {
          setImages(response.data.images || []);
          setCursor(response.data.nextCursor);
          setHasMore(response.data.hasMore);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialImages();
  }, [category, limit]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      
      let url = category 
        ? `http://localhost:5000/api/images?category=${category}&limit=${limit}`
        : `http://localhost:5000/api/images?limit=${limit}`;
      
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      
      const response = await axios.get(url);
      
      if (Array.isArray(response.data)) {
        // Old format - no more pagination
        setHasMore(false);
      } else {
        setImages(prev => [...prev, ...response.data.images]);
        setCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [category, limit, cursor, hasMore, loadingMore]);

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
