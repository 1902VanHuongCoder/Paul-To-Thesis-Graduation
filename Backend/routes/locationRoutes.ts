import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController";

const router = express.Router();

// GET all locations
router.get("/", getAllLocations);

// GET a specific location by ID
router.get("/:id", getLocationById);

// POST a new location
router.post("/", createLocation);

// PUT (update) an existing location by ID
router.put("/:id", updateLocation);

// DELETE a location by ID
router.delete("/:id", deleteLocation);

export default router;