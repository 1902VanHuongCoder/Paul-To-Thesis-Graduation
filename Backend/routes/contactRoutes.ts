import express from "express";
import {
    createContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
} from "../controllers/contactController";

const router = express.Router();

// Create a new contact message
router.post("/", createContact);

// Get all contact messages (admin)
router.get("/", getAllContacts);

// Get a single contact message by ID
router.get("/:contactID", getContactById);

// Update contact status
router.put("/:contactID/status", updateContactStatus);

export default router;