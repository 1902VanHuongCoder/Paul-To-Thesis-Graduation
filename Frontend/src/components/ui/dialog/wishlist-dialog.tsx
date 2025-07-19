"use client";

import React from "react";
import Image from "next/image";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog/dialog";
import Button from "@/components/ui/button/button-brand";
import { X } from "lucide-react";
import formatVND from "@/lib/format-vnd";
import formatDate from "@/lib/format-date";
import { useDictionary } from "@/contexts/dictonary-context";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { DialogDescription } from "@radix-ui/react-dialog";

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

interface WishlistDialogProps {
    wishlists: WishlistItem[];
    onRemoveItemOutWishlist: (productID: number, customerID: string) => void;
    onAddToCart: (productID: number, customerID: string) => void;
    clearAll: (customerID: string) => void;
}

export default function WishlistDialog({
    wishlists,
    onRemoveItemOutWishlist,
    onAddToCart,
}: WishlistDialogProps) {
    // Router
    const router = useRouter();

    // Contexts
    const { dictionary: d, lang } = useDictionary(); // Dictionary context to get the text in different languages
    const { user } = useUser(); // User context to get the current user information
    
    // State variables
    const [open, setOpen] = React.useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            {/* Trigger Button */}
            <DialogTrigger className="relative flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-200 ease-in-out cursor-pointer">
                <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-icon lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </span>
                {wishlists.length > 0 &&
                    <span className="absolute -top-1 -left-1 w-[22px] h-[22px] bg-white rounded-full flex justify-center items-center">
                        <span className="w-[20px] h-[20px] bg-secondary rounded-full text-sm animate-pulse">{wishlists.length}</span> </span>}
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="p-0 rounded-md max-h-screen border-0 overflow-hidden font-sans bg-white min-w-2xl">
                {/* Header */}
                <div className="relative bg-primary text-white flex flex-col justify-start items-start px-6 py-6 -translate-y-1">
                    <DialogTitle>{d?.wishlistDialogTitle || "Danh sách yêu thích"} ({wishlists.length < 10 ? 
                        `0${wishlists.length}` : wishlists.length    
                })</DialogTitle>
                    <DialogDescription className="text-sm text-white hidden">
                        {d?.wishlistDialogDescription || "Bạn có thể thêm chúng vào giỏ hàng hoặc xóa khỏi danh sách này."}
                    </DialogDescription>
                    <DialogClose asChild className="text-white hover:text-white absolute top-4 right-3">
                        <X size={20} />
                    </DialogClose>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {wishlists.length > 0 ? wishlists.map((item, index) => (
                        <div
                            key={item.wishlistID}
                            className={`flex flex-col md:flex-row gap-y-5 items-start md:items-center justify-between ${wishlists.length - 1 !== index && 'border-b'} pb-4`}
                        >
                            {/* Product Thumbnail */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => onRemoveItemOutWishlist(item.productID, user?.userID || '')}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove ${item.product.productName} from wishlist`}
                                >
                                    <X width={18} height={18} />
                                </button>
                                <Image
                                    src={item.product.images[0]} // Assuming images is an array and you want the first image
                                    alt={item.product.productName}
                                    width={50}
                                    height={50}
                                    className="rounded-lg w-[50px] h-[50px] object-cover"
                                />
                                {/* Product Details */}
                                <div>
                                    <p className="text-gray-800 font-medium">{item.product.productName}</p>
                                    <p className="text-sm text-primary font-bold">{item.product.productPrice ? formatVND(item.product.productPrice) + " VND" : 'Liên hệ'}</p>
                                    <p className="text-gray-500 text-xs">{item.product.createdAt ? formatDate(item.product.createdAt) : ' '}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end">

                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => onAddToCart(item.product.productID, user?.userID || '')}
                                >
                                    {d?.wishlistDialogAddToCart || "Thêm vào giỏ hàng"}
                                </Button>
                            </div>
                        </div>
                    )) : <span> {d?.wishlishDialogEmpty || "Chưa có sản phẩm nào trong danh sách yêu thích"}</span>}
                </div>

                {/* Footer */}
                <DialogFooter className="flex !justify-between items-center px-6 py-4 w-full ">
                    <button
                        disabled={wishlists.length === 0}
                        onClick={() => {
                            router.push(`/${lang}/homepage/wishlists`);
                            setOpen(false);
                        }}
                        className="text-green-700 underline hover:text-green-800 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {d?.wishlistDialogOpenWishlistPageLink || "MỞ TRANG DANH SÁCH YÊU THÍCH"}
                    </button>
                    <DialogClose asChild>

                        <button
                            onClick={() => {
                                setOpen(false);
                                router.push(`/${lang}/homepage`);
                            }}
                            className="text-green-700 underline hover:text-green-800 text-sm cursor-pointer"
                        >
                            {d?.wishlistDialogContinueShopping || "TIẾP TỤC MUA SẮM"}
                        </button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}