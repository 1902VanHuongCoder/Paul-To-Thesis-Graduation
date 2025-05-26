"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useDictionary } from "@/contexts/dictonary-context";
import { Button } from "@/components";
import { baseUrl } from "@/lib/base-url";
import toast from "react-hot-toast";
import { useCheckout } from "@/contexts/checkout-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";

export default function PaypalReturnPage() {
  const params = useSearchParams();
  const orderID = params.get("orderID");
  const { checkoutData } = useCheckout();
  const { setCart } = useShoppingCart();
  const [status, setStatus] = useState<"success" | "fail" | null>(null);
  const { dictionary: d } = useDictionary();
  const router = useRouter();
  const effectRan = useRef(false);


  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    const createOrder = async () => {
      await fetch(`${baseUrl}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify(checkoutData)
      }).then((res) => {
        if (!res.ok) {
          toast.error(d?.checkoutOrderError || "Đặt hàng thất bại, vui lòng thử lại sau!");
          throw new Error("Failed to place order");
        } else {
          toast.success(d?.checkoutOrderSuccess || "Đặt hàng thành công!");
          // Reset cart and checkout data
          setCart({
            cartID: 0,
            totalQuantity: 0,
            products: []
          });
        }
      })
    }
    if (orderID) {
      setStatus("success");
      alert("Creat order")
      createOrder();
    } else {
      setStatus("fail");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {status === "success" ? (
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
            {d?.paypalReturnSuccessConfirm || "Thanh toán thành công!"}
          </h1>
          <p className="mb-2">{d?.paypalReturnSuccessMessage || "Cảm ơn quý khách đã mua hàng tại NFeam House"}</p>
          <Button
            variant="primary"
            className=""
            onClick={() => router.push("/")}
          >
            {d?.paypalReturnHomeButton || "Về trang chủ"}
          </Button>
        </div>
      ) : status === "fail" ? (
        <div className="text-center flex flex-col items-center justify-center gap-y-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {d?.paypalReturnFailConfirm || "Thanh toán thất bại!"}
          </h1>
          <p className="mb-2">{d?.paypalReturnFailMessage || "Lỗi khi đặt hàng hãy kiểm tra kết nối và thử lại"}</p>
          <Button
            variant="primary"
            className=""
            onClick={() => router.push("/")}
          >
            {d?.paypalReturnHomeButton || "Về trang chủ"}
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p>{d?.paypalReturnProcessing ||
            "Đang xử lý thanh toán, vui lòng đợi..."
          }</p>
        </div>
      )}
    </div>
  );
}