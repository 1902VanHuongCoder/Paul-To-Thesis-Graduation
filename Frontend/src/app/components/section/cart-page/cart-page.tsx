"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/ui/button/button-brand";
import carttotalshaptop from "@public/vectors/cart+total+shap+top.png"
import carttotalshapbot from "@public/vectors/cart+total+shap+bot.png"
interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: "1",
            name: "Vimto Squash Remix",
            image: "https://img.freepik.com/free-psd/fruits-composition-isolated_23-2151856344.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
            price: 18.0,
            quantity: 1,
        },
        {
            id: "2",
            name: "Another Product",
            image: "https://img.freepik.com/free-psd/fruits-composition-isolated_23-2151856344.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
            price: 20.0,
            quantity: 2,
        },
    ]);

    const [promoCode, setPromoCode] = useState("");
    const [selectedShipping, setSelectedShipping] = useState("local");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleQuantityChange = (id: string, delta: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const handleRemoveItem = (id: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const shippingCost =
        selectedShipping === "free" ? 0 : selectedShipping === "local" ? 35 : 35;

    const total = subtotal + shippingCost;

    return (
        <div className="flex flex-col md:flex-row gap-8 p-4 md:p-6">
            {/* Left Section – Cart Items */}
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cart</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-left text-gray-600">
                            <th className="p-2 md:p-4">Product</th>
                            <th className="p-2 md:p-4">Price</th>
                            <th className="p-2 md:p-4">Quantity</th>
                            <th className="p-2 md:p-4">Subtotal</th>
                            <th className="p-2 md:p-4">Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item) => (
                            <tr key={item.id} className="border-b">
                                <td className="py-4 flex items-center gap-4">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={50}
                                        height={50}
                                        className="rounded-lg"
                                    />
                                    <span className="text-gray-800 hidden md:block">{item.name}</span>
                                </td>
                                <td className="p-4 text-gray-700 text-center">${item.price.toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td className="py-4 text-gray-700 text-center">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </td>
                                <td className="py-4 text-center">
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Discount Section */}
                <div className="mt-6 flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/10"
                    />
                    <Button variant="normal" size="sm" className="w-fit">
                        Apply Coupon
                    </Button>
                </div>
            </div>

            {/* Right Section – Order Summary */}
            <div className="relative w-full md:w-1/3 bg-gray-100 py-4 px-6">
                <Image
                    src={carttotalshaptop}
                    alt="Cart Total Top Shape"
                    width={1000}
                    height={1000}
                    className="absolute -top-2 left-0 w-full h-auto"
                />
                <Image
                    src={carttotalshapbot}
                    alt="Cart Total Bottom Shape"
                    width={1000}
                    height={1000}
                    className="absolute -bottom-2 left-0 w-full h-auto"
                />
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-4">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Discounts</span>
                        <span>-$0.00</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-700">Shipping Options</span>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="shipping"
                                value="free"
                                checked={selectedShipping === "free"}
                                onChange={() => setSelectedShipping("free")}
                            />
                            Free Shipping – $0.00
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="shipping"
                                value="local"
                                checked={selectedShipping === "local"}
                                onChange={() => setSelectedShipping("local")}
                            />
                            Local – $35.00
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="shipping"
                                value="flat"
                                checked={selectedShipping === "flat"}
                                onChange={() => setSelectedShipping("flat")}
                            />
                            Flat Rate – $35.00
                        </label>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">
                            I agree to the terms and conditions
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 flex-col">
                        <Button
                            variant="primary"
                            size="md"
                            disabled={!termsAccepted}
                            className=""
                        >
                            Thanh toán
                        </Button>
                        <a
                            href="/shop"
                            className="text-sm text-green-700 underline hover:text-green-800 block text-center mt-2"
                        >
                            Or continue shopping
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}