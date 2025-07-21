import { baseUrl } from "../others/base-url";
interface Disease {
  diseaseID: number;
  diseaseName: string;
  ricePathogen: string;
  symptoms: string;
  images: string[];
  userID: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchAllDiseases = async (): Promise<Disease[]> => {
  const response = await fetch(`${baseUrl}/api/disease`);
  if (!response.ok) {
    throw new Error("Failed to fetch diseases");
  }
  return response.json();
};

export const createNewDisease = async ({
  userID,
  diseaseName,
  diseaseEnName,
  ricePathogen,
  symptoms,
  images,
}: {
  userID: string;
  diseaseName: string;
  diseaseEnName: string;
  ricePathogen: string;
  symptoms: string;
  images: string[];
}): Promise<Disease> => {
  const response = await fetch(`${baseUrl}/api/disease`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID,
      diseaseName,
      diseaseEnName,
      ricePathogen,
      symptoms,
      images,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create disease");
  }

  return response.json();
};
