// requestedProperties.js
import { db } from "../../db.js";

// ✅ Add property request (explicitly set status & is_read)
export const addPropertyRequest = async (propertyData) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      description,
      property_type,
    } = propertyData;

    // Explicitly set default values
    const status = 'pending';
    const is_read = 0;

    const result = await db.run(
      `INSERT INTO requested_properties 
        (first_name, last_name, phone, email, description, property_type, status, is_read) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, phone, email, description, property_type, status, is_read]
    );

    return { message: "Property request sent successfully" };
  } catch (error) {
    console.error("Error adding property:", error);
    throw error;
  }
};

// ✅ Get all properties
export const getAllRequestedProperties = async () => {
  try {
    const properties = await db.all(`
      SELECT id, first_name, last_name, phone, email, description, property_type, status, is_read, created_at, updated_at
      FROM requested_properties
      ORDER BY created_at DESC
    `);
    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

// ✅ Change property status
export const changeRequestedPropertyStatus = async (id, status) => {
  try {
    await db.run(
      `UPDATE requested_properties 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );
    return { message: "Status updated successfully" };
  } catch (error) {
    console.error(`Error updating requested property:`, error);
    throw error;
  }
};

// ✅ Mark property as read/unread
export const changeReadProperty = async (id, is_read) => {
  try {
    await db.run(
      `UPDATE requested_properties 
       SET is_read = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [is_read, id]
    );
    return { message: "Read status updated successfully" };
  } catch (error) {
    console.error(`Error updating read status for requested property:`, error);
    throw error;
  }
};
