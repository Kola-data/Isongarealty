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
    const params = [name, email];
    let query = "UPDATE users SET name = ?, email = ?";

    if (password) {
      const hashed = await hashPassword(password);
      query += ", password = ?";
      params.push(hashed);
    }

    query += " WHERE id = ?";
    params.push(id);

    await db.run(query, params);
    return { message: "Profile updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update profile");
  }
};
