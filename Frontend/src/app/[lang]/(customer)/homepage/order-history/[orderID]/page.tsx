"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import formatVND from "@/lib/format-vnd";
import { useDictionary } from "@/contexts/dictonary-context";
import Image from "next/image";
import { Breadcrumb, ContentLoading} from "@/components";
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from "@/components/ui/stepper/stepper";
import darkLogo from "@public/images/dark+logo.png";
import { Clock, CheckCircle2, Truck, Star, XCircle } from "lucide-react";

export interface DeliveryMethod {
  deliveryID: number;
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  speed?: string;
  isActive: boolean;
  isDefault: boolean;

}

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
  deliveryCost?: number;
  delivery: DeliveryMethod;
  discount: number;
  orderStatus: "pending" | "accepted" | "shipping" | "completed" | "cancled";
}

export default function OrderDetailPage() {
  // Get orderID from URL parameters 
  const params = useParams();
  const { orderID } = params as { orderID: string };

  // Contexts
  const { dictionary: d, lang } = useDictionary(); // Get dictionary and language from the context
  
  // State variables
  const [order, setOrder] = useState<Order | null>(null); // State to hold the order details
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch order details when coponent mounts or orderID changes
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/order/${orderID}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();

        const products = (data.products || []).map((p: {
          productID: number;
          productName: string;
          images?: string[];
          price: number;
          OrderProduct?: {
            price?: number;
            quantity?: number;
          };
        }) => ({
          productID: p.productID,
          productName: p.productName,
          images: p.images,
          price: p.OrderProduct?.price ?? p.price,
          quantity: p.OrderProduct?.quantity ?? 1,
        }));
        setOrder({ ...data, products });
        console.log("Order fetched:", data);
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
    return <ContentLoading />;
  }

  if (!order) {
    return <div className="p-8">{d?.orderDetailNotFound || "Không tìm thấy đơn hàng."}</div>;
  }

  return (
    <div className="px-6 py-10">
      <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.orderHistoryTitle || "Lịch sử mua hàng", href: `/${lang}/homepage/order-history` }, { label: orderID }]} />
      <h1 className="text-2xl font-bold mb-4 mt-6 uppercase text-center">{d?.orderDetailTitle || "Chi tiết đơn hàng"}</h1>
      <div className="relative max-w-4xl mx-auto bg-white rounded-lg p-6 border border-dashed border-gray-300 overflow-hidden">
        <Image src={darkLogo} alt="Logo" width={100} height={100} className="w-auto h-[50px]" />
        <div className="text-gray-300 bg-primary text-7xl absolute opacity-5 z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] -rotate-45 text-center">NFEAM HOUSE</div>
        <p className="py-8 text-center text-3xl font-bold">THÔNG TIN ĐƠN HÀNG</p>
        
        {/* Order status */}
        <div className="mb-6">
          <Stepper value={
            order.orderStatus === "pending" ? 0 :
            order.orderStatus === "accepted" ? 1 :
            order.orderStatus === "shipping" ? 2 :
            order.orderStatus === "completed" ? 3 :
            order.orderStatus === "cancled" ? 4 : 0
          } className="w-full">
            <StepperItem step={0} completed={order.orderStatus !== "pending"}>
              <StepperIndicator />
              <StepperTitle><Clock className="inline mr-1" size={18}/>Chờ xác nhận</StepperTitle>
              <StepperSeparator className="h-2 w-12 md:w-24" />
            </StepperItem>
            <StepperItem step={1} completed={order.orderStatus === "shipping" || order.orderStatus === "completed" || order.orderStatus === "cancled"}>
              <StepperIndicator />
              <StepperTitle><CheckCircle2 className="inline mr-1" size={18}/>Đã xác nhận</StepperTitle>
              <StepperSeparator className="h-2 w-12 md:w-24" />
            </StepperItem>
            <StepperItem step={2} completed={order.orderStatus === "completed" || order.orderStatus === "cancled"}>
              <StepperIndicator />
              <StepperTitle><Truck className="inline mr-1" size={18}/>Đang giao hàng</StepperTitle>
              <StepperSeparator className="h-2 w-12 md:w-24" />
            </StepperItem>
            <StepperItem step={3} completed={order.orderStatus === "completed"}>
              <StepperIndicator />
              <StepperTitle><Star className="inline mr-1" size={18}/>Hoàn thành</StepperTitle>
              <StepperSeparator className="h-2 w-12 md:w-24" />
            </StepperItem>
            <StepperItem step={4} completed={order.orderStatus === "cancled"}>
              <StepperIndicator />
              <StepperTitle><XCircle className="inline mr-1" size={18}/>Đã hủy</StepperTitle>
            </StepperItem>
          </Stepper>
          {order.orderStatus === "pending" && (
            <button
              className="mt-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={async () => {
                if (!confirm(d?.orderDetailCancelConfirm || "Bạn có chắc muốn hủy đơn hàng này?")) return;
                try {
                  const res = await fetch(`${baseUrl}/api/order/${order.orderID}/cancel`, { method: "PUT" });
                  if (!res.ok) throw new Error("Failed to cancel order");
                  setOrder({ ...order, status: "cancled" });
                } catch (err) {
                  console.error(err);
                  alert(d?.orderDetailCancelError || "Hủy đơn hàng thất bại. Vui lòng thử lại.");
                }
              }}
            >
              {d?.orderDetailCancelButton || "Hủy đơn"}
            </button>
          )}
        </div>
        
        <div className="space-y-4 text-md">
          <div><span>{d?.orderDetailOrderID || "Mã đơn hàng"}: </span> <span className="font-semibold">{order.orderID}</span> </div>
          <div><span>{d?.orderDetailDate || "Ngày đặt"}: </span><span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span > </div>
          <div className="absolute right-5 top-5 flex items-center gap-x-2 "><span className="w-[10px] h-[10px] bg-green-500 rounded-full"></span><span className="font-semibold text-md">{d?.orderDetailStatus || "Trạng thái"}:</span> {order.orderStatus || d?.orderHistoryStatusPending || "Đang xử lý"}</div>
          <div><span>{d?.orderDetailCustomer || "Khách hàng"}: </span><span className="font-semibold">{order.fullName}</span> </div>
          <div><span>{d?.orderDetailPhone || "Số điện thoại"}: </span><span className="font-semibold">{order.phone}</span> </div>
          <div><span>{d?.orderDetailAddress || "Địa chỉ"}:</span><span className="font-semibold"> {order.address}</span></div>
        </div>
        <h2 className="text-lg font-semibold mb-2 mt-4">{d?.orderDetailProducts || "Sản phẩm"}</h2>
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
        <div className="text-right font-bold text-md flex flex-col items-start gap-2">
          <div className="space-x-2"><span className="font-normal">{d?.orderDetailDeliveryCost || "Phí vận chuyển"}:</span><span> {formatVND(order.deliveryCost || 0)} VND</span></div>
          <div className="space-x-2"><span className="font-normal">{d?.orderDetailDeliveryMethod || "Phương thức vận chuyển"} - {order.delivery.name}:</span><span>{formatVND(order.delivery.basePrice || 0)} VND</span> </div>
          <div className="space-x-2"><span className="font-normal">{d?.orderDetailDiscount || "Giảm giá"}:</span><span>{formatVND(order.discount || 0)} VND</span> </div>
          <div className="space-x-2 text-2xl"><span className="font-normal">{d?.orderDetailTotalPayment || "Tổng thanh toán"}:</span><span className="text-3xl text-primary">{formatVND(order.totalPayment)} VND</span> </div>
        </div>
      </div>
    </div>
  );
}