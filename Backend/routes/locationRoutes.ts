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
router.get("/:locationID", getLocationById);

// POST a new location
router.post("/", createLocation);

// PUT (update) an existing location by ID
router.put("/:locationID", updateLocation);

// DELETE a location by ID
router.delete("/:locationID", deleteLocation);

export default router;