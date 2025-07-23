"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "./user-context";
import { addToWishlistList, fetchWishlistByCustomerID, removeFromWishlistList } from "@/lib/wishlist-apis";

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
}

export interface WishlistItem {
  wishlistID: number;
  customerID: string;
  productID: number;
  product: Product;
}

interface WishlistContextProps {
  wishlists: WishlistItem[];
  setWishlist: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
  fetchWishlist: (customerID: string) => Promise<void>;
  addToWishlist: (customerID: string, productID: number) => Promise<void>;
  removeFromWishlist: (customerID: string, productID: number) => Promise<void>;
  clearWishlist: (customerID: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [wishlists, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async (customerID: string) => {
    const data = await fetchWishlistByCustomerID(customerID);
    setWishlist(data);
  };

  const addToWishlist = async (customerID: string, productID: number) => {
    try {
      await addToWishlistList(customerID, productID);
      await fetchWishlist(customerID);
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Lỗi khi thêm vào danh sách yêu thích");
    }
  };

  const removeFromWishlist = async (customerID: string, productID: number) => {
    try {
      await removeFromWishlistList(customerID, productID);
      await fetchWishlist(customerID);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const clearWishlist = async (customerID: string) => {
    try {
      await clearWishlist(customerID);
      setWishlist([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Lỗi khi xóa toàn bộ danh sách yêu thích");
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist(user.userID);
    }
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlists,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        setWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}