const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const mongoose = require("mongoose");
const { verifyToken } = require("./middleware/auth");
const Image = require("./models/Image");
const Pricing = require("./models/Pricing");
const Category = require("./models/Category");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Config
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/emisa_db")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));


// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Auth Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { username: process.env.ADMIN_USERNAME, role: "admin" },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "24h" }
    );
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Routes
app.get("/api/images", async (req, res) => {
  try {
    const { category, page = 1, limit = 10, cursor } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let query = {};
    if (category === "home") {
      query.isHome = true;
    } else if (category && category !== "all") {
      query.category = category;
    }

    // simple pagination via cursor (createdAt)
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const imagesDB = await Image.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum);

    const hasMore = imagesDB.length === limitNum;
    const nextCursor = hasMore ? imagesDB[imagesDB.length - 1].createdAt.toISOString() : null;

    const formattedImages = imagesDB.map((img) => ({
      id: img.cloudinaryId,
      url: img.url,
      width: img.width,
      height: img.height,
      category: img.category,
      layout: img.layout,
      groupId: img.groupId,
      isHome: img.isHome,
      _id: img._id, // Mongo ID
    }));

    res.json({
      images: formattedImages,
      nextCursor: nextCursor,
      hasMore: hasMore,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch images from Database" });
  }
});

// Upload Route
app.post("/api/images/upload", verifyToken, upload.single("image"), (req, res) => {
  try {
    const { category, layout = 1, groupId, isHome = false } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!category || !groupId) {
      return res.status(400).json({ error: "Category and groupId are required" });
    }

    // Support flexible folder routing initially
    let targetFolder = `makeup/${category.toLowerCase()}`;
    if (category === "home") targetFolder = "makeup/home";

    // Use upload_stream to upload memory buffer from multer to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: targetFolder },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }
        
        // Save to Database
        try {
          const newImage = new Image({
            cloudinaryId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            category: category.toLowerCase(),
            layout: Number(layout),
            groupId: String(groupId),
            isHome: isHome === 'true' || isHome === true,
          });

          await newImage.save();

          res.status(200).json({
            message: "Upload successful",
            image: {
              id: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              category: newImage.category,
              layout: newImage.layout,
              groupId: newImage.groupId,
              isHome: newImage.isHome,
            },
          });
        } catch (dbError) {
          console.error("DB Save Error:", dbError);
          // Optional: You could delete the cloudinary image here if DB save fails
          return res.status(500).json({ error: "Failed to save image metadata to database" });
        }
      }
    );

    // End stream with the file buffer
    stream.end(req.file.buffer);

  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ error: "Internal server error during upload" });
  }
});

// Replace image (admin only) - delete old from cloudinary, upload new
app.patch("/api/images/:id/replace", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });

    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).json({ error: "Image not found" });

    // Delete old from Cloudinary
    await cloudinary.uploader.destroy(img.cloudinaryId);

    // Upload new to same folder
    const folder = `makeup/${img.category}`;
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Replace Error:", error);
          return res.status(500).json({ error: "Failed to upload replacement to Cloudinary" });
        }
        try {
          img.cloudinaryId = result.public_id;
          img.url = result.secure_url;
          img.width = result.width;
          img.height = result.height;
          await img.save();

          res.json({
            _id: img._id,
            id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            category: img.category,
            layout: img.layout,
            groupId: img.groupId,
            isHome: img.isHome,
          });
        } catch (dbErr) {
          console.error("DB Update Error:", dbErr);
          res.status(500).json({ error: "Failed to update image in database" });
        }
      }
    );
    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Replace Route Error:", error);
    res.status(500).json({ error: "Internal server error during replace" });
  }
});

// Toggle isHome (admin only)
app.patch("/api/images/:id/toggle-home", verifyToken, async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).json({ error: "Image not found" });
    img.isHome = !img.isHome;
    await img.save();
    res.json({ _id: img._id, isHome: img.isHome });
  } catch (error) {
    console.error("Toggle isHome Error:", error);
    res.status(500).json({ error: "Failed to toggle isHome" });
  }
});

