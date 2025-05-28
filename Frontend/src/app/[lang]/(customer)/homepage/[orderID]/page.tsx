"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import formatVND from "@/lib/format-vnd";
import { useDictionary } from "@/contexts/dictonary-context";
import Image from "next/image";

interface Product {
  productID: number;
  productName: string;
  images?: string[]; // or productImage?: string;
  price: number;
  quantity: number;
}

interface Order {
  orderID: string;
  createdAt: string;
  totalPayment: number;
  status?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  products: Product[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const { orderID } = params as { orderID: string };
  const { dictionary: d } = useDictionary();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/order/${orderID}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        // Map product info for easier rendering
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const products = (data.products || []).map((p: any) => ({
          productID: p.productID,
          productName: p.productName,
          images: p.images,
          price: p.OrderProduct?.price ?? p.price,
          quantity: p.OrderProduct?.quantity ?? 1,
        }));
        setOrder({ ...data, products });
      } catch (error) {
        console.error(error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderID) fetchOrder();
  }, [orderID]);

  if (loading) {
    return <div className="p-8">{d?.orderDetailLoading || "Đang tải chi tiết đơn hàng..."}</div>;
  }

  if (!order) {
    return <div className="p-8 text-red-500">{d?.orderDetailNotFound || "Không tìm thấy đơn hàng."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow p-6 my-8">
      <h1 className="text-2xl font-bold mb-4">{d?.orderDetailTitle || "Chi tiết đơn hàng"}</h1>
      <div className="mb-4">
        <div><span className="font-semibold">{d?.orderDetailOrderID || "Mã đơn hàng"}:</span> {order.orderID}</div>
        <div><span className="font-semibold">{d?.orderDetailDate || "Ngày đặt"}:</span> {new Date(order.createdAt).toLocaleString()}</div>
        <div><span className="font-semibold">{d?.orderDetailStatus || "Trạng thái"}:</span> {order.status || d?.orderHistoryStatusPending || "Đang xử lý"}</div>
        <div><span className="font-semibold">{d?.orderDetailCustomer || "Khách hàng"}:</span> {order.fullName}</div>
        <div><span className="font-semibold">{d?.orderDetailPhone || "Số điện thoại"}:</span> {order.phone}</div>
        <div><span className="font-semibold">{d?.orderDetailAddress || "Địa chỉ"}:</span> {order.address}</div>
      </div>
      <h2 className="text-lg font-semibold mb-2">{d?.orderDetailProducts || "Sản phẩm"}</h2>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">{d?.orderDetailProductName || "Tên sản phẩm"}</th>
            <th className="p-2 text-left">{d?.orderDetailProductImage || "Hình ảnh"}</th>
            <th className="p-2 text-left">{d?.orderDetailProductPrice || "Đơn giá"}</th>
            <th className="p-2 text-left">{d?.orderDetailProductQuantity || "Số lượng"}</th>
            <th className="p-2 text-left">{d?.orderDetailProductTotal || "Thành tiền"}</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product) => (
            <tr key={product.productID} className="border-b">
              <td className="p-2">{product.productName}</td>
              <td className="p-2">
                {product.images && product.images.length > 0 ? (
                  <Image width={200} height={200} src={product.images[0]} alt={product.productName} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </td>
              <td className="p-2">{formatVND(product.price)} VND</td>
              <td className="p-2">{product.quantity}</td>
              <td className="p-2">{formatVND(product.price * product.quantity)} VND</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right font-bold text-lg">
        {d?.orderDetailTotalPayment || "Tổng thanh toán"}: {formatVND(order.totalPayment)} VND
      </div>
    </div>
  );
}