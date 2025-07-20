"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/contexts/dictonary-context";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/lib/others/base-url";
import formatVND from "@/lib/others/format-vnd";
import Button from "@/components/ui/button/button-brand";
import { useUser } from "@/contexts/user-context";
import { Breadcrumb, ContentLoading } from "@/components";

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
  status?: string;
  products?: OrderProduct[];
}

const OrderHistory = () => {
  // Router
  const router = useRouter();

  // Contexts 
  const { dictionary: d, lang } = useDictionary();

  // State variables
  const { user } = useUser(); // Get user information from context
  const [orders, setOrders] = useState<Order[]>([]); // State to hold orders
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) { // If user is not logged in, set loading to false and return
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/api/order/history/${user?.userID}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
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
      <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.orderHistoryTitle || "Lịch sử mua hàng" }]} />

      <h1 className="text-2xl font-bold mb-6 mt-6 uppercase text-center">{d?.orderHistoryTitle || "Lịch sử mua hàng"}</h1>
      {loading ? (
        <div><ContentLoading /></div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">{d?.orderHistoryEmpty || "Bạn chưa có đơn hàng nào."}</div>
      ) : (
        <div className="w-full">
          <table className="w-full border-collapse bg-white rounded border-[1px] border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">{d?.orderHistoryOrderID || "Mã đơn"}</th>
                <th className="p-3 text-left">{d?.orderHistoryDate || "Ngày đặt"}</th>
                <th className="p-3 text-left">{d?.orderHistoryTotal || "Tổng tiền"}</th>
                <th className="p-3 text-left">{d?.orderHistoryStatus || "Trạng thái"}</th>
                <th className="p-3 text-left">{d?.orderHistoryDetail || "Chi tiết"}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderID} className="border-b hover:bg-gray-50">
                  <td className="p-3">{order.orderID}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{formatVND(order.totalPayment)} VND</td>
                  <td className="p-3"><span>{order.status || d?.orderHistoryStatusPending || "Đang xử lý"}</span></td>
                  <td className="p-3">
                    <Button
                      variant="normal"
                      size="sm"
                      onClick={() => router.push(`/${lang}/homepage/order-history/${order.orderID}`)}
                    >
                      {d?.orderHistoryDetailButton || "Xem"}
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