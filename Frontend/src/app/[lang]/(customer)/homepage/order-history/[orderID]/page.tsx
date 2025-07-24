"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/others/base-url";
import formatVND from "@/lib/others/format-vnd";
import Image from "next/image";
import { Breadcrumb, Button, ContentLoading } from "@/components";
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from "@/components/ui/stepper/stepper";
import darkLogo from "@public/images/dark+logo.png";
import { Clock, CheckCircle2, Truck, Star, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/user-context";
import { comment, fetchComments } from "@/lib/product-comment-apis";
import { getOrderDetails } from "@/lib/order-apis";
import { isToxicComment } from "@/lib/others/prevent-toxic-comment";

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
  images?: string[];
  price: number;
  quantity: number;
}

interface Order {
  userID: string;
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
  orderStatus: "pending" | "accepted" | "shipping" | "completed" | "cancelled";
}

export default function OrderDetailPage() {
  // Get orderID from URL parameters 
  const params = useParams();
  const { orderID } = params as { orderID: string };

  // Contexts
  const { user } = useUser();

  // State variables
  const [order, setOrder] = useState<Order | null>(null); // State to hold the order details
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [newRating, setNewRating] = useState(5); // New rating input (default 5 stars)
  const [newComment, setNewComment] = useState(""); // New comment input
  const [submitting, setSubmitting] = useState(false); // Submitting state for comment form
  const commentInputRef = useRef<HTMLInputElement>(null); // Reference to comment input field
  // State for showing review form for a specific product
  const [reviewingProductID, setReviewingProductID] = useState<number | null>(null);

  const handleCommentSubmit = async (e: React.FormEvent, productID: number) => {
    e.preventDefault();
    if (!newComment.trim() || !productID) return;
    setSubmitting(true);

    try {
      if (!user) {
        toast.error("Bạn cần đăng nhập để bình luận!");
        return;
      }
      if(isToxicComment(newComment.trim())) { 
        toast.error("Bình luận của bạn chứa từ ngữ không phù hợp!");
        return;
      }
      
      await comment(user.userID, productID, newComment.trim(), newRating, "active");
      toast.success("Bình luận của bạn đã được gửi!");

      // Refetch comments
      await fetchComments(productID);
      setNewComment("");
      setNewRating(5);
      commentInputRef.current?.focus();
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("Gửi bình luận thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch order details when coponent mounts or orderID changes
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetails(orderID);

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
    return <div className="p-8">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="px-6 pt-10 pb-16">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Lịch sử mua hàng", href: `/vi/homepage/order-history` }, { label: orderID }]} />
      <h1 className="text-2xl font-bold mb-4 mt-6 uppercase text-center">Chi tiết đơn hàng</h1>
      {/* Order status */}
      <div className="my-10">
        <Stepper value={
          order.orderStatus === "pending" ? 0 :
            order.orderStatus === "accepted" ? 1 :
              order.orderStatus === "shipping" ? 2 :
                order.orderStatus === "completed" ? 3 : 0
          // order.orderStatus === "cancled" ? 4 : 0
        } className="w-full flex justify-center gap-x-4">
          <StepperItem className="w-[200px] shrink-0" step={0} completed={order.orderStatus !== "pending"}>
            <div className="flex items-center gap-y-4 flex-col">
              <StepperIndicator />
              <StepperTitle><Clock className="inline mr-1" size={18} />Chờ xác nhận</StepperTitle>
              {order.orderStatus === "pending" && (
                <button
                  className="px-4 py-1 bg-primary text-white rounded hover:bg-primary/90 transition hover:cursor-pointer"
                  onClick={async () => {
                    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
                    try {
                      const res = await fetch(`${baseUrl}/api/order/${order.orderID}`, {

                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ ...order, orderStatus: "cancelled" }),
                      });
                      if (!res.ok) throw new Error("Failed to cancel order");
                      setOrder({ ...order, orderStatus: "cancelled" });
                    } catch (err) {
                      console.error(err);
                      alert("Hủy đơn hàng thất bại. Vui lòng thử lại.");
                    }
                  }}
                >
                  Hủy đơn
                </button>
              )}
            </div>
            <StepperSeparator className="h-2 w-12 md:w-16" />
          </StepperItem>
          <StepperItem className="w-[200px] shrink-0" step={1} completed={order.orderStatus === "shipping" || order.orderStatus === "completed"}>
            <div className="flex items-center gap-y-4 flex-col">

              <StepperIndicator />
              <StepperTitle><CheckCircle2 className="inline mr-1" size={18} />Đã xác nhận</StepperTitle>
            </div>
            <StepperSeparator className="h-2 w-12 md:w-16" />
          </StepperItem>

          <StepperItem className="w-[200px] shrink-0" step={2} completed={order.orderStatus === "completed"}>
            <div className="flex items-center gap-y-4 flex-col">

              <StepperIndicator />
              <StepperTitle><Truck className="inline mr-1" size={18} />Đang giao hàng</StepperTitle>
            </div>
            <StepperSeparator className="h-2 w-12 md:w-16" />
          </StepperItem>
          <StepperItem className="w-[200px] shrink-0" step={3} completed={order.orderStatus === "completed"}>
            <div className="flex items-center gap-y-4 flex-col">

              <StepperIndicator />
              <StepperTitle><Star className="inline mr-1" size={18} />Hoàn thành</StepperTitle>
            </div>
            <StepperSeparator className="h-2 w-12 md:w-16" />
          </StepperItem>
          <StepperItem className="" step={4} completed={order.orderStatus === "cancelled"}>
            <div className="flex items-center gap-y-4 flex-col">

              <StepperIndicator />
              <StepperTitle><XCircle className="inline mr-1" size={18} />Đã hủy</StepperTitle>
            </div>
          </StepperItem>
        </Stepper>
      </div>

      <div className="relative max-w-4xl mx-auto bg-white rounded-lg p-6 border border-dashed border-gray-300 overflow-hidden">
        <Image src={darkLogo} alt="Logo" width={100} height={100} className="w-auto h-[50px]" />
        <div className="text-gray-300 bg-primary text-7xl absolute opacity-5 z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] -rotate-45 text-center">NFEAM HOUSE</div>
        <p className="py-8 text-center text-3xl font-bold">THÔNG TIN ĐƠN HÀNG</p>
        <div className="space-y-4 text-md">
          <div><span>{"Mã đơn hàng"}: </span> <span className="font-semibold">{order.orderID}</span> </div>
          <div><span>{"Ngày đặt"}: </span><span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span > </div>
          <div className="absolute right-5 top-5 flex items-center gap-x-2 bg-white z-48 px-4 py-2 shadow-sm rounded-md">
            <span className="w-[10px] h-[10px] bg-green-500 rounded-full animate-ping"></span>
            <span className="font-semibold text-md">Trạng thái:</span> <span>
              {order.orderStatus === "pending" ? "Đang xử lý" :
                order.orderStatus === "accepted" ? "Đã xác nhận" :
                  order.orderStatus === "shipping" ? "Đang giao hàng" :
                    order.orderStatus === "completed" ? "Hoàn thành" :
                      order.orderStatus === "cancelled" ? "Đã hủy" : "Trạng thái không xác định"}
            </span></div>
          <div><span>{"Khách hàng"}: </span><span className="font-semibold">{order.fullName}</span> </div>
          <div><span>{"Số điện thoại"}: </span><span className="font-semibold">{order.phone}</span> </div>
          <div><span>{"Địa chỉ"}:</span><span className="font-semibold"> {order.address}</span></div>
        </div>
        <h2 className="text-lg font-semibold mb-2 mt-4">{"Sản phẩm"}</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">{"Tên sản phẩm"}</th>
              <th className="p-2 text-left">{"Hình ảnh"}</th>
              <th className="p-2 text-left">{"Đơn giá"}</th>
              <th className="p-2 text-left">{"Số lượng"}</th>
              <th className="p-2 text-left">{"Thành tiền"}</th>
              {order.orderStatus === "completed" && <th className="p-2 text-left">Đánh giá</th>}
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
                {order.orderStatus === "completed" && (
                  <td className="p-2">
                    <Button
                      variant="normal"
                      size="sm"
                      onClick={() => {
                        setReviewingProductID(product.productID);
                        setNewComment("");
                        setNewRating(5);
                      }}
                    >
                      Đánh giá
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-md flex flex-col items-start gap-2">
          <div className="space-x-2"><span className="font-normal">{"Phí vận chuyển"}:</span><span> {formatVND(order.deliveryCost || 0)} VND</span></div>
          <div className="space-x-2"><span className="font-normal">{"Phương thức vận chuyển"} - {order.delivery.name}:</span><span>{formatVND(order.delivery.basePrice || 0)} VND</span> </div>
          <div className="space-x-2"><span className="font-normal">{"Giảm giá"}:</span><span>{formatVND(order.discount || 0)} VND</span> </div>
          <div className="space-x-2 text-2xl"><span className="font-normal">{"Tổng thanh toán"}:</span><span className="text-3xl text-primary">{formatVND(order.totalPayment)} VND</span> </div>
        </div>
      </div> {/* Product review form for selected product */}
      {order.orderStatus === "completed" && (
        <motion.div
          initial={{ y: 120 }}
          animate={reviewingProductID ? { y: 0 } : { y: 120 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 w-full z-49 bg-white rounded-tr-xl rounded-tl-xl shadow-lg border-t border-gray-200"
        >
          {reviewingProductID && (() => {
            const product = order.products.find(p => p.productID === reviewingProductID);
            return (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleCommentSubmit(e, reviewingProductID);
                }}
                className="flex flex-col gap-y-4 p-6"
              >
                <div className="flex items-center gap-4 mb-2">
                  {product && product.images && product.images.length > 0 && (
                    <Image src={product.images[0]} alt={product.productName} width={48} height={48} className="w-12 h-12 object-cover rounded" />
                  )}
                  <span className="font-semibold text-lg">{product ? product.productName : ""}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">Đánh giá:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={star <= newRating ? "text-yellow-400" : "text-gray-300"}
                      onClick={() => setNewRating(star)}
                      aria-label={`Đánh giá ${star} sao`}
                    >
                      <Star className="h-[20px]" fill={star <= newRating ? "var(--color-yellow-400)" : "var(--color-gray-300)"} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 translate-y-0.5">{newRating}/5 sao</span>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                    placeholder="Viết bình luận về sản phẩm..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    disabled={submitting}
                  />
                  <Button
                    type="submit"
                    size="md"
                    className="disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    variant="primary"
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? "Đang gửi..." : "Gửi bình luận"}
                  </Button>
                  <button
                    className="shrink-0 px-6 py-2 border-[2px] border-gray-500 text-gray-700 rounded-full hover:bg-primary hover:text-white transition hover:cursor-pointer "
                    type="button"
                    onClick={() => setReviewingProductID(null)}
                  >
                    Đóng 
                  </button>
                </div>
              </form>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}