import { db } from "../../db.js";
import { hashPassword } from "../../utils/pwdHandle.js";


export const getUserById = async (userId) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await db.all('SELECT * FROM users');
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};  

export const createUser = async (userData) => {
  try {
    const { name, email, password, role } = userData;
    const hashedPassword = await hashPassword(password);
    const result = await db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    return result.lastID; // Return the ID of the newly created user
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
export const updateUser = async (userId, userData) => {
  try {
    const { name, email, password, role } = userData;
    const hashedPassword = await hashPassword(password);
    await db.run('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, hashedPassword, role, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};