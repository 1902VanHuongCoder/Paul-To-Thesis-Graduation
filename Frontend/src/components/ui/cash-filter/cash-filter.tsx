"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider/slider";
import formatVND from "@/lib/format-vnd";
import { useDictionary } from "@/contexts/dictonary-context";

interface CashFilterProps {
  minPrice?: number;
  maxPrice?: number;
  defaultMin?: number;
  defaultMax?: number;
  onFilter?: (min: number, max: number) => void; // Callback for filtering
}

export default function CashFilter({
  minPrice = 0,
  maxPrice = 10000000,
  defaultMin = 100000,
  defaultMax = 500000,
  onFilter,
}: CashFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    defaultMin,
    defaultMax,
  ]);

  const { dictionary } = useDictionary();

  const handleFilter = () => {
    if (onFilter) {
      onFilter(priceRange[0], priceRange[1]);
    }
  };


  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden border-1 border-gray-300 ">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        { dictionary?.cashFilter || "Lọc theo giá" }
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
        {dictionary?.price || "Giá"}: {formatVND(priceRange[0])} VND — {formatVND(priceRange[1])} VND
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4 flex justify-end items-center">
              <button
                  onClick={handleFilter}
                  className="relative group capitalize px-2 hover:text-primary transition-all cursor-pointer"
              >
                  <span>{dictionary?.filterButton || "Lọc"}</span>
                  <span className="absolute right-0 -bottom-1 group-hover:w-0 origin-left transition-all duration-300 w-full h-[2px] bg-secondary"></span>
              </button>
      </div>
    </div>
  );
}