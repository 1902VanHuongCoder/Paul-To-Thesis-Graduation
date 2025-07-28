import { baseUrl } from "../others/base-url";

export const fetchWishlistByCustomerID = async (customerID: string) => {
  const res = await fetch(`${baseUrl}/api/wishlist/${customerID}`);
  if (!res.ok) {
    throw new Error("Failed to fetch wishlist");
  }
  return res.json();
};

export const addToWishlistList = async (
  customerID: string,
  productID: number
) => {
  const res = await fetch(`${baseUrl}/api/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerID, productID }),
  });
  const data = await res.json();
  return { status: res.status, message: data.message };
};

export const removeFromWishlistList = async (
  customerID: string,
  productID: number
) => {
  const res = await fetch(`${baseUrl}/api/wishlist`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerID, productID }),
  });
  if (!res.ok) {
    throw new Error("Failed to remove from wishlist");
  }
  return res.json();
};

export const clearWishlist = async (customerID: string) => {
  const res = await fetch(`${baseUrl}/api/wishlist/clear/${customerID}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to clear wishlist");
  }
  return res.json();
};
