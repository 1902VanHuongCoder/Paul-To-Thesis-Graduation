"use client";
// Removed framer-motion. Will use manual animation.
import { Breadcrumb} from "@/components";
import { useCheckout } from "@/contexts/checkout-context";
import darkLogo from "@public/images/dark+logo.png";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function CashReturnPage() {
  const { checkoutData, setCheckoutData } = useCheckout();
  const router = useRouter();
  return (
    <div className="min-h-[60vh] py-10 px-6" onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      setCheckoutData(undefined);
      router.push("/");
    }}>
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Xác nhận đơn hàng" }]} />
      <div className="text-center flex flex-col items-center justify-center gap-y-2 mx-auto max-w-4xl">
        <svg
          width={100}
          height={100}
          viewBox="0 0 80 80"
          className="mx-auto mb-6"
          style={{
            opacity: 1,
            transform: 'scale(1)',
            transition: 'opacity 0.6s, transform 0.6s',
          }}
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M25 42 L37 54 L56 31"
            fill="none"
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          {"Đặt hàng thành công!"}
        </h1>
        <p className="mb-2">{"Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được xử lý sớm nhất."}</p>
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

            {
              checkoutData?.totalQuantity !== undefined && (
                <div>
                  <span className="font-semibold">Tổng số lượng:</span> {checkoutData.totalQuantity < 10 ? `0${checkoutData.totalQuantity}` : checkoutData.totalQuantity}
                </div>
              )
            }
            {
              checkoutData?.deliveryCost !== undefined && (
                <div>
                  <span className="font-semibold">Phí vận chuyển:</span> {checkoutData.deliveryCost?.toLocaleString()} VND
                </div>
              )
            }
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
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
        >
          {"Về trang chủ"}
        </Link>
      </div>
    </div>
  );
}