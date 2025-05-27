"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";
import toast from "react-hot-toast";
import { useDictionary } from "./dictonary-context";

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
  customerID: number;
  productID: number;
  product: Product;
}

interface WishlistContextProps {
  wishlists: WishlistItem[];
  setWishlist: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
  fetchWishlist: (customerID: number) => Promise<void>;
  addToWishlist: (customerID: number, productID: number) => Promise<void>;
  removeFromWishlist: (customerID: number, productID: number) => Promise<void>;
  clearWishlist: (customerID: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const {dictionary:d} = useDictionary();
  const [wishlists, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async (customerID: number) => {
    const res = await fetch(`${baseUrl}/api/wishlist/${customerID}`);
    const data = await res.json();
    setWishlist(data);
  };

  const addToWishlist = async (customerID: number, productID: number) => {
    try {
      const res = await fetch(`${baseUrl}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerID, productID }),
      });
      if (res.ok) {
        await fetchWishlist(customerID);
        toast.success(d?.wishlistAddToWishlistSuccess || "Thêm vào danh sách yêu thích thành công");
      }
    }catch (error) { 
      console.error("Error adding to wishlist:", error);
      toast.error(d?.wishlistAddToWishlistError || "Lỗi khi thêm vào danh sách yêu thích");
    }
    
    
  };

  const removeFromWishlist = async (customerID: number, productID: number) => {
    const res = await fetch(`${baseUrl}/api/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerID, productID }),
    });
    if (res.ok) {
      await fetchWishlist(customerID);
    }
  };

  const clearWishlist = async (customerID: number) => {
    const res = await fetch(`${baseUrl}/api/wishlist/clear/${customerID}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setWishlist([]);
    }
  };

  useEffect(() => {
    const customerID = 1; // Replace with actual customer ID
    fetchWishlist(customerID);

  }, []);

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