"use client";
import { baseUrl } from "@/lib/base-url";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDictionary } from "./dictonary-context";

export interface CartItem {
    quantity: number;
    price: number;
    discount: number;
}
export interface Product {
    productID: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    images: string[];
    rating: number;
    createdAt: string;
    updatedAt: string;
    CartItem: CartItem;
}

export interface Cart {
    cartID: number;
    totalQuantity: number;
    products: Product[];
}

interface ShoppingCartContextProps {
    cart: Cart;
    setCart: React.Dispatch<React.SetStateAction<Cart>>;
    addToCart: (productID: number) => void;
    removeFromCart: (productID: number, cartID: number) => void;
    clearCart: () => void;
    updateCart: (cartID: number, productID: number, quantity: number) => void;
    fetchCart: (customerID: number) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextProps | undefined>(undefined);

export function useShoppingCart() {
    const ctx = useContext(ShoppingCartContext);
    if (!ctx) throw new Error("useShoppingCart must be used within a ShoppingCartProvider");
    return ctx;
}

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
    const {dictionary: d} = useDictionary();
    const [cart, setCart] = useState<Cart>({
        cartID: 0,
        totalQuantity: 0,
        products: [],
    });

    const fetchCart = async (customerID: number) => {
        try {
            const res = await fetch(`${baseUrl}/api/shopping-cart/${customerID}`);
            if (!res.ok) throw new Error("Failed to fetch cart");
            const data = await res.json();
            setCart(data);
        } catch (error) {
            console.error("Fetch cart error:", error);
            throw error;
        }
    };

    const addToCart = async (productID: number) => {
        try {
            const res = await fetch(`${baseUrl}/api/shopping-cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productID, customerID: 1, quantity: 1 }),
            });
            if (!res.ok) throw new Error("Failed to add to cart");
            toast.success(d?.toastAddToCartSuccess || "Thêm vào giỏ hàng thành công");
            fetchCart(1);
            return await res.json();
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error(d?.toastAddToCartError || "Thêm vào giỏ hàng thất bại");
            throw error;
        }
    };
    const updateCart = async (cartID: number, productID: number, quantity: number) => {
        try {
            const res = await fetch(`${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });
            if (!res.ok) throw new Error("Failed to update cart");
            return await res.json();
        } catch (error) {
            console.error("Update cart error:", error);
            throw error;
        }
    }

    const removeFromCart = async (productID: number, cartID: number) => {
        try {
            const res = await fetch(`${baseUrl}/api/shopping-cart/${cartID}/product/${productID}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to remove from cart");
            return res.json();

        } catch (error) {
            console.error("Remove from cart error:", error);
            throw error;
        }

    };

    const clearCart = async (customerID = 1) => {
        try {
            const res = await fetch(`${baseUrl}/api/shopping-cart/customer/${customerID}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to clear cart");
            setCart({
                cartID: 0,
                totalQuantity: 0,
                products: [],
            });
        } catch (error) {
            console.error("Clear cart error:", error);
            throw error;
        }
    };

    useEffect(() => {
        const customerID = 1; // Replace with actual customer ID
        fetchCart(customerID).catch((error) => {
            toast.success(d?.toastFetchCartError || "Tai gio hang thanh cong");
            console.error("Error fetching cart on mount:", error);
        });
    }, []);

    return (
        <ShoppingCartContext.Provider
            value={{ cart, setCart, addToCart, removeFromCart, clearCart, updateCart, fetchCart }}
        >
            {children}
        </ShoppingCartContext.Provider>
    );
}