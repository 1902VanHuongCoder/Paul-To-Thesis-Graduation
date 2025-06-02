import cloudinary from "./cloudinary-connect";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads", // Folder name in Cloudinary
      resource_type: file.mimetype.startsWith("video") ? "video" : "image", // Handle images and videos
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and MP4 are allowed.")
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

export default upload;
