import { baseUrl } from "../others/base-url";

export const fetchCartByCustomerID = async (customerID: string) => {
  const res = await fetch(`${baseUrl}/api/shopping-cart/${customerID}`);
  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }
  const data = await res.json();
  return data;
};

export const addProductToCart = async (
  productID: number,
  customerID: string,
  quantity: number
) => {
  const res = await fetch(`${baseUrl}/api/shopping-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productID, customerID, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to cart");
  }

  const data = await res.json();
  return data;
};

// Add a new shopping cart for a customer using barcode
export const createShoppingCartWithBarcode = async (
  customerID: string,
  barcode: string,
  quantity: number
) => {
  
  console.log(customerID, barcode, quantity); 

  const res = await fetch(`${baseUrl}/api/shopping-cart/barcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerID, barcode, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to create shopping cart with barcode");
  }

  const data = await res.json();
  return data;
};

// Update an existing shopping cart item quantity using barcode
export const updateShoppingCartWithBarcode = async (
  cartID: number,
  barcode: string,
  quantity: number
) => {
  const res = await fetch(`${baseUrl}/api/shopping-cart/barcode`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartID, barcode, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to update shopping cart with barcode");
  }

  const data = await res.json();
  return data;
};

export const updateShoppingCart = async (
  cartID: number,
  productID: number,
  quantity: number
) => {
  const res = await fetch(
    `${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update cart");
  }

  const data = await res.json();
  return data;
};

export const removeProductFromShoppingCart = async (
  cartID: number,
  productID: number
) => {
  const res = await fetch(
    `${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to remove product from cart");
  }

  return await res.json();
};

export const clearShoppingCart = async (customerID: string) => {
  const res = await fetch(
    `${baseUrl}/api/shopping-cart/customer/${customerID}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to clear cart");
  }

  return await res.json();
};
