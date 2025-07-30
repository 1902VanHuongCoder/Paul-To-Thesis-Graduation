"use client";

import React from "react";

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void; // Callback for page change
}

export default function CustomPagination({
  totalPages,
  currentPage,
  onPageChange,
}: CustomPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => {
              onPageChange(page);
              window.scrollTo({ top: 500, behavior: "smooth" });
            }}
      className={`font-sans w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isActive
        ? "bg-primary text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-primary-hover`}
      aria-current={isActive ? "page" : undefined}
      aria-label={`Go to page ${page}`}
          >
      {page}
    </button>
  );
})}
    </div >
  );
}