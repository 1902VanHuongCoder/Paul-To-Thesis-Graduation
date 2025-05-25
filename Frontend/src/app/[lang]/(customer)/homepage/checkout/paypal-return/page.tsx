"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaypalReturnPage() {
  const [status, setStatus] = useState<"success" | "fail" | null>(null);
  const router = useRouter();

  useEffect(() => {
    // You can enhance this logic by checking query params or session if needed
    // For now, we assume if user lands here, payment was successful
    setStatus("success");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {status === "success" ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Thanh toán PayPal thành công!</h1>
          <p className="mb-2">Cảm ơn bạn đã đặt hàng qua PayPal.</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
            onClick={() => router.push("/")}
          >
            Quay về trang chủ
          </button>
        </div>
      ) : status === "fail" ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h1>
          <p className="mb-2">Đã có lỗi xảy ra trong quá trình thanh toán PayPal.</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
            onClick={() => router.push("/")}
          >
            Quay về trang chủ
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p>Đang xử lý kết quả thanh toán...</p>
        </div>
      )}
    </div>
  );
}