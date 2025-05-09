import express from "express";
import upload from "../configs/multer-config";
import { uploadFile, uploadMultiFiles } from "../controllers/uploadController";

const router = express.Router();

// POST route to upload a file
router.post("/", upload.single("file"), uploadFile);

// POST route to upload multiple files
router.post("/multiple", upload.array("files", 10), uploadMultiFiles); // Allow up to 10 files

export default router;