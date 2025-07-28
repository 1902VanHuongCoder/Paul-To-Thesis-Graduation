import { baseUrl } from "../others/base-url";

type DeliveryFormValues = {
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  isActive: boolean;
  isDefault: boolean;
};

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

export const createDeliveryMethod = async (methodData: DeliveryFormValues) => {
  try {
    const response = await fetch(`${baseUrl}/api/delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(methodData),
    });
    if (!response.ok) {
      throw new Error("Failed to create delivery method");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating delivery method:", error);
    throw error;
  }
}

export const updateDeliveryMethod = async (deliveryID: number, methodData: DeliveryFormValues) => {
  try {
    const response = await fetch(`${baseUrl}/api/delivery/${deliveryID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(methodData),
    });
    if (!response.ok) {
      throw new Error("Failed to update delivery method");
    }
    return await response.json();
  }
  catch (error) {
    console.error("Error updating delivery method:", error);
    throw error;
  }
}

export const deleteDeliveryMethod = async (deliveryID: number) => {

    const response = await fetch(`${baseUrl}/api/delivery/${deliveryID}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return { message: data.message, status: response.status };
}