import { create } from 'zustand';
import axios from 'axios';

const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    if (get().categories.length > 0) return;
    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/categories`);
      set({ categories: res.data });
    } catch (err) {
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  refreshCategories: async () => {
    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/categories`);
      set({ categories: res.data });
    } catch (err) {
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (data, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${API_URL}/api/categories`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ categories: [...state.categories, res.data].sort((a, b) => a.order - b.order) }));
    return res.data;
  },

  updateCategory: async (id, data, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.put(`${API_URL}/api/categories/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      categories: state.categories
        .map((c) => (c._id === id ? res.data : c))
        .sort((a, b) => a.order - b.order),
    }));
    return res.data;
  },

  deleteCategory: async (id, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.delete(`${API_URL}/api/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      categories: state.categories.filter((c) => c._id !== id),
    }));
  },
}));

export default useCategoryStore;
