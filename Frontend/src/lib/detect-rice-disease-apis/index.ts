import { baseUrl } from "../others/base-url";

type Disease = {
  diseaseID?: number;
  diseaseName?: string;
  diseaseEnName?: string;
  ricePathogen?: string;
  symptoms?: string;
  images?: string[];
};

export const detectRiceDisease = async (
  file: File
): Promise<{
  predicted_class: string;
  all_probs: Array<[string, number]>;
  processed_image: string | null;
  roboflow_result: Array<{ x: number; y: number; width: number; height: number; confidence: number }>;
}> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    // "https://paul-to-thesis-graduation-2.onrender.com/predict",
    `http://127.0.0.1:8000/predict`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to detect rice disease");
  }

  return response.json();
};

export const getDiseaseDetails = async (
  diseaseEnName: string
): Promise<Disease | null> => {
  const response = await fetch(
    `${baseUrl}/api/disease/private/by-en-name/${diseaseEnName}`
  );
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
};
