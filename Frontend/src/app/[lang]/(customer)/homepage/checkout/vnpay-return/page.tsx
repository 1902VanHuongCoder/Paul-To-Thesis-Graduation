"use client";
import { useDictionary } from "@/contexts/dictonary-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { baseUrl } from "@/lib/base-url";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components";

export default function VNPayReturnPage() {
  const { setCart } = useShoppingCart();
  const { dictionary: d } = useDictionary();
  const router = useRouter();
  const params = useSearchParams();
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const orderInfo = params.get("vnp_OrderInfo");
  const amount = params.get("vnp_Amount");
  const effectRan = useRef(false);
  const isSuccess = responseCode === "00" && transactionStatus === "00";

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    const checkoutDataFromLocalStorage =localStorage.getItem("checkoutData");
    const createOrder = async () => {
      if(!checkoutDataFromLocalStorage) {
        toast.error("Không tìm thấy dữ liệu thanh toán, vui lòng thử lại!");
        return;
      }else{
        await fetch(`${baseUrl}/api/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: checkoutDataFromLocalStorage
        }).then((res) => {
          if (!res.ok) {
            toast.error(d?.checkoutOrderError || "Đặt hàng thất bại, vui lòng thử lại sau!");
            throw new Error("Failed to place order");
          } else {
            toast.success(d?.checkoutOrderSuccess || "Đặt hàng thành công!");
            setCart({
              cartID: 0,
              totalQuantity: 0,
              products: []
            });
          }
        });
      }
    };
    if (isSuccess) {
      createOrder();
    } else {
      toast.error(d?.checkoutOrderError || "Đặt hàng thất bại, vui lòng thử lại sau!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {isSuccess ? (
        <div className="text-center flex flex-col items-center justify-center gap-y-2">
          {/* Framer Motion SVG Success Animation */}
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
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            {d?.vnpayReturnSuccessConfirm || "Thanh toán thành công!"}
          </h1>
          <p className="mb-2">{d?.vnpayReturnSuccessMessage || "Cảm ơn bạn đã đặt hàng."}</p>
          <p>
            <strong>{d?.vnpayReturnOrderInfo || "Thông tin đơn hàng:"}</strong> {orderInfo}
          </p>
          <p>
            <strong>{d?.vnpayReturnAmount || "Số tiền:"}</strong> {Number(amount) / 100} VND
          </p>
          <Button
            variant="primary"
            className=""
            onClick={() => router.push("/")}
          >
            {d?.vnpayReturnHomeButton || "Về trang chủ"}
          </Button>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center justify-center gap-y-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {d?.vnpayReturnFailConfirm || "Thanh toán thất bại!"}
          </h1>
          <p className="mb-2">{d?.vnpayReturnFailMessage || "Đã có lỗi xảy ra trong quá trình thanh toán."}</p>
          <p>
            <strong>{d?.vnpayReturnErrorCode || "Mã lỗi:"}</strong> {responseCode}
          </p>
          <Button
            variant="primary"
            className=""
            onClick={() => router.push("/")}
          >
            {d?.vnpayReturnHomeButton || "Về trang chủ"}
          </Button>
        </div>
      )}
    </div>
  );
}