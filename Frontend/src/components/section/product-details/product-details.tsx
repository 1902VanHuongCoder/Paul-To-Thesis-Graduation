"use client";

import React, { useState } from "react";
import IconButton from "@/components/ui/button/icon-button";
import Button from "@/components/ui/button/button-brand";
import { Heart } from "lucide-react";

interface ProductDetailsProps {
    name: string;
    rating: number;
    reviews: number;
    originalPrice: string;
    discountedPrice: string;
    description: string;
    stock: number;
    viewers: number;
    recentSales: number;
    sku: string;
    category: string;
    tags: string[];
}

export default function ProductDetails({
    name,
    rating,
    reviews,
    originalPrice,
    discountedPrice,
    description,
    stock,
    viewers,
    recentSales,
    sku,
    category,
    tags,
}: ProductDetailsProps) {
    const [quantity, setQuantity] = useState(1);

    const handleIncrease = () => setQuantity((prev) => prev + 1);
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="p-6 bg-white space-y-6">
            {/* Product Information */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                <div className="flex items-center mt-2">
                    {Array.from({ length: 5 }, (_, index) => (
                        <span key={index} className={index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z"
                                />
                            </svg>
                        </span>
                    ))}
                    <span className="text-gray-500 ml-2 text-sm">({reviews} khách hàng đã nhận xét{reviews > 1 ? "s" : ""})</span>
                </div>
                <div className="mt-2">
                    <span className="text-gray-500 line-through mr-2">{originalPrice} VND</span>
                    <span className="text-green-700 font-bold text-lg">{discountedPrice} VND</span>
                </div>
                <p className="text-gray-600 mt-4">{description}</p>
            </div>

            {/* Product Stats */}
            <div className="space-y-2">
                <p className="text-gray-700 flex items-center gap-2">
                    📦 <span>Có sẵn: {stock} trong kho</span>
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                    👀 <span>{viewers} lượt xem sản phẩm</span>
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                    🔥 <span>{recentSales} đã được bán gần đây</span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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

                <div className="flex items-center gap-4">
                    {/* Add to Cart Button */}
                    <Button variant="primary" size="sm" className="flex items-center gap-2">
                        Thêm vào giỏ hàng
                    </Button>

                    {/* Wishlist and Compare Buttons */}
                    <IconButton icon={Heart} iconColor="#0D401C" className="border-[1px] border-solid border-primary hover:bg-secondary" />
             </div>

            </div>

            {/* Additional Details */}
            <div className="space-y-2">
                <p className="text-gray-700">
                    <strong>Mã sản phẩm:</strong> {sku}
                </p>
                <p className="text-gray-700">
                    <strong>Danh mục:</strong> {category}
                </p>
                <p className="text-gray-700">
                    <strong>Thẻ:</strong> {tags.join(" / ")}
                </p>
            </div>
        </div>
    );
}