"use client";

import React, { useState } from "react";
import Button from "@/app/components/ui/button/button-brand";
import carttotalshaptop from "@public/vectors/cart+total+shap+top.png"
import carttotalshapbot from "@public/vectors/cart+total+shap+bot.png"
import Image from "next/image";
export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState("bank-transfer");

    const handlePlaceOrder = () => {
        console.log("Order placed!");
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-lg shadow-md">
            {/* Left Column – Billing Details Form */}
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Billing Details</h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="First Name *"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name *"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Company Name (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                    />
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        required
                    >
                        <option value="">Select Country *</option>
                        <option value="us">United States</option>
                        <option value="ca">Canada</option>
                        <option value="uk">United Kingdom</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Street Address *"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        required
                    />
                    <input
                        type="text"
                        placeholder="City / Town *"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                            required
                        >
                            <option value="">Select State *</option>
                            <option value="ca">California</option>
                            <option value="ny">New York</option>
                            <option value="tx">Texas</option>
                        </select>
                        <input
                            type="text"
                            placeholder="ZIP Code *"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                            required
                        />
                    </div>
                    <input
                        type="tel"
                        placeholder="Phone Number *"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address *"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        required
                    />
                    <textarea
                        placeholder="Order Note (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/10"
                        rows={4}
                    />
                </form>
            </div>

            {/* Right Column – Order Summary and Payment */}
            <div className="relative w-full md:w-1/3 bg-gray-100 py-6 px-6">
                <Image src={carttotalshaptop} alt="Cart Top Shape" className="absolute -top-2 left-0 w-full h-auto" />
                <Image src={carttotalshapbot} alt="Cart Bottom Shape" className="absolute -bottom-2 left-0 w-full h-auto" />
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-[1px] border-solid border-black/10 pb-4">Order Summary</h2>
                <div className="space-y-4">
                    {/* Product List */}
                    <div className="space-y-2 border-b-[1px] border-solid border-black/10 pb-4">
                        <div className="flex justify-between text-gray-700">
                            <span>3 × Vimto Squash Remix</span>
                            <span>$54.00</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>3 × Extreme Budweiser</span>
                            <span>$60.00</span>
                        </div>
                    </div>

                    {/* Subtotal and Total */}
                    <div className="flex justify-between text-gray-700 border-b-[1px] border-solid border-black/10 pb-4">
                        <span>Subtotal</span>
                        <span>$114.00</span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold border-b-[1px] border-solid border-black/10 pb-4">
                        <span>Total</span>
                        <span>$114.00</span>
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-col gap-4 mt-4">
                        <span className="text-gray-700">Payment Methods</span>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="bank-transfer"
                                    checked={paymentMethod === "bank-transfer"}
                                    onChange={() => setPaymentMethod("bank-transfer")}
                                />
                                Direct Bank Transfer
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="check"
                                    checked={paymentMethod === "check"}
                                    onChange={() => setPaymentMethod("check")}
                                />
                                Check Payments
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                />
                                Cash on Delivery
                            </label>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="primary"
                            size="md"
                            className="mt-4"
                            onClick={handlePlaceOrder}
                        >
                            Place Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}