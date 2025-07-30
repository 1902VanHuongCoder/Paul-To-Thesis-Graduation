"use client";

import React from "react";
import Image from "next/image";
import Button from "@/components/ui/button/button-brand";
import { X } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import formatVND from "@/lib/others/format-vnd";
import formatDate from "@/lib/others/format-date";
import { useShoppingCart } from "@/contexts/shopping-cart-context";

export interface Product {
  productID: number;
  productName: string;
  productPrice: number;
  productPriceSale: number;
  quantityAvailable: number;
  images: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  wishlistID: number;
  customerID: string;
  productID: number;
  product: Product;
}

export default function WishlistPage() {
  const { wishlists, removeFromWishlist, setWishlist } = useWishlist();
  const { addToCart, fetchCart } = useShoppingCart();
  
  // Example handlers
  const handleRemoveItem = (productID: number, customerID: string) => {
    removeFromWishlist(customerID, productID);
    const wishlistUpdated = wishlists.filter((item) => item.productID !== productID);
    setWishlist(wishlistUpdated);
  };

  const handleAddToCart = async (productID: number, customerID: string) => {
    addToCart(productID, 1);
    fetchCart(customerID);
    removeFromWishlist(customerID, productID);
    const wishlistUpdated = wishlists.filter((item) => item.productID !== productID);
    setWishlist(wishlistUpdated);
  };

  return (
    <div className="w-full mt-7">
      <h1 className="text-xl font-bold text-gray-800 mb-4 uppercase">{"Danh sách yêu thích của bạn"}</h1>
      <table className="w-full border-collapse">
        <thead className="border-b border-[rgba(0,0,0,.2)]">
          <tr className="text-center text-gray-600">
            <th className="py-2">Xóa</th>
            <th className="py-2">
              Sản phẩm
            </th>
            <th className="py-2">
              Giá
            </th>
            <th className="py-2">
              Ngày thêm
            </th>
            <th className="py-2">
              Thêm vào giỏ hàng
            </th>
          </tr>
        </thead>
        <tbody>
          {wishlists.length > 0 ? wishlists.map((item) => (
            <tr key={item.wishlistID} className="border-b text-center">
              {/* Remove Icon */}
              <td className="py-4">
                <button
                  onClick={() => handleRemoveItem(item.productID, item.customerID)}
                  className="text-red-500 hover:text-red-700 text-center"
                  aria-label={`Remove ${item.product.productName} from wishlist`}
                >
                  <X />
                </button>
              </td>

              {/* Product Details */}
              <td className="py-4 flex items-center justify-center gap-4">
                <Image
                  src={item.product.images[0]} // Assuming images is an array and you want the first image
                  alt={item.product.productName}
                  width={50}
                  height={50}
                  className="rounded-lg"
                />
                <span className="text-gray-800">{item.product.productName}</span>
              </td>

              {/* Price */}
              <td className="py-4 text-gray-700">
                <span className={`${item.product.productPriceSale ? "hidden" : "text-primary-hover"}`}>{item.product.productPrice ? formatVND(item.product.productPrice) + " VND" : ""}</span>
                <span className="text-primary-hover">{item.product.productPriceSale ? formatVND(item.product.productPriceSale) + " VND" : ""}</span>
              </td>

              {/* Date Added */}
              <td className="py-4 text-gray-500">{formatDate(item.product.createdAt)}</td>

              {/* Add To Cart Button */}
              <td className="">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToCart(item.productID, item.customerID)}
                  className="mx-auto"
                  
                >
                  Thêm vào giỏ hàng
                </Button>
              </td>
            </tr>
          )) : <tr className="w-full">
              <td colSpan={5} className="text-start py-6">Chưa có sản phẩm nào trong danh sách yêu thích</td>
            </tr>}
        </tbody>
      </table>
    </div>
  );
}