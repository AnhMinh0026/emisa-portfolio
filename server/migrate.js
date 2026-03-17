/**
 * Migration Script: Cloudinary -> MongoDB
 * ----------------------------------------
 * Chạy 1 lần duy nhất để import toàn bộ ảnh cũ từ Cloudinary vào MongoDB.
 * Các ảnh cũ sẽ được gán: layout = 1, isHome = false, groupId = cloudinaryId
 * 
 * Cách chạy:
 *   node migrate.js
 */

const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Image = require("./models/Image");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Category folders to scan on Cloudinary
const CATEGORY_FOLDERS = [
  { folder: "makeup/beauty", category: "beauty" },
  { folder: "makeup/bridal", category: "bridal" },
  { folder: "makeup/event", category: "event" },
  { folder: "makeup/commercial", category: "commercial" },
  { folder: "makeup/lookbook", category: "lookbook" },
  { folder: "makeup/graduation", category: "graduation" },
];

async function getAllResourcesFromFolder(expression) {
  const results = [];
  let nextCursor = null;

  do {
    const response = await cloudinary.search
      .expression(expression)
      .max_results(100)
      .next_cursor(nextCursor)
      .execute();

    results.push(...response.resources);
    nextCursor = response.next_cursor || null;
  } while (nextCursor);

  return results;
}

async function migrate() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/emisa_db");
  console.log("✅ MongoDB connected.\n");

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const { folder, category } of CATEGORY_FOLDERS) {
    console.log(`📁 Scanning folder: ${folder} (${category})...`);

    let resources;
    try {
      resources = await getAllResourcesFromFolder(`folder:${folder}/*`);
    } catch (err) {
      console.log(`   ⚠️  Folder "${folder}" not found or empty, skipping.`);
      continue;
    }

    console.log(`   Found ${resources.length} images.`);

    for (const img of resources) {
      // Check if already migrated
      const exists = await Image.findOne({ cloudinaryId: img.public_id });
      if (exists) {
        totalSkipped++;
        continue;
      }

      const newImage = new Image({
        cloudinaryId: img.public_id,
        url: img.secure_url,
        width: img.width,
        height: img.height,
        category,
        layout: 1,           // Default layout (1 ảnh 1 hàng)
        groupId: img.public_id, // Mỗi ảnh cũ = 1 group riêng
        isHome: false,        // Mặc định không hiển thị ở Home
      });

      await newImage.save();
      totalInserted++;
    }

    console.log(`   ✅ Inserted ${resources.length - totalSkipped} new records.\n`);
  }

  console.log("-----------------------------------");
  console.log(`🎉 Migration complete!`);
  console.log(`   Inserted: ${totalInserted} images`);
  console.log(`   Skipped (already exist): ${totalSkipped} images`);
  console.log("-----------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
