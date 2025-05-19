"use client";

import React, { useState } from "react";
import { Grid, List } from "lucide-react";
import { useDictionary } from "@/contexts/dictonary-context";

interface DisplayModeSwitcherProps {
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  onViewChange?: (view: "grid" | "list") => void; // Callback for view change
}

export default function DisplayModeSwitcher({
  totalResults,
  currentPage,
  resultsPerPage,
  onViewChange,
}: DisplayModeSwitcherProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { dictionary } = useDictionary();
  const handleViewChange = (view: "grid" | "list") => {
    setViewMode(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex items-center justify-between bg-white gap-x-4">
      {/* View Toggle Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleViewChange("grid")}
          className={`p-3 rounded-full ${viewMode === "grid" ? "bg-primary text-secondary" : "bg-gray-200 text-gray-500"
            } hover:bg-primary hover:text-secondary focus:outline-none`}
          aria-label="Switch to grid view"
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => handleViewChange("list")}
          className={`p-3 rounded-full ${viewMode === "list" ? "bg-primary text-secondary" : "bg-gray-200 text-gray-500"
            } hover:bg-primary hover:text-secondary focus:outline-none`}
          aria-label="Switch to list view"
        >
          <List size={20} />
        </button>
      </div>

      {/* Pagination Summary */}
      <div className="text-sm text-gray-600">
        {dictionary?.displayModeSwitcherSShow || "Hiển thị"} {startResult}–{endResult} {dictionary?.displayModeSwitcherSOf || "của"} {totalResults} {dictionary?.displayModeSwitcherSResults || "kết quả"}
      </div>
    </div>
  );
}