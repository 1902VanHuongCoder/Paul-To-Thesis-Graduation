import { baseUrl } from "../others/base-url";

export const fetchDeliveryMethods = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/delivery`);
    if (!response.ok) {
      throw new Error("Failed to fetch delivery methods");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching delivery methods:", error);
    throw error;
  }
};
