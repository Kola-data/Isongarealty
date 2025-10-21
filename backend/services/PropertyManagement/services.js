import { db } from "../../db.js";
import { cacheGet, cacheSet, cacheDel } from "../../utils/cache.js";
import fs from "fs";
import path from "path";

// ------------------- PROPERTIES -------------------

export const getProperties = async () => {
  try {
    const cacheKey = "properties:all";
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const properties = await db.all("SELECT * FROM properties ORDER BY created_at DESC");
    await cacheSet(cacheKey, properties, 300);
    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id) => {
  try {
    const cacheKey = `properties:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const property = await db.get("SELECT * FROM properties WHERE id = ?", [id]);
    if (property) await cacheSet(cacheKey, property, 300);
    return property;
  } catch (error) {
    console.error(`Error fetching property with id ${id}:`, error);
    throw error;
  }
};

export const createProperty = async (propertyData) => {
  try {
    const {
      title, description, price, address, city,
      type = "sale", status = "available", bedrooms = 0,
      bathrooms = 0, garages = 0, area = 0, main_image = null,
    } = propertyData;

    const result = await db.run(
      `INSERT INTO properties 
        (title, description, price, address, city, type, status, bedrooms, bathrooms, garages, area, main_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, address, city, type, status, bedrooms, bathrooms, garages, area, main_image]
    );

    const created = await getPropertyById(result.lastID);
    await cacheDel("properties:all");
    if (created?.id) await cacheDel(`properties:${created.id}`); // ensure fresh
    return created;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const {
      title, description, price, address, city,
      type, status, bedrooms, bathrooms, garages, area, main_image
    } = propertyData;

    await db.run(
      `UPDATE properties SET
        title = ?, description = ?, price = ?, address = ?, city = ?, type = ?, status = ?,
        bedrooms = ?, bathrooms = ?, garages = ?, area = ?, main_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, price, address, city, type, status, bedrooms, bathrooms, garages, area, main_image, id]
    );

    const updated = await getPropertyById(id);
    await cacheDel("properties:all");
    await cacheDel(`properties:${id}`);
    return updated;
  } catch (error) {
    console.error(`Error updating property with id ${id}:`, error);
    throw error;
  }
};

// Delete property and all images (main + gallery)
export const deleteProperty = async (id) => {
  try {
    const property = await getPropertyById(id);
    if (!property) throw new Error("Property not found");

    // Delete main image
    if (property.main_image) {
      const mainPath = path.join(process.cwd(), property.main_image.replace(/^\/uploads\//, "uploads/"));
      if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
    }

    // Delete gallery images
    const images = await db.all("SELECT * FROM property_images WHERE property_id = ?", [id]);
    for (const img of images) {
      const imgPath = path.join(process.cwd(), img.image_url.replace(/^\/uploads\//, "uploads/"));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.run("DELETE FROM property_images WHERE property_id = ?", [id]);
    await db.run("DELETE FROM properties WHERE id = ?", [id]);
    await cacheDel("properties:all");
    await cacheDel(`properties:${id}`);
  } catch (error) {
    console.error(`Error deleting property with id ${id}:`, error);
    throw error;
  }
};

// ------------------- PROPERTY IMAGES -------------------

export const imageUpload = async (propertyId, imagePath) => {
  try {
    const result = await db.run(
      "INSERT INTO property_images (property_id, image_url) VALUES (?, ?)",
      [propertyId, imagePath]
    );
    return await db.get("SELECT * FROM property_images WHERE id = ?", [result.lastID]);
  } catch (error) {
    console.error(`Error uploading image for property with id ${propertyId}:`, error);
    throw error;
  }
};

export const getPropertyImages = async (propertyId) => {
  try {
    return await db.all("SELECT * FROM property_images WHERE property_id = ?", [propertyId]);
  } catch (error) {
    console.error(`Error fetching images for property with id ${propertyId}:`, error);
    throw error;
  }
};

export const getPropertyImageById = async (imageId) => {
  try {
    return await db.get("SELECT * FROM property_images WHERE id = ?", [imageId]);
  } catch (error) {
    console.error(`Error fetching image with id ${imageId}:`, error);
    throw error;
  }
};

export const deletePropertyImage = async (imageId) => {
  try {
    const image = await getPropertyImageById(imageId);
    if (!image) throw new Error("Image not found");

    const imgPath = path.join(process.cwd(), image.image_url.replace(/^\/uploads\//, "uploads/"));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await db.run("DELETE FROM property_images WHERE id = ?", [imageId]);
    return { message: "Image deleted successfully" };
  } catch (error) {
    console.error(`Error deleting image with id ${imageId}:`, error);
    throw error;
  }
};
