"use client";

import React from "react";
import Button from "../../ui/button/button-brand";


export default function ErrorPage() {
  const handleGoToHomepage = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      {/* Main Heading */}
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-secondary">
        Oops!
      </h1>

      {/* Error Message Section */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase">404 - Không tìm thấy trang</h2>
        <p className="mt-2 text-gray-600">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đã thay đổi tên, hoặc tạm thời không khả dụng.
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          className="rounded-full shadow-md"
          onClick={handleGoToHomepage}
          aria-label="Go to homepage"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}