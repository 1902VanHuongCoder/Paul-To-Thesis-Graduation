"use client";

import React, { useState } from "react";
import IconButton from "@/components/ui/button/icon-button";
import Button from "@/components/ui/button/button-brand";
import { Heart } from "lucide-react";
import Image from "next/image";

interface Category {
    categoryID: number;
    categoryName: string;
}
interface SubCategory {
    categoryName: string;
}
interface Origin {
    originID: number;
    originName: string;
}
interface Tag {
    tagID: number;
    tagName: string;
}
interface ProductAttribute {
    attributeID: number;
    attributeName: string;
    attributeValue: string;
}
interface ProductDetailsProps {
    productName: string;
    rating: number;
    productPrice: number;
    productPriceSale?: number;
    quantityAvailable: number;
    sku: string;
    category?: Category;
    subcategory?: SubCategory;
    origin?: Origin;
    Tags?: Tag[];
    productAttributes?: ProductAttribute[];
    images?: string[];
}

export default function ProductDetails({
    productName,
    rating,
    productPrice,
    productPriceSale,
    quantityAvailable,
    sku,
    category,
    subcategory,
    origin,
    Tags,
    productAttributes,
    images = [],
}: ProductDetailsProps) {
    const [quantity, setQuantity] = useState(1);

    const handleIncrease = () => setQuantity((prev) => prev + 1);
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // Compose category/subcategory/origin string
    const categoryString = subcategory
        ? subcategory.categoryName
        : category
        ? category.categoryName
        : "Không có danh mục";
    const originString = origin ? origin.originName : "Không có nguồn gốc"; 
    return (
        <div className="p-6 bg-white space-y-8">
            {/* Product Images and Main Info */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Images */}
                <div className="flex-shrink-0">
                    {images && images.length > 0 ? (
                        <Image
                            width={256}
                            height={256}
                            src={images[0]}
                            alt={productName}
                            className="w-64 h-64 object-cover rounded shadow"
                        />
                    ) : (
                        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-gray-400">No Image</span>
                        </div>
                    )}
                    {/* Thumbnails */}
                    {images && images.length > 1 && (
                        <div className="flex gap-2 mt-2">
                            {images.slice(1, 5).map((img, idx) => (
                                <Image
                                    width={256}
                                    height={256}
                                    key={idx}
                                    src={img}
                                    alt={`${productName} ${idx + 2}`}
                                    className="w-16 h-16 object-cover rounded border"
                                />
                            ))}
                        </div>
                    )}
                </div>
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl font-bold text-gray-800">{productName}</h1>
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
                        <span className="text-gray-500 ml-2 text-sm">
                            ({rating} đánh giá)
                        </span>
                    </div>
                    <div className="mt-2">
                        {productPriceSale && productPriceSale < productPrice ? (
                            <>
                                <span className="text-gray-500 line-through mr-2">{productPrice.toLocaleString()} VND</span>
                                <span className="text-green-700 font-bold text-xl">{productPriceSale.toLocaleString()} VND</span>
                            </>
                        ) : (
                            <span className="text-green-700 font-bold text-xl">{productPrice.toLocaleString()} VND</span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <p className="text-gray-700">
                            <strong>Mã sản phẩm:</strong> {sku}
                        </p>
                        <p className="text-gray-700">
                            <strong>Danh mục:</strong> {categoryString}
                        </p>
                        <p className="text-gray-700">
                            <strong>Nguồn gốc</strong> {
                                originString
                            }
                        </p>
                        <p className="text-gray-700">
                            <strong>Thẻ:</strong> {(Tags && Tags.length > 0) ? Tags.map(tag => tag.tagName).join(" / ") : "Không có"}
                        </p>
                    </div>
                    <div className="space-y-2 mt-2">
                        <p className="text-gray-700 flex items-center gap-2">
                            � <span>Có sẵn: {quantityAvailable} trong kho</span>
                        </p>
                    </div>
                    {/* Quantity Selector and Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
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
                            <Button variant="primary" size="sm" className="flex items-center gap-2">
                                Thêm vào giỏ hàng
                            </Button>
                            <IconButton icon={Heart} iconColor="#0D401C" className="border-[1px] border-solid border-primary hover:bg-secondary" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Product Attributes and Description */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Thông tin sản phẩm</h2>
                {productAttributes && productAttributes.length > 0 && (
                    <ul className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {productAttributes.map((attr) => (
                            <li key={attr.attributeID} className="text-gray-700">
                                <strong>{attr.attributeName}:</strong> {attr.attributeValue}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}