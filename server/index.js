const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { verifyToken } = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

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

// Upload Route
app.post("/api/images/upload", verifyToken, upload.single("image"), (req, res) => {
  try {
    const { category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const folderMap = {
      beauty: "makeup/beauty",
      bridal: "makeup/bridal",
      event: "makeup/event",
      fashion: "makeup/fashion",
    };

    const targetFolder = folderMap[category.toLowerCase()];
    if (!targetFolder) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Use upload_stream to upload memory buffer from multer to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: targetFolder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }
        res.status(200).json({
          message: "Upload successful",
          image: {
            id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            folder: result.folder,
          },
        });
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
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Image ID is required" });
    }

    // Cloudinary destroy method
    const result = await cloudinary.uploader.destroy(id);

    if (result.result === 'ok') {
      res.status(200).json({ message: "Image deleted successfully", id });
    } else {
      res.status(400).json({ error: "Failed to delete image: " + result.result });
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
