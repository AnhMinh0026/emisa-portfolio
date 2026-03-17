require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const categories = [
  { name: "Trang điểm cá nhân", slug: "beauty", order: 1 },
  { name: "Trang điểm Cô dâu", slug: "bridal", order: 2 },
  { name: "Trang điểm Sự kiện – Dạ tiệc", slug: "event", order: 3 },
  { name: "Trang điểm Thương mại – Truyền thông", slug: "commercial", order: 4 },
  { name: "Trang điểm Lookbook – Concept", slug: "lookbook", order: 5 },
  { name: "Trang điểm Tốt nghiệp – Kỷ yếu", slug: "graduation", order: 6 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  for (const cat of categories) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`⏭️  Already exists: ${cat.slug}`);
    } else {
      await Category.create(cat);
      console.log(`✅ Created: ${cat.name} (${cat.slug})`);
    }
  }

  console.log("\n🎉 Seed hoàn tất!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
