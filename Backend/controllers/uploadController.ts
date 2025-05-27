import { Request, Response } from "express";

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