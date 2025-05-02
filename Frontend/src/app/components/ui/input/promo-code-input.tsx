"use client";

import React, { useState } from "react";
import { Input } from "@/app/components/ui/input/input";
import { Button } from "../button/button";

interface PromoCodeInputProps {
  onApply: (code: string) => void;
}

export default function PromoCodeInput({ onApply }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("");

  const handleApply = () => {
    if (promoCode.trim()) {
      onApply(promoCode.trim());
    }
  };

  return (
    <div className="relative flex items-center gap-4 w-full">
      {/* Promo Code Input */}
      <Input
        type="text"
        placeholder="Enter promo code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        className="flex-1 px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 bg-gray-100 focus:bg-white"
        aria-label="Promo code input"
      />

      {/* Apply Button */}
      <Button
        variant="ghost"
        onClick={handleApply}
        className="absolute right-0 top-0 h-full rounded-full px-4 hover:bg-transparent hover:text-secondary cursor-pointer"
        aria-label="Apply promo code"
      >
        Apply
      </Button>
    </div>
  );
}