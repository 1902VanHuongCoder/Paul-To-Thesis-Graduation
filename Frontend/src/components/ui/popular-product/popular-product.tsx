"use client";

import React from "react";
import Image from "next/image";

interface Product {
  id: string;
  image: string;
  title: string;
  price: string;
  rating: number; // Rating out of 5
}

interface PopularProductProps {
  products: Product[];
}

export default function PopularProduct({ products }: PopularProductProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden font-sans border-1 border-gray-300 h-fit">
      {/* Header Section */}
      <div className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg">
        Sản phẩm phổ biến
      </div>

      {/* Product Listing Section */}
      <ul className="divide-y divide-dashed divide-gray-300">
        {products.map((product) => (
          <li key={product.id} className="flex items-center p-4 gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.title}
                width={50}
                height={40}
                className="rounded-lg object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1">
              {/* Title */}
                    <h3 className="text-primary hover:text-primary-hover cursor-pointer transition-all font-bold text-sm truncate">
                {product.title}
              </h3>

              {/* Price */}
              <p className="text-green-700 font-bold text-sm">{product.price}</p>

              {/* Rating */}
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }, (_, index) => {
                  if (index < Math.floor(product.rating)) {
                    // Full star
                    return (
                      <span key={index} className="text-yellow-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z"
                          />
                        </svg>
                      </span>
                    );
                  } else {
                    // Empty star
                    return (
                      <span key={index} className="text-gray-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z"
                          />
                        </svg>
                      </span>
                    );
                  }
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}