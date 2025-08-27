import express from "express";
import { getUserProfile, updateUserProfile } from "./services.js";
import { authenticateJWT } from "../../utils/authMiddleware.js"; // optional JWT auth middleware

const router = express.Router();

// Get user profile
router.get("/profile/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await getUserProfile(userId);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email, password } = req.body;
    const updated = await updateUserProfile(userId, { name, email, password });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
