"use client";

import React, { useState } from "react";
import { Input } from "@/app/components/ui/input/input";
import Button from "@/app/components/ui/button/button-brand";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  const handleTrackOrder = () => {
    if (orderId.trim() && billingEmail.trim()) {
      console.log(`Tracking order with ID: ${orderId} and Email: ${billingEmail}`);
      // Add logic to query backend for order tracking details
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto space-y-6">
      {/* Instructional Text */}
      <div>
        <p className="text-gray-700">
          To track your order please enter your Order ID in the box below and press the
          <strong> Track </strong> button. This was given to you on your receipt and in the confirmation email you should have received.
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {/* Order ID Input */}
        <div>
          <Input
            type="text"
            placeholder="Found in your order confirmation email."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 bg-gray-100 focus:bg-white"
            aria-label="Order ID input"
          />
        </div>

        {/* Billing Email Input */}
        <div>
          <Input
            type="email"
            placeholder="Email you used during checkout."
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 bg-gray-100 focus:bg-white"
            aria-label="Billing email input"
          />
        </div>
      </div>

      {/* Track Button */}
      <div>
        <Button
          variant="normal"
          size="lg"
          className="w-full flex justify-center items-center bg-primary text-white hover:bg-secondary hover:border-secondary"   
          onClick={handleTrackOrder}
          aria-label="Track order button"
        >
          Track
        </Button>
      </div>
    </div>
  );
}