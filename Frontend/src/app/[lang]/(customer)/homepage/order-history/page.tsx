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
    <div className="min-h-[60vh] px-6 py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Lịch sử mua hàng" }]} />

      <h1 className="text-2xl font-bold mb-6 mt-6 uppercase text-center">Lịch sử mua hàng</h1>
      {loading ? (
        <div><ContentLoading /></div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="w-full">
          <table className="w-full border-collapse bg-white rounded border-[1px] border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">Mã đơn</th>
                <th className="p-3 text-left">Ngày đặt</th>
                <th className="p-3 text-left">Tổng tiền</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderID} className="border-b hover:bg-gray-50">
                  <td className="p-3">{order.orderID}</td>
                  <td className="p-3">{formatDate(order.createdAt)}</td>
                  <td className="p-3">{formatVND(order.totalPayment)} VND</td>
                  <td className="p-3 flex items-center gap-2">
                    <span className={clsx({
                      "bg-yellow-500": order.orderStatus === "pending",
                      "bg-purple-500": order.orderStatus === "accepted",
                      "bg-blue-500": order.orderStatus === "shipping",
                      "bg-green-500": order.orderStatus === "completed",
                      "bg-red-500": order.orderStatus === "cancelled", 
                      
                    }, "w-3 h-3 rounded-full")}> 

                    </span>
                    <span >
                      {order.orderStatus === "pending" ? "Đang xử lý" :
                        order.orderStatus === "accepted" ? "Đã xác nhận" :
                        order.orderStatus === "shipping" ? "Đang giao hàng" :
                        order.orderStatus === "completed" ? "Hoàn thành" :
                        order.orderStatus === "cancelled" ? "Đã hủy" :
                      ""}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="normal"
                      size="sm"
                      onClick={() => router.push(`/vi/homepage/order-history/${order.orderID}`)}
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