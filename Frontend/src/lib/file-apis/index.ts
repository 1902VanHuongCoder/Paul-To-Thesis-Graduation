import { baseUrl } from "../others/base-url";
export const uploadSingleImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url || data.path;
  }
  catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const response = await fetch(`${baseUrl}/api/upload/multiple`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((file: { url: string }) => file.url); 
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
}

export const deleteAImage = async (url: string): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/api/upload/single-delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};


export const deleteMultipleImages = async (urls: string[]): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/api/upload/multiple-delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: urls }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete files: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting files:", error);
    throw error;
  }
}



