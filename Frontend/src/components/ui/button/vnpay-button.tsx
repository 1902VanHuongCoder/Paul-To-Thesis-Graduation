"use client";
import React from "react";

const VNPayButton = ({
    orderId,
    amount,
    orderDescription,
    bankCode,
    language,
}: {
    orderId: string;
    amount: number;
        orderDescription: string;
    bankCode: string;
    language: string;
}) => {
      const handlePayment = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, amount, orderDescription, bankCode, language, orderType: "other" }),
            });
    
            const data = await response.json();
            if (data.url) {
                // Redirect to VNPay payment URL
                window.location.href = data.url;
            } else {
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