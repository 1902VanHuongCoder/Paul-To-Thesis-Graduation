import { baseUrl } from "../others/base-url";
interface Disease {
  diseaseID: number;
  diseaseName: string;
  diseaseEnName: string;
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

export const fetchDiseaseById = async (diseaseID: string): Promise<Disease> => {
  const response = await fetch(`${baseUrl}/api/disease/${diseaseID}`);
  if (!response.ok) {
    throw new Error("Failed to fetch disease");
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

export const updateDisease = async (
  diseaseID: number,
  data: Partial<Omit<Disease, "diseaseID" | "createdAt" | "updatedAt">>
): Promise<Disease> => {
  const response = await fetch(`${baseUrl}/api/disease/${diseaseID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update disease");
  }
  return response.json();
};

export const deleteDisease = async (
  diseaseID: number
): Promise<{ message: string; status: number }> => {
  const response = await fetch(`${baseUrl}/api/disease/${diseaseID}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete disease");
  }
  return { message: data.message, status: response.status };
};
