"use client";
import React from "react";

type CheckoutFormValues = {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    note?: string;
};

type VNPayButtonProps = {

    handlePayment: (data: CheckoutFormValues) => void;
};

const VNPayButton = ({ handlePayment }: VNPayButtonProps) => {
    // You need to provide the CheckoutFormValues data here
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // Replace the following with actual data from your form/context
        const dummyData: CheckoutFormValues = {
            fullName: "",
            phone: "",
            province: "",
            district: "",
            ward: "",
            detailAddress: "",
            note: "",
        };
        handlePayment(dummyData);
    };

    return (
        <button onClick={handleClick} className="bg-primary text-white px-4 py-2 rounded">
            Pay with VNPay
        </button>
    );
};

export default VNPayButton;