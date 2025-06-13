import { Request, Response } from "express";
import cloudinary from "../configs/cloudinary-connect"; // Adjust the import path as necessary
export const uploadFile = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Cloudinary response is available in req.file
    res.status(200).json({
      message: "File uploaded successfully",
      url: req.file.path,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const uploadMultiFiles = (req: Request, res: Response): void => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    // Cloudinary responses are available in req.files
    const uploadedFiles = req.files.map((file: any) => ({
      url: file.path,
      filename: file.filename,
    }));

    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const uploadBase64File = async (req: Request, res: Response) => {
  try {
    const { file } = req.body; // file is a base64 string
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Upload base64 directly to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(file, {
      folder: "uploads", // optional: your Cloudinary folder
    });

    res.status(200).json({
      message: "File uploaded successfully",
      url: uploadRes.secure_url,
    });
  } catch (error) {
    console.error("Error uploading base64 file:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Helper to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  // Example: https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/filename.jpg
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
}

export const deleteSingleImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.body; // or req.query if you prefer
    console.log(url);
    if (!url) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    const publicId = getPublicIdFromUrl(url);
    console.log("Public ID:", publicId); // Debugging line to check the public ID
    if (!publicId) {
      res.status(400).json({ error: "Invalid Cloudinary URL" });
      return;
    }

    await cloudinary.api.delete_resources([publicId]);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// Delete multiple images
export const deleteMultipleImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { urls } = req.body; // Expecting an array of URLs
    if (!urls || !Array.isArray(urls)) {
      res.status(400).json({ error: "Image URLs are required" });
      return;
    }

    console.log("Received URLs:", urls); // Debugging line to check the received URLs
    
    const publicIds = urls.map(getPublicIdFromUrl).filter((id) => id !== null);
    if (publicIds.length === 0) {
      res.status(400).json({ error: "No valid Cloudinary URLs provided" });
      return;
    }

    await cloudinary.api.delete_resources(publicIds);
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}