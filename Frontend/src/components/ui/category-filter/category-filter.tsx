"use client";
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
  onCategorySelect?: (category: number) => void; // Optional callback for category selection
}

export default function CategoryFilter({
  categories,
  onCategorySelect,
}: CategoryFilterProps) {

  // Memoize handler for performance
  const handleCategoryKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, categoryID: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCategorySelect?.(categoryID);
      }
    },
    [onCategorySelect]
  );

  return (
    <section
      className="w-full max-w-sm rounded-lg shadow-md overflow-hidden border-1 border-gray-300 bg-white"
      aria-label={"Danh mục"}
    >
      {/* Header Section */}
      <h2 className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg" tabIndex={-1} id="category-filter-heading">
        {"Danh mục"}
      </h2>

      {/* Category List */}
      <ul className="divide-y divide-dashed divide-gray-300" aria-labelledby="category-filter-heading">
        {categories.map((category) => (
          <li
            key={category.categoryID}
            className="flex justify-between items-center p-4 hover:bg-gray-100 cursor-pointer focus:bg-primary/10 outline-none"
            onClick={() => onCategorySelect?.(category.categoryID)}
            onKeyDown={(e) => handleCategoryKeyDown(e, category.categoryID)}
            role="button"
            tabIndex={0}
            aria-label={`Lọc theo ${category.categoryName}`}
          >
            <span className="text-black font-semibold">{category.categoryName}</span>
            <span className="text-gray-500">({category.count})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}