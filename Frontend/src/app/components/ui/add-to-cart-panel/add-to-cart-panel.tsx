"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/ui/button/button-brand";
import { Heart } from "lucide-react";
import IconButton from "../button/icon-button";

interface AddToCartPanelProps {
    productName: string;
    productImage: string;
    initialQuantity?: number;
    onAddToCart?: (quantity: number) => void;       
    onAddToWishlist?: () => void;
    onRefresh?: () => void;
}

export default function AddToCartPanel({
    productName,
    productImage,
    initialQuantity = 1,
    onAddToCart,
    onAddToWishlist,
}: AddToCartPanelProps) {
    const [quantity, setQuantity] = useState(initialQuantity);

    const handleIncrease = () => setQuantity((prev) => prev + 1);
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(quantity);
        }
    };

    return (
        <div className="font-sans flex items-center justify-between p-4 bg-white rounded-lg shadow-md gap-x-4">
            {/* Left Section */}
            <div className="hidden md:flex items-center gap-4">
                <Image
                    src={productImage}
                    alt={productName}
                    width={50}
                    height={50}
                    className="rounded-lg"
                />
                <span className="text-gray-700 font-medium">{productName}</span>
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
                <IconButton onClick={onAddToWishlist} icon={Heart} iconColor="#0D401C" className="border-[1px] border-solid border-primary hover:bg-secondary" />
            </div>
        </div>
    );
}