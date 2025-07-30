import { baseUrl } from "../others/base-url";

export const fetchAllInventoryTransactions = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/inventory-transaction`);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory transactions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    throw error;
  }
}