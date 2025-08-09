"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import formatVND from "@/lib/others/format-vnd";
import Button from "@/components/ui/button/button-brand";
import { useUser } from "@/contexts/user-context";
import { Breadcrumb, ContentLoading } from "@/components";
import { getOrderHistory } from "@/lib/order-apis";
import clsx from "clsx";
import formatDate from "@/lib/others/format-date";

interface OrderProduct {
  productID: number;
  productName?: string;
  quantity: number;
  price: number;
}

interface Order {
  orderID: string;
  createdAt: string;
  totalPayment: number;
  orderStatus: string;
  products?: OrderProduct[];
}

const OrderHistory = () => {
  // Router
  const router = useRouter();

  // State variables
  const { user } = useUser(); // Get user information from context
  const [orders, setOrders] = useState<Order[]>([]); // State to hold orders
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOrderHistory(user.userID);
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-[60vh] px-6 py-10 bg-gradient-to-b from-white to-[#f5f8ff]">
      <Breadcrumb
      items={[
        { label: "Trang chủ", href: "/" },
        { label: "Lịch sử mua hàng" },
      ]}
      />

      <h1 className="text-3xl font-extrabold mb-8 mt-8 uppercase text-center text-brand-600 drop-shadow-sm tracking-wide">
      Lịch sử mua hàng
      </h1>
      {loading ? (
      <div className="flex justify-center items-center min-h-[200px]">
        <ContentLoading />
      </div>
      ) : orders.length === 0 ? (
      <div className="text-gray-400 text-center text-lg mt-12">
        Bạn chưa có đơn hàng nào.
      </div>
      ) : (
      <div className="w-full max-w-8xl mx-auto shadow-lg rounded-xl overflow-hidden border border-brand-100 bg-white">
        <table className="w-full border-collapse">
        <thead>
          <tr className="bg-brand-50 text-brand-700">
          <th className="p-4 text-left font-semibold">Mã đơn</th>
          <th className="p-4 text-left font-semibold">Ngày đặt</th>
          <th className="p-4 text-left font-semibold">Tổng tiền</th>
          <th className="p-4 text-left font-semibold">Trạng thái</th>
          <th className="p-4 text-left font-semibold">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
          <tr
            key={order.orderID}
            className={`border-b last:border-b-0 hover:bg-brand-50/40 transition ${order.orderStatus === "boomed" ? "bg-red-500 text-white" : ""}`}
          >
            <td className="p-4 font-mono text-brand-700">{order.orderID}</td>
            <td className="p-4">{formatDate(order.createdAt)}</td>
            <td className="p-4 font-semibold text-brand-600">
            {formatVND(order.totalPayment)} <span className="text-xs text-gray-400">VND</span>
            </td>
            <td className="p-4">
            <span className="inline-flex items-center gap-2">
              <span
              className={clsx(
                {
                "bg-yellow-400": order.orderStatus === "pending",
                "bg-purple-500": order.orderStatus === "accepted",
                "bg-blue-500": order.orderStatus === "shipping",
                "bg-green-500": order.orderStatus === "completed",
                "bg-red-500": order.orderStatus === "cancelled",
                "bg-orange-500": order.orderStatus === "boomed",
                },
                "w-3 h-3 rounded-full shadow"
              )}
              ></span>
              <span className="font-medium text-brand-700">
              {order.orderStatus === "pending"
                ? "Đang xử lý"
                : order.orderStatus === "accepted"
                ? "Đã xác nhận"
                : order.orderStatus === "shipping"
                ? "Đang giao hàng"
                : order.orderStatus === "completed"
                ? "Hoàn thành"
                : order.orderStatus === "cancelled"
                ? "Đã hủy" 
                : order.orderStatus === "boomed"
                ? "Không nhận hàng"
                : ""}
              </span>
            </span>
            </td>
            <td className="p-4">
            <Button
              variant="normal"
              size="sm"
              className="rounded-full px-5 shadow-md"
              onClick={() =>
              router.push(`/vi/homepage/order-history/${order.orderID}`)
              }
            >
              Xem
            </Button>
            </td>
          </tr>
          ))}
        </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default OrderHistory;