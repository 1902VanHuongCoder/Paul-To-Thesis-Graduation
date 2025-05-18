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
import Link from "next/link";

interface WishlistItem {
    id: string;
    name: string;
    price: string;
    date: string;
    image: string;
}

interface WishlistDialogProps {
    items: WishlistItem[];
    onRemoveItem: (id: string) => void;
    onAddToCart: (id: string) => void;
}

export default function WishlistDialog({
    items,
    onRemoveItem,
    onAddToCart,
}: WishlistDialogProps) {
    return (
        <Dialog>
            {/* Trigger Button */}
            <DialogTrigger className="flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-200 ease-in-out cursor-pointer">
                <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-icon lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </span>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="p-0 rounded-none">
                {/* Header */}
                <div className="bg-primary text-white flex justify-between items-center px-6 py-4">
                    <DialogTitle>Danh sách yêu thích ({items.length})</DialogTitle>
                    <DialogClose asChild className="text-white hover:text-white">
                        <X size={20} />
                    </DialogClose>

                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col md:flex-row gap-y-5 items-start md:items-center justify-between border-b pb-4"
                        >
                            {/* Product Thumbnail */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove ${item.name} from wishlist`}
                                >
                                    <X width={18} height={18} />
                                </button>
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                    className="rounded-lg"
                                />
                                {/* Product Details */}
                                <div>
                                    <p className="text-gray-800 font-medium">{item.name}</p>
                                    <p className="text-gray-600 text-sm">{item.price}</p>
                                    <p className="text-gray-500 text-xs">{item.date}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end">

                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => onAddToCart(item.id)}
                                >
                                    Add To Cart
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <DialogFooter className="flex !justify-between items-center px-6 py-4 w-full ">
                    <Link
                        href="/wishlist"
                        className="text-green-700 underline hover:text-green-800 text-sm"
                    >
                        MỞ TRANG DANH SÁCH YÊU THÍCH
                    </Link>
                    <Link
                        href="/shop"
                        className="text-green-700 underline hover:text-green-800 text-sm"
                    >
                        TIẾP TỤC MUA SẮM
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}