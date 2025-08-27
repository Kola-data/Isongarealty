import express from "express";
import { db } from "../../db.js"; // your sqlite3 db connection

const router = express.Router();

// GET dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const users = await db.get("SELECT COUNT(*) as total FROM users");
    const properties = await db.get("SELECT COUNT(*) as total FROM properties");
    const requests = await db.get("SELECT COUNT(*) as total FROM requested_properties");

    // Use keys matching frontend StatsType
    res.json({
      totalUsers: users.total,
      totalProperties: properties.total,
      totalRequests: requests.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
