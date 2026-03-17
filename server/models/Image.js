const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  cloudinaryId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
  },
  layout: {
    type: Number,
    required: true,
    enum: [1, 2, 3], // 1 ảnh, 2 ảnh, hoặc 3 ảnh trên 1 dòng
    default: 1,
  },
  groupId: {
    type: String, // ID chung để nhóm các ảnh cùng dòng
    required: true,
  },
  isHome: {
    type: Boolean,
    default: false, // Ảnh có trích xuất ra trang Home hay không
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", imageSchema);
