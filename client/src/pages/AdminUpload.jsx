import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import Header from "../components/Header";
import useImageStore from "../store/useImageStore";
import AdminImageGrid from "../components/AdminImageGrid";

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("beauty");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Zustand Store
  const { imagesByCategory, loadingByCategory, fetchImages } = useImageStore();

  const categories = [
    { id: "beauty", label: "Trang điểm cá nhân" },
    { id: "bridal", label: "Trang điểm Cô dâu" },
    { id: "event", label: "Trang điểm Sự kiện – Dạ tiệc" },
    { id: "commercial", label: "Trang điểm Thương mại – Truyền thông" },
    { id: "lookbook", label: "Trang điểm Lookbook – Concept" },
    { id: "graduation", label: "Trang điểm Tốt nghiệp – Kỷ yếu" },
  ];

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  // Fetch images initially or when category changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchImages(category, 50); // Fetch a good chunk for the grid
    }
  }, [category, isAuthenticated, fetchImages]);

  const currentImages = imagesByCategory[category] || [];
  const isLoadingImages = loadingByCategory[category];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setStatus({ type: "error", message: "Please select an image file." });
        return;
      }
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setStatus({ type: "", message: "" });
    }
  };

  const clearStoreCache = () => {
    useImageStore.setState((state) => {
      const newImagesByCategory = { ...state.imagesByCategory };
      const newCursorByCategory = { ...state.cursorByCategory };

      delete newImagesByCategory[category];
      delete newImagesByCategory["all"];
      delete newImagesByCategory["home"];
      delete newCursorByCategory[category];
      delete newCursorByCategory["all"];
      delete newCursorByCategory["home"];

      return {
        imagesByCategory: newImagesByCategory,
        cursorByCategory: newCursorByCategory,
      };
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus({ type: "error", message: "Please select a file to upload." });
      return;
    }

    setUploading(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${API_URL}/api/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus({ type: "success", message: "Image uploaded successfully!" });
      setFile(null);
      setPreview(null);

      // Auto-refresh cache
      clearStoreCache();
      fetchImages(category, 50);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setStatus({
          type: "error",
          message:
            err.response?.data?.error ||
            "Failed to upload image. Please try again.",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    setDeletingId(imageId);
    setStatus({ type: "", message: "" });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.delete(`${API_URL}/api/images`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id: imageId },
      });

      setStatus({ type: "success", message: "Image deleted successfully!" });

      // Auto-refresh cache
      clearStoreCache();
      fetchImages(category, 50);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setStatus({
          type: "error",
          message:
            err.response?.data?.error ||
            "Failed to delete image. Please try again.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-serif text-luxury-black uppercase tracking-widest">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-2 text-sm tracking-wide">
                Manage your portfolio images
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              Sign Out
            </button>
          </div>

          {status.message && (
            <div
              className={`p-4 text-sm text-center border ${
                status.type === "error"
                  ? "bg-red-50 text-red-500 border-red-100"
                  : "bg-green-50 text-green-600 border-green-100"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section (Left Panel) */}
            <div className="lg:col-span-1 bg-white p-6 shadow-sm border border-gray-100 rounded-sm self-start sticky top-24">
              <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest mb-6 border-b pb-2">
                Upload New Image
              </h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className={`cursor-pointer border p-3 text-center transition-all ${
                          category === cat.id
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={category === cat.id}
                          onChange={(e) => setCategory(e.target.value)}
                          className="hidden"
                        />
                        <span className="text-[10px] tracking-widest uppercase">
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                    Image File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {preview ? (
                      <div className="space-y-3">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-[200px] mx-auto object-contain shadow-sm"
                        />
                        <p className="text-[10px] text-gray-500 truncate px-2">
                          {file?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="py-8 space-y-3">
                        <svg
                          className="w-8 h-8 mx-auto text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        <div className="text-gray-500 text-xs">
                          Click to select
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="w-full bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              </form>
            </div>

            {/* Gallery Section (Right Panel) */}
            <AdminImageGrid
              category={category}
              currentImages={currentImages}
              isLoadingImages={isLoadingImages}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUpload;
