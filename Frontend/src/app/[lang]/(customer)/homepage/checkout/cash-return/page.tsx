"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDictionary } from "@/contexts/dictonary-context";
import { Button } from "@/components";
import { useCheckout } from "@/contexts/checkout-context";

export default function CashReturnPage() {
  const { checkoutData } = useCheckout();
  const { dictionary: d } = useDictionary();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
 
        <div className="text-center flex flex-col items-center justify-center gap-y-2">
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
            {d?.cashReturnSuccessConfirm || "Đặt hàng thành công!"}
          </h1>
          <p className="mb-2">{d?.cashReturnSuccessMessage || "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được xử lý sớm nhất."}</p>
              <div className="bg-gray-50 rounded p-4 my-4 text-left w-full max-w-md mx-auto shadow">
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
                  {checkoutData?.totalPayment !== undefined && (
                      <div>
                          <span className="font-semibold">Tổng thanh toán:</span> {checkoutData.totalPayment?.toLocaleString()} VND
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
          <Button
            variant="primary"
            className=""
            onClick={() => router.push("/")}
          >
            {d?.cashReturnHomeButton || "Về trang chủ"}
          </Button>
        </div>
    </div>
  );
}