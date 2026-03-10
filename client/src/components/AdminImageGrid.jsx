import React, { useState } from "react";
import { Modal } from "antd";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

const AdminImageGrid = ({
  category,
  currentImages,
  isLoadingImages,
  onDelete,
  deletingId,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const showDeleteConfirm = (id) => {
    setSelectedImageId(id);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (selectedImageId) {
      onDelete(selectedImageId);
    }
    setIsModalVisible(false);
    setSelectedImageId(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedImageId(null);
  };

  return (
    <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-sm font-medium text-luxury-black uppercase tracking-widest">
          Current Images ({category})
        </h2>
        {isLoadingImages && (
          <span className="text-[10px] tracking-widest text-gray-400 animate-pulse uppercase">
            Loading...
          </span>
        )}
      </div>

      {!isLoadingImages && currentImages.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-xs tracking-widest uppercase border-2 border-dashed border-gray-100 bg-gray-50">
          No images found in this category
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {currentImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden bg-gray-100 block"
            >
              <img
                src={optimizeCloudinaryUrl(img.url, 400, 80)}
                alt={img.id}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  deletingId === img.id
                    ? "opacity-50 scale-95"
                    : "group-hover:scale-110"
                }`}
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => showDeleteConfirm(img.id)}
                  disabled={deletingId === img.id}
                  className="bg-white/10 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  title="Delete Image"
                >
                  {deletingId === img.id ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ant Design Modal for Delete Confirmation */}
      <Modal
        title={
          <div className="text-luxury-black font-serif uppercase tracking-widest text-lg border-b pb-3 mb-2">
            Confirm Deletion
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          className: "tracking-widest uppercase text-xs rounded-sm",
        }}
        cancelButtonProps={{
          className: "tracking-widest uppercase text-xs rounded-sm",
        }}
        centered
        className="custom-admin-modal font-sans"
      >
        <div className="py-4">
          <p className="text-gray-600 mb-2">
            Are you sure you want to permanently delete this image from your
            portfolio?
          </p>
          <p className="text-xs text-red-500 bg-red-50 p-3 border border-red-100 rounded-sm">
            Warning: This action cannot be undone. The image will be removed
            from Cloudinary and all galleries immediately.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AdminImageGrid;
