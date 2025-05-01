"use client";

import React from "react";

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  onCategorySelect?: (category: string) => void; // Optional callback for category selection
}

export default function CategoryFilter({
  categories,
  onCategorySelect,
}: CategoryFilterProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        Categories
      </div>

      {/* Category List */}
      <ul className="divide-y divide-dashed divide-gray-300">
        {categories.map((category) => (
          <li
            key={category.name}
            className="flex justify-between items-center p-4 hover:bg-gray-100 cursor-pointer"
            onClick={() => onCategorySelect?.(category.name)}
            role="button"
            tabIndex={0}
            aria-label={`Filter by ${category.name}`}
          >
            <span className="text-black font-semibold">{category.name}</span>
            <span className="text-gray-500">({category.count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}