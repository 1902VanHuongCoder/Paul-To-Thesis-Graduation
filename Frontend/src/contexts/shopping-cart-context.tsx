"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "./user-context";
import { addProductToCart, clearShoppingCart, fetchCartByCustomerID, removeProductFromShoppingCart, updateShoppingCart } from "@/lib/shopping-cart-apis";

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
    addToCart: (productID: number, quantity: number) => void;
    removeFromCart: (productID: number, cartID: number) => void;
    clearCart: () => void;
    updateCart: (cartID: number, productID: number, quantity: number) => void;
    fetchCart: (customerID: string) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextProps | undefined>(undefined);

export function useShoppingCart() {
    const ctx = useContext(ShoppingCartContext);
    if (!ctx) throw new Error("useShoppingCart must be used within a ShoppingCartProvider");
    return ctx;
}

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [cart, setCart] = useState<Cart>({
        cartID: 0,
        totalQuantity: 0,
        products: [],
    });

    const fetchCart = async (customerID: string) => {
        try {
            const data = await fetchCartByCustomerID(customerID);
            setCart(data);
        } catch (error) {
            console.error("Fetch cart error:", error);
            throw error;
        }
    };

    const addToCart = async (productID: number, quantity: number) => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
            return;
        }
        try {
            const data = await addProductToCart(productID, user.userID, quantity);
            fetchCart(user.userID);
            toast.success("Thêm vào giỏ hàng thành công");
            return data;
        } catch (error) {
            toast.error("Thêm vào giỏ hàng thất bại!");
            console.error("Add to cart error:", error);
            throw error;
        }
    };

    const updateCart = async (cartID: number, productID: number, quantity: number) => {
        if (!user) {
            // toast.error("Bạn cần đăng nhập để cập nhật giỏ hàng");
            return;
        }
        try {
            const data = await updateShoppingCart(cartID, productID, quantity);
            fetchCart(user.userID);
            return data;
        } catch (error) {
            console.error("Update cart error:", error);
            throw error;
        }
    }

    const removeFromCart = async (productID: number, cartID: number) => {
        if (!user) {
            // toast.error("Bạn cần đăng nhập để xoá sản phẩm khỏi giỏ hàng");
            return;
        }
        try {
            const data = await removeProductFromShoppingCart(cartID, productID);
            fetchCart(user.userID);
            return data;
        } catch (error) {
            console.error("Remove from cart error:", error);
            throw error;
        }
    };

    const clearCart = async () => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để xóa giỏ hàng");
            return;
        }
        try {
            await clearShoppingCart(user.userID);
            setCart({
                cartID: 0,
                totalQuantity: 0,
                products: [],
            });
            toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
        } catch (error) {
            console.error("Clear cart error:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (user) {
            fetchCart(user.userID);
        } else {
            return;
        }
    }, [user]);

    return (
        <ShoppingCartContext.Provider
            value={{ cart, setCart, addToCart, removeFromCart, clearCart, updateCart, fetchCart }}
        >
            {children}
        </ShoppingCartContext.Provider>
    );
}