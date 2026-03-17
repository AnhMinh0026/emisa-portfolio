import { create } from 'zustand';
import axios from 'axios';

const usePricingStore = create((set, get) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    // Skip if already loaded
    if (get().services.length > 0) return;

    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/pricing`);
      set({ services: res.data });
    } catch (err) {
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  // Force refresh (bypasses cache)
  refreshServices: async () => {
    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/pricing`);
      set({ services: res.data });
    } catch (err) {
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  addService: async (data, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${API_URL}/api/pricing`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ services: [...state.services, res.data] }));
    return res.data;
  },

  updateService: async (id, data, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.put(`${API_URL}/api/pricing/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      services: state.services.map((s) => (s._id === id ? res.data : s)),
    }));
    return res.data;
  },

  deleteService: async (id, token) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.delete(`${API_URL}/api/pricing/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      services: state.services.filter((s) => s._id !== id),
    }));
  },
}));

export default usePricingStore;
