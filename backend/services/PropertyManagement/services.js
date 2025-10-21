import { db } from "../../db.js";
import { cache } from "../../utils/cache.js";
import fs from "fs";
import path from "path";

// ------------------- PROPERTIES -------------------

export const getProperties = async (options = {}) => {
  try {
    const { 
      useCache = true, 
      ttl = 300, 
      strategy = 'cache_aside',
      includeStats = false 
    } = options;
    
    const cacheKey = "properties:all";
    
    if (useCache) {
      // Use cache-aside pattern with enhanced error handling
      const data = await cache.cacheAside(
        cacheKey,
        async () => {
          console.log('[cache] Cache miss for properties:all, fetching from database');
          return await db.all("SELECT * FROM properties ORDER BY created_at DESC");
        },
        ttl
      );
      
      if (includeStats) {
        return { data, stats: cache.getStats() };
      }
      return data;
    } else {
      // Direct database fetch
      const properties = await db.all("SELECT * FROM properties ORDER BY created_at DESC");
      return properties;
    }
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id, options = {}) => {
  try {
    const { 
      useCache = true, 
      ttl = 300, 
      includeImages = false,
      includeStats = false 
    } = options;
    
    const cacheKey = `properties:${id}`;
    
    if (useCache) {
      const data = await cache.cacheAside(
        cacheKey,
        async () => {
          console.log(`[cache] Cache miss for properties:${id}, fetching from database`);
          const property = await db.get("SELECT * FROM properties WHERE id = ?", [id]);
          
          if (property && includeImages) {
            const images = await db.all("SELECT * FROM property_images WHERE property_id = ?", [id]);
            property.images = images;
          }
          
          return property;
        },
        ttl
      );
      
      if (includeStats) {
        return { data, stats: cache.getStats() };
      }
      return data;
    } else {
      const property = await db.get("SELECT * FROM properties WHERE id = ?", [id]);
      
      if (property && includeImages) {
        const images = await db.all("SELECT * FROM property_images WHERE property_id = ?", [id]);
        property.images = images;
      }
      
      return property;
    }
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
    
    // Enhanced cache invalidation with write-through strategy
    await cache.invalidateRelated("properties:all", [`properties:${result.lastID}`]);
    
    // Warm cache with new data
    if (created) {
      await cache.set(`properties:${result.lastID}`, created, 300);
    }
    
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
    
    // Enhanced cache invalidation
    await cache.invalidateRelated("properties:all", [`properties:${id}`]);
    
    // Warm cache with updated data
    if (updated) {
      await cache.set(`properties:${id}`, updated, 300);
    }
    
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
    
    // Enhanced cache invalidation
    await cache.invalidateRelated("properties:all", [`properties:${id}`]);
    
    return { message: "Property deleted successfully" };
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

export const getPropertyImages = async (propertyId, options = {}) => {
  try {
    const { useCache = true, ttl = 300 } = options;
    const cacheKey = `property_images:${propertyId}`;
    
    if (useCache) {
      const data = await cache.cacheAside(
        cacheKey,
        async () => {
          console.log(`[cache] Cache miss for property_images:${propertyId}, fetching from database`);
          return await db.all("SELECT * FROM property_images WHERE property_id = ?", [propertyId]);
        },
        ttl
      );
      return data;
    } else {
      return await db.all("SELECT * FROM property_images WHERE property_id = ?", [propertyId]);
    }
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
