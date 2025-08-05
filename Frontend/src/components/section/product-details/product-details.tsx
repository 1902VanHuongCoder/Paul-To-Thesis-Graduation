"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/button-brand";
import { Binary, Building2, Layers, ListTodo, Tag } from "lucide-react";
import Image from "next/image";
import { Lens } from "@/components/ui/lens/lens";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useUser } from "@/contexts/user-context";
import { HeartButton } from "@/components";
import NoImage from "@public/images/NoImage.jpg";
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
    // Contexts 
    const { user } = useUser(); // Get user information from user context
    const { addToCart } = useShoppingCart(); // Get addToCart function from shopping cart context to add products to the cart
    const { addToWishlist } = useWishlist(); // Get addToWishlist function from wishlist context to add products to the wishlist

    // State variables
    const [hovering, setHovering] = useState(false); // State to track if the image is being hovered
    const [mainImage, setMainImage] = useState(images[0] || ""); // State to track the main image being displayed
    const [showContactDialog, setShowContactDialog] = useState(false); // State to control the visibility of the contact dialog
    const [quantity, setQuantity] = useState(1);

    // Handlers
    const handleIncrease = () => setQuantity((prev) => prev + 1); // Increase quantity by 1
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Decrease quantity by 1, but not below 1


    const handleAddToCart = () => {
        // If both price and discountPrice are empty/null/undefined, we will show a contact dialog
        if (!productPrice && !productPriceSale) {
            setShowContactDialog(true);
            return;
        }

        // Otherwise, we will add the product to the cart
        addToCart(productID, quantity);
    }
    const handleAddToWishList = () => {
        // If the user is not logged in, we will not allow them to add products to the wishlist
        if (!user) {
            return;
        }

        // If both price and discountPrice are empty/null/undefined, we will show a contact dialog
        if (!productPrice && !productPriceSale) {
            setShowContactDialog(true);
            return;
        }
        // Otherwise, we will add the product to the wishlist
        addToWishlist(user.userID, productID);
    }

    return (
        <div className="py-6 space-y-8">
            {/* Product Images and Main Info */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Images */}
                <div className="flex-shrink-0 border-1 border-primary/10 p-4">
                    <Lens hovering={hovering} setHovering={setHovering}>
                        <Image
                            width={300}
                            height={256}
                            src={mainImage ? mainImage : NoImage}
                            alt={productName}
                            className="w-[400px] h-[400px] object-contain rounded shadow"
                            priority
                        />
                    </Lens>
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
                    <h1 className="text-4xl font-bold text-primary">{productName}</h1>
                    <div className="mt-2 flex items-center gap-2">
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
                        <span className="text-gray-500 text-md translate-y-0.5">
                            ({rating}/5 sao)
                        </span>
                    </div>
                    <div className="mt-2">
                        {
                            productPrice && productPriceSale ? (
                                <span className="space-x-2">
                                    <span className="text-green-500 font-bold text-xl">{productPriceSale.toLocaleString()} VND</span>
                                    <span className="text-gray-500 line-through mr-2 opacity-60">{productPrice.toLocaleString()} VND</span>
                                </span>
                            ) : !productPriceSale && productPrice ? (
                                <span className="text-green-700 font-bold text-xl">{productPrice.toLocaleString()} VND</span>
                            ) : (
                                <span className="text-green-700 font-bold text-xl">Liên hệ để biết giá sản phẩm</span>
                            )
                        }
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 flex-col">
                        <p>Thông tin sản phẩm: </p>
                        <p className="text-gray-700 flex items-center gap-x-1">
                            <span><Binary className="h-[20px] text-yellow-500" /></span><span>Mã sản phẩm</span> <span className="">{sku}</span>
                        </p>
                        <p className="text-gray-700 flex items-center gap-x-1">
                            <span><ListTodo className="h-[20px] text-yellow-500" /></span><span>Danh mục</span><span className="">{category?.categoryName}</span>
                        </p>
                        <p className="text-gray-700 flex items-center gap-x-1">
                            <span><Building2 className="h-[20px] text-yellow-500" /></span><span>Nguồn gốc </span> <span className="">{origin?.originName}</span>
                        </p>
                        <div className="space-y-2">
                            <p className="text-gray-700 gap-2 flex items-center gap-x-1">
                                <span><Layers className="h-[20px] text-yellow-500" /></span><span>Có sẵn <span className="">{quantityAvailable}</span> trong kho</span>
                            </p>
                        </div>
                        <p className="text-gray-700 flex items-center gap-x-1">
                            {(Tags && Tags.length > 0) ? Tags.map(tag => (
                                <span key={tag.tagID} className="flex items-center gap-x-1 border-1 border-primary/20 px-2 py-1 pr-3 rounded-full">
                                    <span><Tag className="h-[15px]" /></span><span>{tag.tagName}</span>
                                </span>
                            )) :
                                <span>Không có thẻ liên quan đến sản phẩm</span>}
                        </p>
                    </div>

                    {/* Quantity Selector and Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
                        <div className="flex items-center gap-4">
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
                            <Button
                                disabled={quantityAvailable <= 0}
                                onClick={handleAddToCart} variant="primary" size="sm" className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                Thêm vào giỏ hàng
                            </Button>
                            {/* <button onClick={handleAddToWishList} className="p-3 rounded-full border-1 border-primary/60 hover:bg-secondary hover:text-white hover:cursor-pointer"><Heart className="text-[#0D401C]" stroke="#0D401C"/></button> */}
                            <div 
                                className={`${quantityAvailable <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <HeartButton onClick={handleAddToWishList} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Product Attributes and Description
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Thông tin sản phẩm</h2>
            </div> */}
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