"use client";

import React from "react";

interface TagFilterProps {
  tags: string[];
  onTagSelect?: (tag: string) => void; // Optional callback for tag selection
}

export default function TagFilter({ tags, onTagSelect }: TagFilterProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        Thẻ
      </div>

      {/* Tags List */}
      <div className="p-4 grid grid-cols-3 gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect?.(tag)}
            className="px-4 py-2 text-sm text-green-700 border-[1px]  border-primary/50 rounded-full hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={`Filter by ${tag}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}