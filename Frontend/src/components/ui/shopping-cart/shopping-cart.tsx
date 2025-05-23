"use client";

import React from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader, DrawerFooter, DrawerTitle } from "@/components/ui/drawer/drawer";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import formatVND from "@/lib/format-vnd";
import { useDictionary } from "@/contexts/dictonary-context";

export interface CartItem {
    quantity: number;
    price: number;
    discount: number;
}
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
    CartItem: CartItem;
}

export interface Cart {
    cartID: number;
    totalQuantity: number;
    products: Product[];
}

export default function ShoppingCart() {
    const { cart, updateCart, setCart, removeFromCart } = useShoppingCart();
    const { dictionary:d} = useDictionary(); 

    const handleChangeProductQuantity = (productID: number, quantity: number) => {
        // Find the current product
        const product = cart.products.find(p => p.productID === productID);
        if (!product) {
            alert("Sản phẩm không tồn tại trong giỏ hàng");
            return;
        };
        // Prevent quantity less than 1
        if (quantity < 1) {
            alert("Số lượng sản phẩm không thể nhỏ hơn 1");
            return;
        };
        const updatedProducts = cart.products.map(p => {
            if (p.productID === productID) {
                return {
                    ...p,
                    CartItem: {
                        ...p.CartItem,
                        quantity: quantity
                    }
                };
            }
            return p;
        });
        setCart({
            ...cart,
            products: updatedProducts
        });
        updateCart(cart.cartID, productID, quantity);
    };

    const totalPayment = cart.products.reduce((sum, item) => {
        // Use sale price if available, otherwise use regular price
        const price = item.productPriceSale ? item.productPriceSale : item.productPrice;
        const quantity = item.CartItem?.quantity || 0;
        const discount = item.CartItem?.discount || 0;
        // Apply discount if present (assuming discount is a number like 10 for 10%)
        const discountedPrice = price * (1 - discount / 100);
        return sum + discountedPrice * quantity;
    }, 0);

    const handleRemoveItem = (productID: number) => {
        const updatedProducts = cart.products.filter(p => p.productID !== productID);
        setCart({
            ...cart,
            products: updatedProducts
        });
        removeFromCart(productID, cart.cartID);
        alert("Xóa sản phẩm thành công");
    }


    return (
        <Drawer direction="right">
            {/* Trigger */}
            <DrawerTrigger className="relative flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-200 ease-in-out cursor-pointer">
                <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/20"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 19a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 8.5 19ZM19 16H7a1 1 0 0 1 0-2h8.491a3.013 3.013 0 0 0 2.885-2.176l1.585-5.55A1 1 0 0 0 19 5H6.74a3.007 3.007 0 0 0-2.82-2H3a1 1 0 0 0 0 2h.921a1.005 1.005 0 0 1 .962.725l.155.545v.005l1.641 5.742A3 3 0 0 0 7 18h12a1 1 0 0 0 0-2Zm-1.326-9l-1.22 4.274a1.005 1.005 0 0 1-.963.726H8.754l-.255-.892L7.326 7ZM16.5 19a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5Z" /></svg></span>
                {cart.products.length > 0 &&
                    <span className="absolute -top-1 -left-1 w-[22px] h-[22px] bg-white rounded-full flex justify-center items-center">
                        <span className="w-[20px] h-[20px] bg-secondary rounded-full text-sm animate-pulse">{cart.products.length}</span>
                    </span>
                }
            </DrawerTrigger>

            {/* Content */}
            <DrawerContent className="!w-[100%] bg-white text-black font-sans">
                {/* Header */}
                <DrawerHeader className="flex items-center w-full flex-row justify-between border-b pb-4">
                    <DrawerTitle className="text-lg font-bold">{d?.shoppingCartTitle ? d.shoppingCartTitle : "Giỏ hàng"} ({cart.products?.length ? cart.products?.length : 0})</DrawerTitle>
                    <DrawerClose className="text-gray-500 hover:text-black">
                        <X size={20} />
                    </DrawerClose>
                </DrawerHeader>

                {/* Cart Items */}
                <div className="p-4 space-y-4 h-fit overflow-y-auto">
                    {cart.products.length > 0 ? cart.products.map((item) => (
                        <div key={item.productID} className="flex items-center gap-4 border-b pb-4">
                            {/* Product Image */}
                            <Image
                                src={item.images[0]} // Assuming images is an array and you want the first image
                                alt={item.productName}
                                width={60}
                                height={60}
                                className="rounded-md"
                            />

                            {/* Product Details */}
                            <div className="flex-1">
                                <h4 className="font-semibold">{item.productName}</h4>
                                <p className={`text-sm  font-semibold ${item.productPriceSale ? 'line-through text-gray-500' : 'text-primary-hover'} `}>{item.productPrice ? formatVND(item.productPrice) + " VND" : "Liên hệ"}</p>
                                <p className="text-sm text-primary-hover">{item.productPriceSale ? formatVND(item.productPriceSale) + " VND" : ""}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity - 1)}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-6 text-center">{item?.CartItem?.quantity ? item.CartItem?.quantity : 0}</span>
                                <button
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity + 1)}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Remove Icon */}
                            <button onClick={() => handleRemoveItem(item.productID)} className="text-gray-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>
                    )) : <span>{d?.shoppingCartEmpty || "Bạn chưa thêm sản phẩm nào vào giỏ hàng."}</span>}
                </div>

                {/* Footer */}
                <DrawerFooter className="border-t pt-4">

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">{d?.shoppingCartTotal ? d.shoppingCartTotal : "Tổng cộng"}</span>
                        <span className="text-lg font-semibold">{formatVND(totalPayment)} VND</span>
                    </div>


                    <div className="flex flex-col gap-2">
                        <button className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                            {d?.shoppingCartCheckout ? d.shoppingCartCheckout : "Thanh toán"}
                        </button>
                        <button className="w-full py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
                            {d?.shoppingCartDetailsButton ? d.shoppingCartDetailsButton : "Tiếp tục mua sắm"}
                        </button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}