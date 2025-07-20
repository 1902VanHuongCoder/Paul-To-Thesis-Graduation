"use client";
import React from "react";
import NextImage from "next/image";
import formatVND from "@/lib/others/format-vnd";
import { Image } from "lucide-react";
import Link from "next/link";

interface Product {
  productID: number;
  productName: string;
  productPrice: number;
  productPriceSale: number;
  quantityAvailable: number;
  categoryID: number;
  originID: number;
  subcategoryID: number;
  images: string[];
  rating: number;
}

export default function NewestProduct({ products }: { products: Product[] }) {


  return (
    <section
      className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden font-sans border-1 border-gray-300 h-fit"
      aria-label={"Sản phẩm mới nhất"}
    >
      {/* Header Section */}
      <h2 className="bg-primary text-white font-bold text-lg p-4 rounded-t-lg" tabIndex={-1} id="newest-product-heading">
        {"Sản phẩm mới nhất"}
      </h2>

      {/* Product Listing Section */}
      <ul className="divide-y divide-dashed divide-gray-300" aria-labelledby="newest-product-heading">
        {products.slice(0, 5).map((product) => (
          <Link
            href={`/vi/homepage/product-details/${product.productID}`}
            key={product.productID}
            className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-100 focus:bg-primary/10 outline-none"
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết ${product.productName}`}
          >
            {/* Product Image */}
            <div className="w-16 h-16 flex-shrink-0" aria-hidden="true">
              {product.images.length === 0 ? (
                <span className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md"><Image aria-label="No image" /></span>
              ) : (
                <NextImage
                  src={product.images[0]}
                  alt={product.productName}
                  width={50}
                  height={40}
                  className="rounded-lg w-full h-full object-cover"
                  priority={true}
                />
              )}
            </div>

            {/* Product Details */}
            <div className="grow-1 max-w-full">
              {/* Title */}
              <h3 className="text-primary cursor-pointer transition-all font-bold text-sm w-[200px] truncate">
                {product.productName}
              </h3>

              {/* Price */}
              <p className="text-green-700 font-bold text-sm">
                {product.productPrice ? formatVND(product.productPrice) : "Liên hệ"} <span className="text-[12px]">{product.productPrice && 'VND'}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center mt-1" aria-label={"Đánh giá sản phẩm"}>
                {Array.from({ length: 5 }, (_, index) => (
                  index < Math.floor(product.rating) ? (
                    <span key={index} className="text-yellow-400" aria-hidden="true">
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
                  ) : (
                    <span key={index} className="text-gray-300" aria-hidden="true">
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
                  )
                ))}
              </div>
            </div>
          </Link>
        ))}
      </ul>
    </section>
  );
}