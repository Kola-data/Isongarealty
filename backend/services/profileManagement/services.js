import { hashPassword } from "../../utils/pwdHandle.js";
import { db } from "../../db.js";

// Fetch user by ID
export const getUserProfile = async (id) => {
  try {
    const user = await db.get("SELECT id, name, email FROM users WHERE id = ?", [id]);
    return user;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user");
  }
};

// Update user by ID
export const updateUserProfile = async (id, { name, email, password }) => {
  try {
    const updates = [];
    const params = [];

    // Dynamically add fields to update based on their existence
    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }
    if (password) {
      const hashed = await hashPassword(password);
      updates.push("password = ?");
      params.push(hashed);
    }
    
    // If no fields are provided to update, we can exit early.
    if (updates.length === 0) {
      return { message: "No fields to update" };
    }

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    params.push(id);

    await db.run(query, params);
    return { message: "Profile updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update profile");
  }
};

