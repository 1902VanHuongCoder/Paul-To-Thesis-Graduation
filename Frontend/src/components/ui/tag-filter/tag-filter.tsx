"use client";

import React from "react";

interface Tag {
  tagID: number;
  tagName: string;
}

interface TagFilterProps {
  tags: Tag[];
  onTagSelect?: (tagID: number) => void; // Optional callback for tag selection
}

export default function TagFilter({ tags, onTagSelect }: TagFilterProps) {
  const [selectedTag, setSelectedTag] = React.useState<number[]>([]);

  // Memoize handler for performance
  const handleTagSelect = React.useCallback((tagID: number) => {
    setSelectedTag((prev) =>
      prev.includes(tagID) ? prev.filter((id) => id !== tagID) : [...prev, tagID]
    );
    onTagSelect?.(tagID);
  }, [onTagSelect]);

  return (
    <section
      className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden border-1 border-gray-300"
      aria-label={"Thẻ"}
    >
      {/* Header Section */}
      <h2 className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg" tabIndex={-1} id="tag-filter-heading">
        {"Thẻ"}
      </h2>

      {/* Tags List */}
      <div className="p-4 flex flex-wrap gap-2" aria-labelledby="tag-filter-heading">
        {tags.slice(0, 10).map((tag) => (
          <button
            key={tag.tagID}
            onClick={() => handleTagSelect(tag.tagID)}
            className={`px-4 py-2 text-sm text-green-700 border-[1px] border-primary/50 rounded-full hover:bg-primary hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${selectedTag.includes(tag.tagID) ? "bg-primary text-white" : "bg-white text-primary"}`}
            aria-pressed={selectedTag.includes(tag.tagID)}
            aria-label={`Lọc theo thẻ ${tag.tagName}`}
            tabIndex={0}
          >
            {tag.tagName}
          </button>
        ))}
      </div>
    </section>
  );
}