// Delete Route
app.delete("/api/images", verifyToken, async (req, res) => {
  try {
    const { id } = req.body; // Using cloudinaryId
    
    if (!id) {
      return res.status(400).json({ error: "Image ID is required" });
    }

    // Cloudinary destroy method
    const cloudinaryResult = await cloudinary.uploader.destroy(id);

    if (cloudinaryResult.result === 'ok' || cloudinaryResult.result === 'not found') {
      // Remove from DB even if not found in Cloudinary (orphan protection)
      await Image.findOneAndDelete({ cloudinaryId: id });
      
      res.status(200).json({ message: "Image deleted successfully", id });
    } else {
      res.status(400).json({ error: "Failed to delete image from Cloudinary: " + cloudinaryResult.result });
    }

  } catch (error) {
    console.error("Delete Route Error:", error);
    res.status(500).json({ error: "Internal server error during deletion" });
  }
});

// ===================== PRICING ROUTES =====================

// GET all pricing (public)
app.get("/api/pricing", async (req, res) => {
  try {
    const items = await Pricing.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (error) {
    console.error("Pricing Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch pricing" });
  }
});

// POST create pricing (admin only)
app.post("/api/pricing", verifyToken, async (req, res) => {
  try {
    const { name, description, price, order } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const newItem = new Pricing({ name, description, price, order: order || 0 });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Pricing Create Error:", error);
    res.status(500).json({ error: "Failed to create pricing item" });
  }
});

// PUT update pricing (admin only)
app.put("/api/pricing/:id", verifyToken, async (req, res) => {
  try {
    const { name, description, price, order } = req.body;
    const updated = await Pricing.findByIdAndUpdate(
      req.params.id,
      { name, description, price, order },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Pricing item not found" });
    res.json(updated);
  } catch (error) {
    console.error("Pricing Update Error:", error);
    res.status(500).json({ error: "Failed to update pricing item" });
  }
});

// DELETE pricing (admin only)
app.delete("/api/pricing/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Pricing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Pricing item not found" });
    res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Pricing Delete Error:", error);
    res.status(500).json({ error: "Failed to delete pricing item" });
  }
});

// ===================== CATEGORY ROUTES =====================

// GET all categories (public)
app.get("/api/categories", async (req, res) => {
  try {
    const items = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST create category (admin only)
app.post("/api/categories", verifyToken, async (req, res) => {
  try {
    const { name, slug, order } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }
    const existing = await Category.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Slug already exists" });
    }
    const newCat = new Category({ name, slug: slug.toLowerCase(), order: order || 0 });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (error) {
    console.error("Category Create Error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT update category (admin only)
app.put("/api/categories/:id", verifyToken, async (req, res) => {
  try {
    const { name, slug, order } = req.body;
    if (slug) {
      const existing = await Category.findOne({ slug: slug.toLowerCase(), _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ error: "Slug already exists" });
    }
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug: slug ? slug.toLowerCase() : undefined, order },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json(updated);
  } catch (error) {
    console.error("Category Update Error:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE category (admin only)
app.delete("/api/categories/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Category Delete Error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});


app.get("/", (req, res) => {
  res.send("Makeup Portfolio API Running");
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is awake" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Auto-ping mechanism to keep free hosting (Render/Railway) awake
  // Runs every 14 minutes (14 * 60 * 1000 ms)
  const PING_INTERVAL = 14 * 60 * 1000;
  const http = require("http");
  const https = require("https");
  
  setInterval(() => {
    // If you have a custom domain/URL, set it in .env as SERVER_URL
    const url = process.env.SERVER_URL ? `${process.env.SERVER_URL}/api/ping` : `http://localhost:${PORT}/api/ping`;
    console.log(`[Auto-Ping] Pinging ${url} to prevent sleep...`);
    
    const client = url.startsWith("https") ? https : http;
    client.get(url, (resp) => {
      let data = "";
      resp.on("data", (chunk) => { data += chunk; });
      resp.on("end", () => {
        console.log(`[Auto-Ping] Success: ${data}`);
      });
    }).on("error", (err) => {
      console.log(`[Auto-Ping] Error: ${err.message}`);
    });
  }, PING_INTERVAL);
});
