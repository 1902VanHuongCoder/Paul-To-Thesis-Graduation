import express from "express";
import upload from "../configs/multer-config";
import { uploadBase64File, uploadFile, uploadMultiFiles } from "../controllers/uploadController";

const router = express.Router();

// POST route to upload a file
router.post("/", upload.single("file"), uploadFile);

// POST route to upload multiple files
router.post("/multiple", upload.array("files", 10), uploadMultiFiles); // Allow up to 10 files

// New route for base64 uploads
router.post("/base64", (req, res, next) => {
  uploadBase64File(req, res).catch(next);
});

export default router;