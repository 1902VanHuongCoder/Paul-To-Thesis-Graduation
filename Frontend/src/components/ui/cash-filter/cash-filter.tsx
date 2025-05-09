"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider/slider";

interface CashFilterProps {
  minPrice?: number;
  maxPrice?: number;
  defaultMin?: number;
  defaultMax?: number;
  onFilter?: (min: number, max: number) => void; // Callback for filtering
}

export default function CashFilter({
  minPrice = 0,
  maxPrice = 1000,
  defaultMin = 10,
  defaultMax = 500,
  onFilter,
}: CashFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    defaultMin,
    defaultMax,
  ]);

  const handleFilter = () => {
    if (onFilter) {
      onFilter(priceRange[0], priceRange[1]);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        Filter by Price
      </div>

      {/* Slider Section */}
      <div className="p-4">
        <Slider
          min={minPrice}
          max={maxPrice}
          defaultValue={priceRange}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="text-green-700"
        />
      </div>

      {/* Price Display Section */}
      <div className="px-4 pb-4 text-gray-600 text-sm">
        Giá: {priceRange[0]} VND — {priceRange[1]} VND
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4 flex justify-end items-center">
              <button
                  onClick={handleFilter}
                  className="relative group capitalize px-2 hover:text-primary transition-all cursor-pointer"
              >
                  <span>Lọc</span>
                  <span className="absolute right-0 -bottom-1 group-hover:w-0 origin-left transition-all duration-300 w-full h-[2px] bg-secondary"></span>
              </button>
      </div>
    </div>
  );
}