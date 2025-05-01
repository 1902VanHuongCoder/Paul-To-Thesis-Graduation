"use client";

import { AddToCartPanel, WishlistDialog } from "@/app/components";

export default function NewsList() {
  const wishlistItems = [
    {
      id: "1",
      name: "Vimto Squash Remix",
      price: "18.00$",
      date: "24 February 2025",
      image: "https://img.freepik.com/free-psd/fresh-glistening-red-apple-with-leaf-transparent-background_84443-27689.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
    },
    {
      id: "2",
      name: "Vimto Squash Remix",
      price: "18.00$",
      date: "24 February 2025",
      image: "https://img.freepik.com/free-vector/vector-ripe-yellow-banana-bunch-isolated-white-background_1284-45456.jpg?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid&w=740",
    },
  ];
  const handleRemoveItem = (id: string) => {
    console.log(`Removed item with id: ${id}`);
  };

  const handleAddToCart = (id: string) => {
    console.log(`Added item with id: ${id} to cart`);
  };
  return (
    <div className="font-sans">
      <WishlistDialog
        items={wishlistItems}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}