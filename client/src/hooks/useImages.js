import { useState, useEffect } from 'react';
import axios from 'axios';

const useImages = (category) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL ;
        const url = category 
          ? `${API_URL}/api/images?category=${category}&limit=100`
          : `${API_URL}/api/images?limit=100`;
          
        const response = await axios.get(url);
        
        // Handle both old format (array) and new format (object with images)
        if (Array.isArray(response.data)) {
          setImages(response.data);
        } else {
          setImages(response.data.images || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [category]);

  return { images, loading, error };
};

export default useImages;
