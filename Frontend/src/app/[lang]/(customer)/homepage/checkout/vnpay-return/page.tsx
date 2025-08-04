"use client";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Breadcrumb, Button } from "@/components";
import darkLogo from "@public/images/dark+logo.png";
import Image from "next/image";
import { createNewOrder } from "@/lib/order-apis";

export default function VNPayReturnPage() {
  const { setCart } = useShoppingCart();
  const router = useRouter();
  const params = useSearchParams();
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const effectRan = useRef(false);
  const isSuccess = responseCode === "00" && transactionStatus === "00";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const checkoutDataFromLocalStorage = localStorage.getItem("checkoutData");
    if (checkoutDataFromLocalStorage) {
      try {
        setCheckoutData(JSON.parse(checkoutDataFromLocalStorage));
      } catch (error) {
        console.error("Error parsing checkout data from local storage:", error);
        toast.error("Đã có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại sau!");
        return;
      }
    } else {
      toast.error("Đã có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại sau!");
      return;
    }

    const createOrder = async () => {
      try {
        await createNewOrder(JSON.parse(checkoutDataFromLocalStorage));
        localStorage.removeItem("checkoutData");
        toast.success("Đặt hàng thành công!");
        setCart({
          cartID: 0,
          totalQuantity: 0,
          products: [],
        });
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Đặt hàng thất bại, vui lòng thử lại sau!");
      }
    };

    if (isSuccess) {
      createOrder();
    } else {
      toast.error("Đặt hàng thất bại, vui lòng thử lại sau!");
    }

  }, [isSuccess, setCart]);

  return (
    <div className="px-6 py-10 min-h-[60vh]">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Xác nhận đơn hàng" }]} />
      <div>
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
              {"Thanh toán thành công!"}
            </h1>
            <p className="mb-2">{"Cảm ơn bạn đã đặt hàng."}</p>
            <div className="relative overflow-hidden rounded p-4 my-4 w-full max-w-4xl mx-auto border-[2px] border-dashed border-gray-300">
              <div className="flex mb-4 ">
                <Image src={darkLogo} alt="Logo" className="w-auto h-10" />
              </div>
              <div className="h-[10px] w-[10px] bg-gray-300 rounded-full absolute right-5 top-5"></div>
              <div className="text-gray-300 text-7xl absolute opacity-20 -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[880px] -rotate-45">NFEAM HOUSE</div>
              <h2 className="text-2xl font-semibold mb-4 uppercase">{"Chi tiết đơn hàng"}</h2>
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
            <Button
              variant="primary"
              className=""
              onClick={() => router.push("/")}
            >
              {"Về trang chủ"}
            </Button>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center gap-y-4">
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              {"Thanh toán thất bại!"}
            </h1>
            <p className="mb-2">{"Đã có lỗi xảy ra trong quá trình thanh toán."}</p>
            <p>
              <strong>{"Mã lỗi:"}</strong> {responseCode}
            </p>
            <Button
              variant="primary"
              className=""
              onClick={() => router.push("/")}
            >
              {"Về trang chủ"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}