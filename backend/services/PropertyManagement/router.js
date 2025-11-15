import express from "express";
import * as propertyServices from "./services.js";
import { authenticateJWT } from "../../utils/authMiddleware.js";
import { upload } from "../../utils/upload.js"; // multer config
import fs from "fs";
import path from "path";

const propertyRouter = express.Router();

// ---------------- PUBLIC ROUTES ----------------

// Get all properties
propertyRouter.get("/", async (req, res) => {
  try {
    const properties = await propertyServices.getProperties();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties", error: error.message });
  }
});

// Get property by ID
propertyRouter.get("/:id", async (req, res) => {
  try {
    const property = await propertyServices.getPropertyById(req.params.id);
    if (property) res.json(property);
    else res.status(404).json({ message: "Property not found" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching property", error: error.message });
  }
});

// Get all images of a property
propertyRouter.get("/:id/images", async (req, res) => {
  try {
    const images = await propertyServices.getPropertyImages(req.params.id);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Error fetching property images", error: error.message });
  }
});

// ---------------- PROTECTED ROUTES ----------------

// Create property with main image
propertyRouter.post("/", authenticateJWT, upload.single("main_image"), async (req, res) => {
  try {
    // Debug: Log all body fields to see what's being received
    console.log(`[router] Create property: req.body keys:`, Object.keys(req.body));
    console.log(`[router] Create property: req.body.currency="${req.body.currency}", type:`, typeof req.body.currency);
    
    // Ensure currency is properly extracted and validated
    const currency = req.body.currency && (req.body.currency === "RWF" || req.body.currency === "USD") 
      ? req.body.currency 
      : "RWF";
    console.log(`[router] Create property: received currency="${req.body.currency}", using="${currency}"`);
    
    const propertyData = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type || "sale",
      status: req.body.status || "available",
      price: Number(req.body.price) || 0,
      address: req.body.address,
      city: req.body.city,
      bedrooms: Number(req.body.bedrooms) || 0,
      bathrooms: Number(req.body.bathrooms) || 0,
      garages: Number(req.body.garages) || 0,
      area: Number(req.body.area) || 0,
      main_image: req.file ? `/uploads/${req.file.filename}` : null,
      currency,
    };

    const property = await propertyServices.createProperty(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: "Error creating property", error: error.message });
  }
});

// Update property with main image
propertyRouter.put("/:id", authenticateJWT, upload.single("main_image"), async (req, res) => {
  try {
    const existing = await propertyServices.getPropertyById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Property not found" });

    let main_image = existing.main_image;
    if (req.file) {
      if (existing.main_image) {
        const oldPath = path.join(process.cwd(), existing.main_image.replace(/^\/uploads\//, "uploads/"));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      main_image = `/uploads/${req.file.filename}`;
    }

    // Ensure currency is properly extracted and validated
    // Debug: Log all body fields to see what's being received
    console.log(`[router] Update property ${req.params.id}: req.body keys:`, Object.keys(req.body));
    console.log(`[router] Update property ${req.params.id}: req.body.currency="${req.body.currency}", type:`, typeof req.body.currency);
    
    const currency = req.body.currency && (req.body.currency === "RWF" || req.body.currency === "USD") 
      ? req.body.currency 
      : (existing.currency || "RWF");
    console.log(`[router] Update property ${req.params.id}: received currency="${req.body.currency}", using="${currency}", existing="${existing.currency}"`);

    const propertyData = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type || "sale",
      status: req.body.status || "available",
      price: Number(req.body.price) || 0,
      address: req.body.address,
      city: req.body.city,
      bedrooms: Number(req.body.bedrooms) || 0,
      bathrooms: Number(req.body.bathrooms) || 0,
      garages: Number(req.body.garages) || 0,
      area: Number(req.body.area) || 0,
      main_image,
      currency,
    };

    const updated = await propertyServices.updateProperty(req.params.id, propertyData);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating property", error: error.message });
  }
});

// Delete property and all its images
propertyRouter.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const property = await propertyServices.getPropertyById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    await propertyServices.deleteProperty(req.params.id);

    res.json({ message: "Property and all images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property", error: error.message });
  }
});

// Upload multiple gallery images
propertyRouter.post("/:id/images", authenticateJWT, upload.array("images", 10), async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    for (const file of req.files) {
      await propertyServices.imageUpload(propertyId, `/uploads/${file.filename}`);
    }

    res.json({ message: `${req.files.length} images uploaded successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
});

// Delete single gallery image
propertyRouter.delete("/image/:imageId", authenticateJWT, async (req, res) => {
  try {
    const image = await propertyServices.getPropertyImageById(req.params.imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    await propertyServices.deletePropertyImage(req.params.imageId);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
});

export default propertyRouter;
