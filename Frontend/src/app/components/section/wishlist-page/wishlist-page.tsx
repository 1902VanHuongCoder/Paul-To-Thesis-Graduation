"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/ui/button/button-brand";
import { X } from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  dateAdded: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Vimto Squash Remix",
          image: "https://img.freepik.com/free-vector/watermelon-party-serving-triangle-wedge-piece-realistic-composition-with-juice-splash-fresh-basil-leaves-vector-illustration_1284-30332.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
      price: 18.0,
      dateAdded: "24 February 2025",
    },
    {
      id: "2",
      name: "Another Product",
        image: "https://img.freepik.com/free-vector/watermelon-party-serving-triangle-wedge-piece-realistic-composition-with-juice-splash-fresh-basil-leaves-vector-illustration_1284-30332.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
      price: 20.0,
      dateAdded: "20 February 2025",
    },
  ]);

  const handleRemoveItem = (id: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleAddToCart = (id: string) => {
    console.log(`Added item with id ${id} to cart`);
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Wishlist</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2">Remove</th>
            <th className="py-2">Product</th>
            <th className="py-2">Price</th>
            <th className="py-2">Date Added</th>
            <th className="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {wishlistItems.map((item) => (
            <tr key={item.id} className="border-b">
              {/* Remove Icon */}
              <td className="py-4">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-center"
                  aria-label={`Remove ${item.name}`}
                >
                  <X />
                </button>
              </td>

              {/* Product Details */}
              <td className="py-4 flex items-center gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="rounded-lg"
                />
                <span className="text-gray-800">{item.name}</span>
              </td>

              {/* Price */}
              <td className="py-4 text-gray-700">${item.price.toFixed(2)}</td>

              {/* Date Added */}
              <td className="py-4 text-gray-500">{item.dateAdded}</td>

              {/* Add To Cart Button */}
              <td className="py-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add To Cart
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}