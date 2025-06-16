"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useDictionary } from "@/contexts/dictonary-context";
import { Breadcrumb, Button } from "@/components";
import { useCheckout } from "@/contexts/checkout-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import darkLogo from "@public/images/dark+logo.png";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { XCircle } from "lucide-react";
import { baseUrl } from "@/lib/base-url";

export default function PaypalReturnPage() {
  const params = useSearchParams();
  const orderID = params.get("orderID");
  const { user } = useUser();
  const { checkoutData } = useCheckout();
  const { fetchCart } = useShoppingCart();
  const [status, setStatus] = useState<"success" | "fail" | null>(null);
  const { dictionary: d } = useDictionary();
  const router = useRouter();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    const createOrder = async () => {
      if (!checkoutData || !user) {
        setStatus("fail");
        return;
      }
      await fetch(`${baseUrl}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData)
      }).then((res) => {
        if (!res.ok) {
          setStatus("fail");
        } else {
          fetchCart(user.userID);
          setStatus("success");
        }
      }).catch(() => setStatus("fail"));
    };
    if (orderID) {
      createOrder();
    } else {
      setStatus("fail");
    }
  }, []);

  return (
    <div className="min-h-[60vh] py-10 px-6">
      <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Xác nhận đơn hàng" }]} />
      <div className="text-center flex flex-col items-center justify-center gap-y-2 mx-auto max-w-4xl">
        {status === "success" ? (
          <motion.svg
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: {
                scale: 1,
                opacity: 1,
                transition: { type: "spring", stiffness: 260, damping: 20 }
              }
            }}
            width={100}
            height={100}
            viewBox="0 0 80 80"
            className="mx-auto mb-6"
          >
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.path
              d="M25 42 L37 54 L56 31"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </motion.svg>
        ) : status === "fail" ? (
          <XCircle className="mx-auto mb-6 text-red-500" size={100} />
        ) : null}
        <h1 className={`text-4xl font-bold mb-2 ${status === "success" ? "text-green-600" : status === "fail" ? "text-red-600" : ""}`}>
          {status === "success"
            ? (d?.paypalReturnSuccessConfirm || "Thanh toán PayPal thành công!")
            : status === "fail"
            ? (d?.paypalReturnFailConfirm || "Thanh toán PayPal thất bại!")
            : ""}
        </h1>
        <p className="mb-2">
          {status === "success"
            ? (d?.paypalReturnSuccessMessage || "Cảm ơn bạn đã thanh toán. Đơn hàng của bạn sẽ được xử lý sớm nhất.")
            : status === "fail"
            ? (d?.paypalReturnFailMessage || "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.")
            : ""}
        </p>
        {status === "success" && (
          <div className="relative overflow-hidden rounded p-4 my-4 w-full max-w-4xl mx-auto border-[2px] border-dashed border-gray-300">
            <div className="flex mb-4 ">
              <Image src={darkLogo} alt="Logo" className="w-auto h-10" />
            </div>
            <div className="h-[10px] w-[10px] bg-gray-300 rounded-full absolute right-5 top-5"></div>
            <div className="text-gray-300 text-7xl absolute opacity-20 -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[880px] -rotate-45">NFEAM HOUSE</div>
            <h2 className="text-2xl font-semibold mb-4 uppercase">{d?.paypalReturnOrderDetails || "Chi tiết đơn hàng"}</h2>
            <div className="flex flex-col items-start gap-y-4">
              {checkoutData?.orderID && (
                <div>
                  <span className="font-semibold">Mã đơn hàng:</span> {checkoutData.orderID}
                </div>
              )}
              {checkoutData?.fullName && (
                <div>
                  <span className="font-semibold">Tên khách hàng:</span> {checkoutData.fullName}
                </div>
              )}
              {checkoutData?.phone && (
                <div>
                  <span className="font-semibold">Số điện thoại:</span> {checkoutData.phone}
                </div>
              )}
              {checkoutData?.address && (
                <div>
                  <span className="font-semibold">Địa chỉ:</span> {checkoutData.address}
                </div>
              )}
              {checkoutData?.totalQuantity !== undefined && (
                <div>
                  <span className="font-semibold">Tổng số lượng:</span> {checkoutData.totalQuantity < 10 ? `0${checkoutData.totalQuantity}` : checkoutData.totalQuantity}
                </div>
              )}
              {checkoutData?.deliveryCost !== undefined && (
                <div>
                  <span className="font-semibold">Phí vận chuyển:</span> {checkoutData.deliveryCost?.toLocaleString()} VND
                </div>
              )}
              {checkoutData?.discount && (
                <div>
                  <span className="font-semibold">Giảm giá:</span> {checkoutData.discount.discountValue.toLocaleString()} VND
                </div>
              )}
              {checkoutData?.paymentMethod && (
                <div>
                  <span className="font-semibold">Phương thức thanh toán:</span> {checkoutData.paymentMethod}
                </div>
              )}
              {checkoutData?.note && (
                <div>
                  <span className="font-semibold">Ghi chú:</span> {checkoutData.note}
                </div>
              )}
            </div>
            {checkoutData?.totalPayment !== undefined && (
              <div className="flex justify-start items-center text-2xl gap-x-2 mt-4">
                <span className="font-semibold">Tổng thanh toán:</span>
                <span className="font-bold text-primary"> {checkoutData.totalPayment?.toLocaleString()}<span>VND</span>   </span>
              </div>
            )}
          </div>
        )}
        <Button
          variant="primary"
          className=""
          onClick={() => router.push("/")}
        >
          {d?.paypalReturnHomeButton || "Về trang chủ"}
        </Button>
      </div>
    </div>
  );
}