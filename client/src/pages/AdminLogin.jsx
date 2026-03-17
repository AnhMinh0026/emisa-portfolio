import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import Header from "../components/Header";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      login(response.data.token);
      navigate("/admin/images");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-xl rounded-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-luxury-black uppercase tracking-widest mb-2">
              Admin Portal
            </h1>
            <div className="w-12 h-[1px] bg-luxury-black mx-auto"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-luxury-black transition-colors bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-luxury-black transition-colors bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white px-6 py-4 text-xs font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
