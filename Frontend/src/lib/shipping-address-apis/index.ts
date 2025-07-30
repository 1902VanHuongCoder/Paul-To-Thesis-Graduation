import { baseUrl } from "../others/base-url";

export const addNewShippingAddress = async ({
  userID,
  address,
  phone,
  isDefault,
}: {
  userID: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}) => {
  try {
    const response = await fetch(`${baseUrl}/api/shipping-address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID,
        address,
        phone,
        isDefault,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add shipping address");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding shipping address:", error);
    throw error;
  }
};

export const getShippingAddressesByUserID = async (userID: string) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/shipping-address/user/${userID}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch shipping addresses");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    throw error;
  }
};

export const setAddressAsDefault = async ({
  shippingAddressID,
  userID,
}: {
  shippingAddressID: number;
  userID: string;
}) => {
  try {
    await fetch(
      `${baseUrl}/api/shipping-address/${userID}/${shippingAddressID}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      }
    );
  } catch (error) {
    console.error("Error updating shipping address:", error);
    throw error;
  }
};

export const deleteShippingAddress = async (
  shippingAddressID: number,
  userID: string
) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/shipping-address/${userID}/${shippingAddressID}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete shipping address");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting shipping address:", error);
    throw error;
  }
};
