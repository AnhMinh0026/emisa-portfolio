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
