"use client";

import { useDictionary } from "@/contexts/dictonary-context";
import React from "react";

interface Category {
  categoryDescription: string,
  categoryID: number,
  categoryName: string,
  categorySlug: string,
  count: number,
  createdAt: string,
  updatedAt: string,
}

interface CategoryFilterProps {
  categories: Category[];
  onCategorySelect?: (category: string) => void; // Optional callback for category selection
}

export default function CategoryFilter({
  categories,
  onCategorySelect,
}: CategoryFilterProps) {
  const { dictionary } = useDictionary();
  return (
    <div className="w-full max-w-sm rounded-lg shadow-md overflow-hidden border-1 border-gray-300 bg-white">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        {dictionary?.categoryFilter ? dictionary.categoryFilter : "Danh mục"}
      </div>

      {/* Category List */}
      <ul className="divide-y divide-dashed divide-gray-300">
        {categories.map((category) => (
          <li
            key={category.categoryID}
            className="flex justify-between items-center p-4 hover:bg-gray-100 cursor-pointer"
            onClick={() => onCategorySelect?.(category.categoryName)}
            role="button"
            tabIndex={0}
            aria-label={`Filter by ${category.categoryName}`}
          >
            <span className="text-black font-semibold">{category.categoryName}</span>
            <span className="text-gray-500">({category.count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}