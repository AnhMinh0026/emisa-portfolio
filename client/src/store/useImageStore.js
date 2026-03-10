import { create } from 'zustand';
import axios from 'axios';

const useImageStore = create((set, get) => ({
  imagesByCategory: {}, 
  cursorByCategory: {},
  hasMoreByCategory: {},
  loadingByCategory: {},
  loadingMoreByCategory: {},
  errorByCategory: {},

  fetchImages: async (category, limit = 10) => {
    const key = category || 'all';
    const state = get();
    
    // If we already have images for this category, skip fetching to allow instant load from cache
    if (state.imagesByCategory[key] && state.imagesByCategory[key].length > 0) {
      return;
    }

    set((state) => ({
      loadingByCategory: { ...state.loadingByCategory, [key]: true },
      errorByCategory: { ...state.errorByCategory, [key]: null },
    }));

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = category 
        ? `${API_URL}/api/images?category=${category}&limit=${limit}`
        : `${API_URL}/api/images?limit=${limit}`;
        
      const response = await axios.get(url);
      
      let newImages = [];
      let newCursor = null;
      let newHasMore = false;

      if (Array.isArray(response.data)) {
        newImages = response.data;
        newHasMore = false;
      } else {
        newImages = response.data.images || [];
        newCursor = response.data.nextCursor;
        newHasMore = response.data.hasMore;
      }

      set((state) => ({
        imagesByCategory: { ...state.imagesByCategory, [key]: newImages },
        cursorByCategory: { ...state.cursorByCategory, [key]: newCursor },
        hasMoreByCategory: { ...state.hasMoreByCategory, [key]: newHasMore },
      }));
    } catch (err) {
      set((state) => ({
        errorByCategory: { ...state.errorByCategory, [key]: err },
      }));
    } finally {
      set((state) => ({
        loadingByCategory: { ...state.loadingByCategory, [key]: false },
      }));
    }
  },

  loadMoreImages: async (category, limit = 10) => {
    const key = category || 'all';
    const state = get();
    
    if (!state.hasMoreByCategory[key] || state.loadingMoreByCategory[key]) return;

    set((state) => ({
      loadingMoreByCategory: { ...state.loadingMoreByCategory, [key]: true },
      errorByCategory: { ...state.errorByCategory, [key]: null },
    }));

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let url = category 
        ? `${API_URL}/api/images?category=${category}&limit=${limit}`
        : `${API_URL}/api/images?limit=${limit}`;
      
      const currentCursor = state.cursorByCategory[key];
      if (currentCursor) {
        url += `&cursor=${currentCursor}`;
      }
      
      const response = await axios.get(url);
      
      let addedImages = [];
      let newCursor = null;
      let newHasMore = false;

      if (Array.isArray(response.data)) {
        newHasMore = false;
      } else {
        addedImages = response.data.images || [];
        newCursor = response.data.nextCursor;
        newHasMore = response.data.hasMore;
      }

      set((state) => ({
        imagesByCategory: { 
          ...state.imagesByCategory, 
          [key]: [...(state.imagesByCategory[key] || []), ...addedImages] 
        },
        cursorByCategory: { ...state.cursorByCategory, [key]: newCursor },
        hasMoreByCategory: { ...state.hasMoreByCategory, [key]: newHasMore },
      }));
    } catch (err) {
      set((state) => ({
        errorByCategory: { ...state.errorByCategory, [key]: err },
      }));
    } finally {
      set((state) => ({
        loadingMoreByCategory: { ...state.loadingMoreByCategory, [key]: false },
      }));
    }
  }
}));

export default useImageStore;
