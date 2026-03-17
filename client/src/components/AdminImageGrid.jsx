import React, { useState, useRef } from "react";
import { Modal } from "antd";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

// Layout badge config
const LAYOUT_BADGE = {
  1: { label: "1P", cls: "bg-gray-800/90 text-white" },
  2: { label: "2P", cls: "bg-blue-600/90 text-white" },
  3: { label: "3P", cls: "bg-purple-600/90 text-white" },
};

const AdminImageGrid = ({
  category,
  currentImages,
  isLoadingImages,
  onDelete,
  deletingId,
  onToggleHome,
  togglingHomeId,
  onReplace,
}) => {
  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // Replace modal
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(null); // the img object
  const [replaceFile, setReplaceFile] = useState(null);
  const [replacePreview, setReplacePreview] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef(null);

  // ── Delete handlers ──
  const showDeleteConfirm = (id) => { setSelectedDeleteId(id); setDeleteModalOpen(true); };
  const handleDeleteOk = () => { if (selectedDeleteId) onDelete(selectedDeleteId); setDeleteModalOpen(false); setSelectedDeleteId(null); };
  const handleDeleteCancel = () => { setDeleteModalOpen(false); setSelectedDeleteId(null); };

  // ── Replace handlers ──
  const openReplace = (img) => {
    setReplaceTarget(img);
    setReplaceFile(null);
    setReplacePreview(null);
    setReplaceModalOpen(true);
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReplaceFile(file);
    setReplacePreview(URL.createObjectURL(file));
  };

  const handleReplaceConfirm = async () => {
    if (!replaceFile || !replaceTarget) return;
    setReplacing(true);
    try {
      await onReplace(replaceTarget._id, replaceFile);
      setReplaceModalOpen(false);
    } finally {
      setReplacing(false);
    }
  };

  const handleReplaceCancel = () => {
    setReplaceModalOpen(false);
    setReplaceTarget(null);
    setReplaceFile(null);
    setReplacePreview(null);
  };

  return (
    <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest">
          Ảnh trong danh mục ({category})
        </h2>
        {isLoadingImages && (
          <span className="text-[10px] tracking-widest text-gray-400 animate-pulse uppercase">Đang tải...</span>
        )}
      </div>

      {!isLoadingImages && currentImages.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-xs tracking-widest uppercase border-2 border-dashed border-gray-100 bg-gray-50">
          Chưa có ảnh trong danh mục này
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {currentImages.map((img) => {
            const badge = LAYOUT_BADGE[img.layout] || LAYOUT_BADGE[1];
            const isTogglingThis = togglingHomeId === img._id;

            return (
              <div key={img.id} className="group relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={optimizeCloudinaryUrl(img.url, 400, 80)}
                  alt={img.id}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    deletingId === img.id ? "opacity-50 scale-95" : "group-hover:scale-110"
                  }`}
                  loading="lazy"
                />

                {/* isHome badge */}
                {img.isHome && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-black/80 text-white text-[9px] tracking-widest uppercase px-2 py-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Home
                    </span>
                  </div>
                )}

                {/* Layout badge */}
                <div className="absolute bottom-2 right-2 z-10">
                  <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Hover overlay — 3 buttons */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5">
                  {/* Toggle Home */}
                  <button
                    onClick={() => onToggleHome && onToggleHome(img._id)}
                    disabled={isTogglingThis}
                    title={img.isHome ? "Bỏ trang chủ" : "Hiển thị trang chủ"}
                    className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
                      img.isHome ? "bg-black text-white hover:bg-gray-700" : "bg-white/10 text-white hover:bg-black"
                    }`}
                  >
                    {isTogglingThis ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Replace */}
                  <button
                    onClick={() => openReplace(img)}
                    title="Thay ảnh"
                    className="bg-white/10 hover:bg-amber-500 text-white p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => showDeleteConfirm(img.id)}
                    disabled={deletingId === img.id}
                    title="Xóa ảnh"
                    className="bg-white/10 hover:bg-red-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  >
                    {deletingId === img.id ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Modal ── */}
      <Modal
        title={<div className="text-luxury-black font-serif uppercase tracking-widest text-lg border-b pb-3 mb-2">Xác nhận xóa</div>}
        open={deleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, className: "tracking-widest uppercase text-xs rounded-sm" }}
        cancelButtonProps={{ className: "tracking-widest uppercase text-xs rounded-sm" }}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-2">Bạn có chắc muốn xóa ảnh này khỏi portfolio?</p>
          <p className="text-xs text-red-500 bg-red-50 p-3 border border-red-100 rounded-sm">
            Cảnh báo: Hành động này không thể hoàn tác. Ảnh sẽ bị xóa khỏi Cloudinary và tất cả gallery.
          </p>
        </div>
      </Modal>

      {/* ── Replace Modal ── */}
      <Modal
        title={<div className="text-luxury-black font-serif uppercase tracking-widest text-lg border-b pb-3 mb-2">Thay ảnh</div>}
        open={replaceModalOpen}
        onOk={handleReplaceConfirm}
        onCancel={handleReplaceCancel}
        okText={replacing ? "Đang xử lý..." : "Thay ảnh"}
        cancelText="Hủy"
        okButtonProps={{ disabled: !replaceFile || replacing, className: "tracking-widest uppercase text-xs rounded-sm" }}
        cancelButtonProps={{ className: "tracking-widest uppercase text-xs rounded-sm", disabled: replacing }}
        centered
        width={520}
      >
        <div className="py-4 space-y-4">
          {/* Preview so sánh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 text-center">Ảnh hiện tại</p>
              {replaceTarget && (
                <img
                  src={optimizeCloudinaryUrl(replaceTarget.url, 300, 80)}
                  alt="current"
                  className="w-full aspect-square object-cover border border-gray-200"
                />
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 text-center">Ảnh mới</p>
              {replacePreview ? (
                <img src={replacePreview} alt="new" className="w-full aspect-square object-cover border border-black" />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors bg-gray-50"
                >
                  <span className="text-xs text-gray-400">Click để chọn ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* File input */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceFileChange} />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-gray-300 py-2.5 text-xs tracking-widest uppercase text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            {replaceFile ? `✓ ${replaceFile.name}` : "Chọn ảnh mới"}
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Ảnh mới sẽ giữ nguyên danh mục, layout và trạng thái trang chủ của ảnh cũ.
          </p>
        </div>
      </Modal>
    </div>
  );
};

// Spinner helper
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default AdminImageGrid;
