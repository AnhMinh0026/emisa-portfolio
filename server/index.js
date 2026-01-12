const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.get("/api/images", async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let expression = "folder:makeup/*";
    if (category) {
      expression = `folder:makeup/${category}/*`;
    }

    // Cloudinary pagination using max_results and next_cursor
    const { resources, next_cursor } = await cloudinary.search
      .expression(expression)
      .sort_by("public_id", "desc")
      .max_results(limitNum)
      .next_cursor(req.query.cursor || null) // Use cursor for pagination
      .execute();

    const formattedImages = resources.map((img) => ({
      id: img.public_id,
      url: img.secure_url,
      width: img.width,
      height: img.height,
      folder: img.folder,
    }));

    res.json({
      images: formattedImages,
      nextCursor: next_cursor || null,
      hasMore: !!next_cursor,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.get("/", (req, res) => {
  res.send("Makeup Portfolio API Running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
