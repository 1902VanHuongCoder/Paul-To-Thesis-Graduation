"use client";

import React, { useState } from "react";
import IconButton from "@/components/ui/button/icon-button";
import Button from "@/components/ui/button/button-brand";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Lens } from "@/components/ui/lens/lens";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useUser } from "@/contexts/user-context";

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
    productID: number;
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
    productID,
    productName,
    rating,
    productPrice,
    productPriceSale,
    quantityAvailable,
    sku,
    category,
    origin,
    Tags,
    images = [],
}: ProductDetailsProps) {
    const [hovering, setHovering] = useState(false);
    const [mainImage, setMainImage] = useState(images[0] || "");
    const [showContactDialog, setShowContactDialog] = useState(false);
    const { user } = useUser();
    const { addToCart } = useShoppingCart();
    const { addToWishlist } = useWishlist();

    const handleAddToCart = () => {
        // If both price and discountPrice are empty/null/undefined
        if (!productPrice && !productPriceSale) {
            setShowContactDialog(true);
            return;
        }
        addToCart(productID);
    }
    const handleAddToWishList = () => {
        if (!user) {
            return;
        }
        if (!productPrice && !productPriceSale) {
            setShowContactDialog(true);
            return;
        }
        // Check if the product is already in the wishlist
        addToWishlist(user.userID, productID);
    }

    return (
        <div className="py-6 space-y-8">
            {/* Product Images and Main Info */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Images */}
                <div className="flex-shrink-0">
                    {images && images.length > 0 ? (
                        <Lens hovering={hovering} setHovering={setHovering}>
                            <Image
                                width={300}
                                height={256}
                                src={mainImage}
                                alt={productName}
                                className="w-[400px] h-[400px] object-contain rounded shadow"
                            />
                        </Lens>

                    ) : (
                        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-gray-400">Sản phẩm không có hình ảnh</span>
                        </div>
                    )}
                    <hr className="my-4" />
                    {/* Thumbnails */}
                    {images && images.length > 1 && (
                        <div className="flex gap-2 mt-2">
                            {images.map((img, idx) => (
                                <Image
                                    width={256}
                                    height={256}
                                    key={idx}
                                    src={img}
                                    alt={`${productName} ${idx + 2}`}
                                    className="w-16 h-16 object-cover rounded border"
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <h1 className="text-4xl font-bold text-gray-800">{productName}</h1>
                    <div className="flex items-start mt-2 gap-x-2">
                        <span >Đánh giá:</span>
                        <span className="flex items-center"> {Array.from({ length: 5 }, (_, index) => (
                            <span key={index} className={index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z"
                                    />
                                </svg>
                            </span>
                        ))}</span>
                        <span className="text-gray-500 text-md">
                            ({rating}/5 sao)
                        </span>
                    </div>
                    <div className="mt-2">
                        <span>Giá sản phẩm: </span>
                        {
                            productPrice && productPriceSale ? (
                                <span>
                                    <span className="text-gray-500 line-through mr-2">{productPrice.toLocaleString()} VND</span>
                                    <span className="text-green-700 font-bold text-xl">{productPriceSale.toLocaleString()} VND</span>
                                </span>
                            ) : !productPriceSale && productPrice ? (
                                <span className="text-green-700 font-bold text-xl">{productPrice.toLocaleString()} VND</span>
                            ) : (
                                <span className="text-green-700 font-bold text-xl">Liên hệ để biết giá sản phẩm</span>
                            )
                        }
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 flex-col">
                        <p className="text-gray-700">
                            <span>Mã sản phẩm:</span> <span className="font-bold">{sku}</span>
                        </p>
                        <p className="text-gray-700">
                            <span>Danh mục: </span><span className="font-bold">{category?.categoryName}</span>
                        </p>
                        <p className="text-gray-700">
                            <span>Nguồn gốc: </span> <span className="font-bold">{origin?.originName}</span>
                        </p>
                        <div className="space-y-2">
                            <p className="text-gray-700 flex items-center gap-2">
                                <span>Có sẵn: <span className="font-bold">{quantityAvailable}</span> trong kho</span>
                            </p>
                        </div>
                        <p className="text-gray-700">
                            {(Tags && Tags.length > 0) ? Tags.map(tag => (
                                <span key={tag.tagID} className="inline-block text-gray-700 px-2 py-1 rounded-full mr-2 mb-2 border-primary border-[2px] hover:bg-secondary hover:text-primary transition-colors cursor-pointer">
                                    {tag.tagName}
                                </span>
                            )) :
                                <span>Không có thẻ nào</span>}
                        </p>
                    </div>

                    {/* Quantity Selector and Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
                        <div className="flex items-center gap-4">
                            <Button onClick={handleAddToCart} variant="primary" size="sm" className="flex items-center gap-2">
                                Thêm vào giỏ hàng
                            </Button>
                            <IconButton onClick={handleAddToWishList} icon={Heart} iconColor="#0D401C" className="border-[1px] border-solid border-primary hover:bg-secondary" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Product Attributes and Description */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Thông tin sản phẩm</h2>
            </div>
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="font-sans">
                    <DialogHeader>
                        <DialogTitle>Liên hệ để biết thêm về giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng liên hệ với chúng tôi để biết thêm thông tin về giá sản phẩm này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col gap-y-2">
                        <p>
                            Số điện thoại: <a href="tel:0334745378" className="text-blue-600 underline">0334745378</a>
                        </p>
                        <p>
                            Email: <a href="mailto:nfeamhouse@gmail.com" className="text-blue-600 underline">nfeamhouse@gmail.com</a>
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button className="mt-4 bg-gray-200 px-4 py-2 rounded">Đóng</button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </div>
    );
}