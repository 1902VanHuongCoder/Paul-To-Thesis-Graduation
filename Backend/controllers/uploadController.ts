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
