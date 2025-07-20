import { baseUrl } from "../others/base-url";

export const fetchCartByCustomerID = async (customerID: string) => {
    const res = await fetch(`${baseUrl}/api/shopping-cart/${customerID}`);
    if (!res.ok) {
        throw new Error("Failed to fetch cart");
    }
    const data = await res.json();
    return data;
}

export const addProductToCart = async (productID: number, customerID: string, quantity: number) => {
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
}

export const updateShoppingCart = async (cartID: number, productID: number, quantity: number) => {
    const res = await fetch(`${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
        throw new Error("Failed to update cart");
    }

    const data = await res.json();
    return data;
}

export const removeProductFromShoppingCart = async (cartID: number, productID: number) => {
    const res = await fetch(`${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error("Failed to remove product from cart");
    }

    return await res.json();
}

export const clearShoppingCart = async (customerID: string) => {
    const res = await fetch(`${baseUrl}/api/shopping-cart/customer/${customerID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error("Failed to clear cart");
    }

    return await res.json();
}