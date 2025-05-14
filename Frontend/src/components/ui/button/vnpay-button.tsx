"use client";
import React from "react";

const VNPayButton = ({
    orderId,
    amount,
    orderInfo,
    bankCode,
    locale,
}: {
    orderId: string;
    amount: number;
    orderInfo: string;
    bankCode: string;
    locale: string;
}) => {
    const handlePayment = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, amount, orderInfo, bankCode, locale }),
            });

            if (response.redirected) {
                // Redirect to VNPay payment URL
                window.location.href = response.url;
            } else {
                const data = await response.json();
                alert(data.message || "Failed to create payment");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <button onClick={handlePayment} className="bg-primary text-white px-4 py-2 rounded">
            Pay with VNPay
        </button>
    );
};

export default VNPayButton;