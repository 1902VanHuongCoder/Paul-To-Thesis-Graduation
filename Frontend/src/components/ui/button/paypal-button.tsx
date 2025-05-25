"use client";

import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation"; 
import { useDictionary } from "@/contexts/dictonary-context";
const PayPalButton = ({amount}: {amount: number}) => {
    const {lang} = useDictionary();
    const vndToUsdRate = 0.000042; // Example conversion rate (1 VND = 0.000042 USD)
    const amountInVND = amount; // Amount in VND
    const amountInUSD = (amountInVND * vndToUsdRate).toFixed(2); // Convert to USD
    const router = useRouter();
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "your-default-client-id",
                currency: "USD", // Use USD as the currency
            }}
        >
            <PayPalButtons
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "USD", // Use USD
                                    value: amountInUSD, // Converted amount in USD
                                },
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    if (!actions.order) {
                        console.error("Order is undefined.");
                        alert("Payment failed. Please try again.");
                        return Promise.reject(new Error("Order is undefined."));
                    }
                    return actions.order.capture().then((details) => {
                        console.log("Transaction completed by " + (details.payer?.name?.given_name || "Unknown"));
                        router.push(`/${lang}/homepage/checkout/paypal-return`);
                        alert("Payment Successful!");
                    });
                }}
                onError={(err) => {
                    console.error("PayPal Checkout Error:", err);
                    alert("Payment failed. Please try again.");
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalButton;