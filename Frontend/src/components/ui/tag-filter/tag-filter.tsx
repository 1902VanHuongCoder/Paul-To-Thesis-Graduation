"use client";

import { useDictionary } from "@/contexts/dictonary-context";
import React from "react";

interface Tag {
  tagID: number;
  tagName: string;
}

interface TagFilterProps {
  tags: Tag[];
  onTagSelect?: (tag: string) => void; // Optional callback for tag selection
}

export default function TagFilter({ tags, onTagSelect }: TagFilterProps) {
  const { dictionary } = useDictionary();
  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden border-1 border-gray-300 ">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        {dictionary?.tagFilter || "Thẻ"}
      </div>

      {/* Tags List */}
      <div className="p-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          index < 10 && (
            <button
              key={tag.tagID}
              onClick={() => onTagSelect?.(tag.tagName)}
              className="px-4 py-2 text-sm text-green-700 border-[1px]  border-primary/50 rounded-full hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label={`Filter by ${tag}`}
            >
              {tag.tagName}
            </button>
          )

        ))}
      </div>
    </div>
  );
}