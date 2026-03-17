import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import useAuthStore from "../store/useAuthStore";
import usePricingStore from "../store/usePricingStore";

const AdminPricing = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const { services, loading, refreshServices, addService, updateService, deleteService } = usePricingStore();
  const [form, setForm] = useState({ name: "", description: "", price: "", order: 0 });
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) refreshServices();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setStatus({ type: "error", message: "Tên và giá là bắt buộc." });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      if (editing) {
        await updateService(editing._id, form, token);
        setStatus({ type: "success", message: "Đã cập nhật dịch vụ!" });
      } else {
        await addService(form, token);
        setStatus({ type: "success", message: "Đã thêm dịch vụ mới!" });
      }
      setForm({ name: "", description: "", price: "", order: 0 });
      setEditing(null);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: err.response?.data?.error || "Lỗi. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "", price: item.price, order: item.order || 0 });
    setStatus({ type: "", message: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa dịch vụ này?")) return;
    setDeletingId(id);
    try {
      await deleteService(id, token);
      setStatus({ type: "success", message: "Đã xóa dịch vụ!" });
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setStatus({ type: "error", message: "Xóa thất bại." });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", order: 0 });
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
            {editing ? "✏️ Chỉnh sửa dịch vụ" : "+ Thêm dịch vụ mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Tên dịch vụ *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Shooting"
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Mô tả
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Makeup chụp hình studio & ngoại cảnh"
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                Giá *
              </label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="VD: 500.000đ - 600.000đ"
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
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

        {/* Danh sách dịch vụ */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
          <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest mb-6 border-b pb-2">
            Danh sách dịch vụ ({services.length})
          </h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-10">
              Chưa có dịch vụ nào. Thêm dịch vụ đầu tiên →
            </p>
          ) : (
            <div className="space-y-3">
              {services.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex justify-between items-start p-4 border transition-colors ${
                    editing?._id === item._id
                      ? "border-black bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Order badge */}
                  <div className="flex items-start gap-3 flex-1 mr-4">
                    <span className="text-xs text-gray-300 font-mono pt-0.5 w-4 shrink-0">
                      {item.order ?? index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-luxury-black">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-sm text-gray-700 font-medium mt-1">{item.price}</p>
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

export default AdminPricing;
