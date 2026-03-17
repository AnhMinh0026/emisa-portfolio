import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import useAuthStore from "../store/useAuthStore";
import useCategoryStore from "../store/useCategoryStore";

// Auto-generate slug from Vietnamese name
const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const AdminCategories = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const { categories, loading, refreshCategories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore();

  const [form, setForm] = useState({ name: "", slug: "", order: 0 });
  const [slugManual, setSlugManual] = useState(false); // user edited slug manually?
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) refreshCategories();
  }, [isAuthenticated]);

  // Auto-fill slug from name
  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManual ? prev.slug : toSlug(value),
    }));
  };

  const handleSlugChange = (value) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      setStatus({ type: "error", message: "Tên và slug là bắt buộc." });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      if (editing) {
        await updateCategory(editing._id, form, token);
        setStatus({ type: "success", message: "Đã cập nhật danh mục!" });
      } else {
        await addCategory(form, token);
        setStatus({ type: "success", message: "Đã thêm danh mục mới!" });
      }
      setForm({ name: "", slug: "", order: 0 });
      setEditing(null);
      setSlugManual(false);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: err.response?.data?.error || "Lỗi. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setSlugManual(true);
    setForm({ name: item.name, slug: item.slug, order: item.order || 0 });
    setStatus({ type: "", message: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này? Ảnh trong danh mục sẽ không bị xóa.")) return;
    setDeletingId(id);
    try {
      await deleteCategory(id, token);
      setStatus({ type: "success", message: "Đã xóa danh mục!" });
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: "Xóa thất bại." });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setSlugManual(false);
    setForm({ name: "", slug: "", order: 0 });
    setStatus({ type: "", message: "" });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form thêm / sửa */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm self-start sticky top-24">
          <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest mb-6 border-b pb-2">
            {editing ? "✏️ Chỉnh sửa danh mục" : "+ Thêm danh mục mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Tên danh mục *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Trang điểm cá nhân"
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Slug (URL key) *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="VD: beauty"
                className="w-full border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-black transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Dùng trong URL: <span className="font-mono text-gray-500">/gallery/{form.slug || "..."}</span>
                <br />Chỉ dùng chữ thường, số, dấu gạch ngang. Tự động tạo từ tên.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                min={0}
              />
              <p className="text-xs text-gray-400 mt-1">Số nhỏ hơn hiển thị trước.</p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 text-xs tracking-widest uppercase border border-gray-300 text-gray-600 hover:border-black transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách danh mục */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest mb-6 border-b pb-2">
            Danh sách danh mục ({categories.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-10">
              Chưa có danh mục nào. Thêm danh mục đầu tiên →
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex justify-between items-center p-4 border transition-colors ${
                    editing?._id === item._id
                      ? "border-black bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    {/* Order badge */}
                    <span className="text-xs text-gray-300 font-mono w-4 shrink-0">
                      {item.order ?? index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-luxury-black">{item.name}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        /gallery/<span className="text-gray-600">{item.slug}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="text-xs px-3 py-1.5 border border-red-100 text-red-400 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deletingId === item._id ? "..." : "Xóa"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
