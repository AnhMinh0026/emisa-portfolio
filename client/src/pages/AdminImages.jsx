import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import useImageStore from "../store/useImageStore";
import AdminImageGrid from "../components/AdminImageGrid";
import useCategoryStore from "../store/useCategoryStore";

const AdminImages = () => {
  const [layout, setLayout] = useState(1);
  const [files, setFiles] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingHomeId, setTogglingHomeId] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const { imagesByCategory, loadingByCategory, fetchImages } = useImageStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, fetchCategories]);

  // Set default category once categories load
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].slug);
    }
  }, [categories, category]);

  useEffect(() => {
    if (isAuthenticated && category) fetchImages(category, 50);
  }, [category, isAuthenticated, fetchImages]);

  const currentImages = imagesByCategory[category] || [];
  const isLoadingImages = loadingByCategory[category];

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    const newFiles = [...files];
    const newPreviews = [...previews];
    for (let i = newLayout; i < 3; i++) {
      newFiles[i] = null;
      newPreviews[i] = null;
    }
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleFileChange = (index, e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please select an image file." });
      return;
    }
    const newFiles = [...files];
    newFiles[index] = selectedFile;
    setFiles(newFiles);
    const newPreviews = [...previews];
    newPreviews[index] = URL.createObjectURL(selectedFile);
    setPreviews(newPreviews);
    setStatus({ type: "", message: "" });
  };

  const clearStoreCache = () => {
    useImageStore.setState((state) => {
      const newImages = { ...state.imagesByCategory };
      const newCursor = { ...state.cursorByCategory };
      delete newImages[category]; delete newImages["all"]; delete newImages["home"];
      delete newCursor[category]; delete newCursor["all"]; delete newCursor["home"];
      return { imagesByCategory: newImages, cursorByCategory: newCursor };
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const activeFiles = files.slice(0, layout);
    if (activeFiles.some((f) => f === null)) {
      setStatus({ type: "error", message: `Please select exactly ${layout} image(s).` });
      return;
    }
    setUploading(true);
    setStatus({ type: "", message: "" });
    const groupId = Date.now().toString();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    try {
      await Promise.all(
        activeFiles.map((file) => {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("category", category);
          formData.append("layout", layout);
          formData.append("groupId", groupId);
          formData.append("isHome", false);
          return axios.post(`${API_URL}/api/images/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
          });
        })
      );
      setStatus({ type: "success", message: "Tải ảnh thành công!" });
      setFiles([null, null, null]);
      setPreviews([null, null, null]);
      clearStoreCache();
      fetchImages(category, 50);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: err.response?.data?.error || "Upload thất bại." });
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
        headers: { Authorization: `Bearer ${token}` },
        data: { id: imageId },
      });
      setStatus({ type: "success", message: "Đã xóa ảnh!" });
      clearStoreCache();
      fetchImages(category, 50);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: err.response?.data?.error || "Xóa thất bại." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleHome = async (mongoId) => {
    setTogglingHomeId(mongoId);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.patch(`${API_URL}/api/images/${mongoId}/toggle-home`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      useImageStore.setState((state) => {
        const updated = { ...state.imagesByCategory };
        Object.keys(updated).forEach((cat) => {
          updated[cat] = (updated[cat] || []).map((img) =>
            img._id === mongoId ? { ...img, isHome: res.data.isHome } : img
          );
        });
        return { imagesByCategory: updated };
      });
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: "Không thể thay đổi trạng thái trang chủ." });
    } finally {
      setTogglingHomeId(null);
    }
  };

  const handleReplace = async (mongoId, file) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.patch(`${API_URL}/api/images/${mongoId}/replace`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      // Update store in-place so grid re-renders immediately
      useImageStore.setState((state) => {
        const updated = { ...state.imagesByCategory };
        Object.keys(updated).forEach((cat) => {
          updated[cat] = (updated[cat] || []).map((img) =>
            img._id === mongoId ? { ...img, url: res.data.url, id: res.data.id } : img
          );
        });
        return { imagesByCategory: updated };
      });
      setStatus({ type: "success", message: "Đã thay ảnh thành công!" });
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: err.response?.data?.error || "Thay ảnh thất bại." });
      throw err; // re-throw so modal stays open
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {status.message && (
        <Alert
          type={status.type === "error" ? "error" : "success"}
          message={status.message}
          showIcon
          closable
          onClose={() => setStatus({ type: "", message: "" })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-1 bg-white p-6 shadow-sm border border-gray-100 rounded-sm self-start sticky top-24">
          <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest mb-6 border-b pb-2">
            Đăng tải ảnh mới
          </h2>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                Danh mục
              </label>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Chưa có danh mục nào. Vui lòng thêm tại trang Danh Mục.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className={`cursor-pointer border p-3 text-center transition-all ${
                        category === cat.slug
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        checked={category === cat.slug}
                        onChange={(e) => setCategory(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-[10px] tracking-widest uppercase">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Layout */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                Bố cục ({layout} ảnh/dòng)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <label
                    key={num}
                    className={`cursor-pointer border py-2 text-center transition-all ${
                      layout === num
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="layout"
                      value={num}
                      checked={layout === num}
                      onChange={(e) => handleLayoutChange(Number(e.target.value))}
                      className="hidden"
                    />
                    <span className="text-xs tracking-widest uppercase">{num} Ảnh</span>
                  </label>
                ))}
              </div>
            </div>

            {/* File Inputs */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                Chọn ảnh ({layout})
              </label>
              <div className="space-y-4">
                {Array.from({ length: layout }).map((_, i) => (
                  <div
                    key={i}
                    className="border-2 border-dashed border-gray-300 p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(i, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {previews[i] ? (
                      <div className="space-y-2">
                        <img
                          src={previews[i]}
                          alt={`Preview ${i}`}
                          className="max-h-[120px] mx-auto object-contain shadow-sm"
                        />
                        <p className="text-[10px] text-gray-500 truncate px-2">{files[i]?.name}</p>
                      </div>
                    ) : (
                      <div className="py-4 text-gray-400 text-xs">Click để chọn ảnh {i + 1}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Đang tải..." : `Tải lên ${layout} ảnh`}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Sau khi tải xong, click vào ảnh để đánh dấu hiển thị trang chủ.
              </p>
            </div>
          </form>
        </div>

        {/* Image Grid */}
        <AdminImageGrid
          category={category}
          currentImages={currentImages}
          isLoadingImages={isLoadingImages}
          onDelete={handleDelete}
          deletingId={deletingId}
          onToggleHome={handleToggleHome}
          togglingHomeId={togglingHomeId}
          onReplace={handleReplace}
        />
      </div>
    </div>
  );
};

export default AdminImages;
