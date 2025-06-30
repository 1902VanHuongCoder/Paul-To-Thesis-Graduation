/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState } from "react";
import ImageNext from "next/image";
import Button from "@/components/ui/button/button-brand";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useUser } from "@/contexts/user-context";
import HeartButton from "../button/heart-button";
import { Image } from "lucide-react";

interface AddToCartPanelProps {
    productName: string;
    productImage: string;
    initialQuantity?: number;
    productID?: number;
}

export default function AddToCartPanel({
    productName,
    productImage,
    productID,
    initialQuantity = 1,
}: AddToCartPanelProps) {
    // Contexts 
    const { addToCart } = useShoppingCart(); // Shopping cart context to manage cart state
    const { addToWishlist } = useWishlist(); // Wishlist context to manage wishlist state
    const { user } = useUser(); // User context to get user information
    // State variables
    const [quantity, setQuantity] = useState(initialQuantity);

    // Handlers
    const handleIncrease = () => setQuantity((prev) => prev + 1); // Increase quantity by 1
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Decrease quantity by 1, but not below 1

    const handleAddToCart = () => {
        addToCart(productID || 0, quantity);
    };
    const handleAddToWishlist = () => {
        if (productID && user) {
            addToWishlist(user.userID, productID);
        } else {
            console.error("Product ID is required to add to wishlist");
        }
    }

    return (
        <div className="font-sans flex items-center justify-between p-4 gap-x-4 max-w-4xl mx-auto">
            {/* Left Section */}
            <div className="hidden md:flex items-center gap-4">
                <div className="w-[50px] h-[50px] flex-shrink-0">
                    {productImage ? (<ImageNext
                        src={productImage}
                        alt={productName}
                        width={50}
                        height={50}
                        className={`rounded-lg w-full h-full object-cover`}
                    />) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                            <Image  />
                        </div>
                    )}

                </div>

                <span className="text-gray-700 font-medium shrink-0">{productName}</span>
            </div>

            {/* Middle Section */}
            <div className="flex items-center justify-between md:justify-end w-full gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                        onClick={handleDecrease}
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>
                    <span className="px-4 py-2 text-gray-700">{quantity}</span>
                    <button
                        onClick={handleIncrease}
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart Button */}
                <Button onClick={handleAddToCart} size="sm" variant="primary" >Thêm vào giỏ hàng</Button>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-2">
                <HeartButton onClick={handleAddToWishlist} />
            </div>
        </div>
    );
}