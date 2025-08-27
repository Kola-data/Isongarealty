import express from "express";
import { authenticateJWT } from "../../utils/authMiddleware.js";
import * as requestedPropertyServices from "./services.js";

const requestedPropertyRouter = express.Router();

// ---------------- PUBLIC ROUTES ----------------

// Get all requested properties
requestedPropertyRouter.get("/", authenticateJWT, async (req, res) => {
  try {
    const properties = await requestedPropertyServices.getAllRequestedProperties();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requested properties", error: error.message });
  }
});
// ---------------- PROTECTED ROUTES ----------------
// Add a new requested property
requestedPropertyRouter.post("/", async (req, res) => {
  try {
    const propertyData = req.body;
    const newProperty = await requestedPropertyServices.addPropertyRequest(propertyData);
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: "Error adding requested property", error: error.message });
  }
});

// Change requested property status
requestedPropertyRouter.patch("/:id/status", authenticateJWT, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const result = await requestedPropertyServices.changeRequestedPropertyStatus(id, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating requested property status", error: error.message });
  }
});

// Change read property
requestedPropertyRouter.patch("/:id/read", authenticateJWT, async (req, res) => {
  try {
    const { is_read } = req.body;
    const { id } = req.params;
    const result = await requestedPropertyServices.changeReadProperty(id, is_read);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating read property", error: error.message });
  }
});

export default requestedPropertyRouter;