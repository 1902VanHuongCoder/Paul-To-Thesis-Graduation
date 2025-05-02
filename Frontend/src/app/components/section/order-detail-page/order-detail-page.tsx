"use client";

import React from "react";

interface OrderDetailProps {
  orderNumber: string;
  date: string;
  total: string;
  paymentMethod: string;
  products: { name: string; quantity: number; price: string; color?: string; size?: string }[];
  billingInfo: {
    name: string;
    company?: string;
    address: string;
    phone: string;
  };
  shippingInfo: {
    name: string;
    company?: string;
    address: string;
    phone: string;
  };
}

export default function OrderDetailPage({
  orderNumber,
  date,
  total,
  paymentMethod,
  products,
  billingInfo,
  shippingInfo,
}: OrderDetailProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
      {/* Top Confirmation Message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Thank you. Your order has been received.</h2>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
        <div>
          <p className="font-bold">Order Number:</p>
          <p>{orderNumber}</p>
        </div>
        <div>
          <p className="font-bold">Date:</p>
          <p>{date}</p>
        </div>
        <div>
          <p className="font-bold">Total:</p>
          <p>{total}</p>
        </div>
        <div>
          <p className="font-bold">Payment Method:</p>
          <p>{paymentMethod}</p>
        </div>
      </div>

      {/* Order Details Table */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Order Details</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4 border border-gray-300">Product</th>
              <th className="p-4 border border-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="p-4 border border-gray-300">
                  <p>{product.name} ×{product.quantity}</p>
                  {product.color && <p>Color: {product.color}</p>}
                  {product.size && <p>Size: {product.size}</p>}
                </td>
                <td className="p-4 border border-gray-300">{product.price}</td>
              </tr>
            ))}
            <tr>
              <td className="p-4 border border-gray-300 font-bold">Subtotal</td>
              <td className="p-4 border border-gray-300">{total}</td>
            </tr>
            <tr>
              <td className="p-4 border border-gray-300 font-bold">Shipping</td>
              <td className="p-4 border border-gray-300">Free shipping</td>
            </tr>
            <tr>
              <td className="p-4 border border-gray-300 font-bold">Payment Method</td>
              <td className="p-4 border border-gray-300">{paymentMethod}</td>
            </tr>
            <tr>
              <td className="p-4 border border-gray-300 font-bold">TOTAL</td>
              <td className="p-4 border border-gray-300">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Billing & Shipping Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Billing Information</h3>
          <p><strong>Name:</strong> {billingInfo.name}</p>
          {billingInfo.company && <p><strong>Company:</strong> {billingInfo.company}</p>}
          <p><strong>Address:</strong> {billingInfo.address}</p>
          <p><strong>Phone:</strong> {billingInfo.phone}</p>
        </div>

        {/* Shipping Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h3>
          <p><strong>Name:</strong> {shippingInfo.name}</p>
          {shippingInfo.company && <p><strong>Company:</strong> {shippingInfo.company}</p>}
          <p><strong>Address:</strong> {shippingInfo.address}</p>
          <p><strong>Phone:</strong> {shippingInfo.phone}</p>
        </div>
      </div>
    </div>
  );
}