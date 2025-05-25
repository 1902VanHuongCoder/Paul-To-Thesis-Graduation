"use client";
import { useSearchParams } from "next/navigation";

export default function VNPayReturnPage() {
  const params = useSearchParams();
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const orderInfo = params.get("vnp_OrderInfo");
  const amount = params.get("vnp_Amount");

  const isSuccess = responseCode === "00" && transactionStatus === "00";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {isSuccess ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
          <p className="mb-2">Cảm ơn bạn đã đặt hàng.</p>
          <p><strong>Thông tin đơn hàng:</strong> {orderInfo}</p>
          <p><strong>Số tiền:</strong> {Number(amount) / 100} VND</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h1>
          <p className="mb-2">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
          <p><strong>Mã lỗi:</strong> {responseCode}</p>
        </div>
      )}
    </div>
  );
}