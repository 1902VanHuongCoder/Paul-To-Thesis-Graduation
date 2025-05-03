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
} from "@/app/components/ui/dialog/dialog";
import Button from "@/app/components/ui/button/button-brand";
import { X } from "lucide-react";

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
            <DialogTrigger className="text-sm text-green-700 underline hover:text-green-800">
                Open Wishlist
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
                <DialogFooter className="bg-gray-100 px-6 py-4 flex !justify-between">
                    <a
                        href="/wishlist"
                        className="text-green-700 underline hover:text-green-800 text-sm"
                    >
                        MỞ TRANG DANH SÁCH YÊU THÍCH
                    </a>
                    <a
                        href="/shop"
                        className="text-green-700 underline hover:text-green-800 text-sm"
                    >
                        TIẾP TỤC MUA SẮM
                    </a>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}