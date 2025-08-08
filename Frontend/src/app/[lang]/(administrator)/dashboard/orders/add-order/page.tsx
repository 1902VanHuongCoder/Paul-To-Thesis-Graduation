"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import { fetchCartByCustomerID, createShoppingCartWithBarcode } from "@/lib/shopping-cart-apis";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/user-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { fetchDeliveryMethods } from "@/lib/delivery-apis";
import Image from "next/image";
import { createNewOrder } from "@/lib/order-apis";
import { checkPromotionCode, fetchAllDiscounts } from "@/lib/discount-apis";


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

export interface CartItem {
  quantity: number;
  price: number;
  discount: number;
}
export interface Product {
  productID: number;
  productName: string;
  productPrice: number;
  productPriceSale: number;
  quantityAvailable: number;
  images: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
  CartItem: CartItem;
}

type Discount = {
  discountID: string;
  discountDescription: string;
  discountPercent: number;
  expireDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface Cart {
  cartID: number;
  totalQuantity: number;
  products: Product[];
}

function generateOrderID(productQuantity: number) {
  const now = new Date();
  return `OR10${productQuantity}0${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}0${Math.floor(Math.random() * 10000)}`;
}

export default function AddOrderPage() {
  const { user } = useUser();
  const { cart, setCart, removeFromCart } = useShoppingCart();
  const [barcode, setBarcode] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState({ code: "", maxDiscount: 0, discount: 0 });
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [deliveryID, setDeliveryID] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const barcodeBuffer = useRef("");
  const bufferTimeout = useRef<NodeJS.Timeout | null>(null);
  const [discountList, setDiscountList] = useState<Discount[]>([]);

  // Fetch all discount codes on mount
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const data = await fetchAllDiscounts();
        setDiscountList(data);
      } catch (e) {
        setDiscountList([]);
        console.error("Error fetching discount codes:", e);
      }
    };
    fetchDiscounts();
  }, []);

  // Fetch delivery methods
  useEffect(() => {
    const fetchDeliveryMethodData = async () => {
      const data = await fetchDeliveryMethods();
      setDeliveryMethods(data);
    };
    fetchDeliveryMethodData();
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    if (user?.userID) {
      fetchCartByCustomerID(user.userID)
        .then(data => { setCart(data) })
        .catch(() => setCart({
          cartID: 0,
          totalQuantity: 0,
          products: [],
        }));
    }
  }, [user, setCart]);

  // Add product to cart by barcode
  const handleAddBarcode = useCallback(async (bc: string) => {
    if (!user) return toast.error("Bạn cần đăng nhập.");
    setError("");
    setLoading(true);
    try {
      const data = await createShoppingCartWithBarcode(user.userID, bc, 1);
      if (data) {
        const updatedCart = await fetchCartByCustomerID(user.userID);
        setCart(updatedCart);
      }
    } catch (err) {
      setError("Không tìm thấy sản phẩm với mã vạch này.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, setCart]);

  // Listen for barcode scanner input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        barcodeBuffer.current += e.key;
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
        bufferTimeout.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, 200);
      } else if (e.key === "Enter" && barcodeBuffer.current.length > 0) {
        handleAddBarcode(barcodeBuffer.current);
        barcodeBuffer.current = "";
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, cart, handleAddBarcode]);



  // Manual add
  const handleManualAdd = () => {
    if (barcode.trim()) handleAddBarcode(barcode.trim());
  };

  // Calculate totals
  const totalQuantity = cart && cart.products && cart.products.length > 0 ? cart.products.reduce((sum, p) => sum + (p.CartItem?.quantity || 0), 0) : 0;
  const subtotal = cart && cart.products && cart.products.length > 0 ? cart.products.reduce((sum, p) => sum + ((p.CartItem?.price || 0) * (p.CartItem?.quantity || 0)), 0) : 0;
  const totalPayment = subtotal - discount; // Apply discount if any

  // Submit order
  const handleSubmit = async () => {
    if (!user) return toast.error("Bạn cần đăng nhập.");
    if (!fullName || !phone) return toast.error("Vui lòng nhập đầy đủ thông tin.");
    if (!deliveryID) return toast.error("Vui lòng chọn phương thức giao hàng.");
    setLoading(true);
    try {
      const orderID = generateOrderID(totalQuantity);
      const res = await createNewOrder({
        orderID,
        userID: user.userID,
        fullName,
        phone,
        address: "Tại cửa hàng",
        paymentMethod: "Tiền mặt",
        cartID: cart?.cartID,
        deliveryID,
        totalPayment,
        totalQuantity,
        note,
        discount: promoApplied && promoCode.code ? { discountID: promoCode.code, discountValue: discount } : undefined,
        deliveryCost: 0,
        status: "completed",
      });
      if (res) {
        toast.success("Tạo đơn hàng thành công!");
        setCart({
          cartID: 0,
          totalQuantity: 0,
          products: [],
        });
        setFullName("");
        setPhone("");
        setNote("");
        setPromoCode({ code: "", maxDiscount: 0, discount: 0 });
        setDiscount(0);
        setPromoApplied(false);
      } else {
        toast.error("Tạo đơn hàng thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo đơn hàng!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Promo code apply logic (real API, like checkout page)
  const handleApplyPromo = async () => {
    setPromoError("");
    if (!promoCode.code) {
      setPromoError("Vui lòng nhập mã giảm giá.");
      setPromoApplied(false);
      setDiscount(0);
      return;
    }
    try {
      const discountID = promoCode.code;
      const { discount: discountObj, status, message } = await checkPromotionCode(discountID);
      if (status !== 200) {
        setPromoError(message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        setPromoApplied(false);
        setDiscount(0);
        return;
      }
      // Calculate discount value
      let discountValue = 0;
      if (subtotal < discountObj.minOrderAmount) {
        setPromoError(`Đơn hàng của bạn không đủ điều kiện để áp dụng mã giảm giá. Giá trị đơn hàng tối thiểu là ${discountObj.minOrderAmount.toLocaleString()} VND.`);
        setPromoApplied(false);
        setDiscount(0);
        return;
      }
      if (discountObj.usageLimit && discountObj.usedCount && discountObj.usedCount >= discountObj.usageLimit) {
        setPromoError(`Mã giảm giá đã hết lượt sử dụng.`);
        setPromoApplied(false);
        setDiscount(0);
        return;
      }
      if (discountObj.discountPercent) {
        discountValue = (discountObj.discountPercent / 100) * subtotal;
      }
      if (discountObj.maxDiscountAmount && discountValue > discountObj.maxDiscountAmount) {
        discountValue = discountObj.maxDiscountAmount;
      }
      // Save the time this discount code was applied
      setPromoApplied(true);
      setDiscount(discountValue);
      setPromoCode({
        code: promoCode.code,
        maxDiscount: discountObj.maxDiscountAmount,
        discount: discountValue,
      });
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      console.error(error);
      setPromoApplied(false);
      setDiscount(0);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-xl border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center text-green-700">Tạo Đơn Hàng (Quét Mã Vạch)</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-center">
      <Input
        value={barcode}
        onChange={e => setBarcode(e.target.value)}
        placeholder="Nhập hoặc quét mã vạch sản phẩm"
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200"
        onKeyDown={e => e.key === "Enter" && handleManualAdd()}
      />
      <Button onClick={handleManualAdd} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg">
        Thêm
      </Button>
      </div>
      {error && <div className="text-red-600 mb-3 text-center font-medium">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Họ tên khách hàng</label>
        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Họ tên khách hàng" className="rounded-lg border-gray-300" />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Số điện thoại</label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" className="rounded-lg border-gray-300" />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Địa chỉ giao hàng</label>
        <Input value="Tại cửa hàng" disabled className="rounded-lg border-gray-200 bg-gray-50" />
      </div>
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Phương thức thanh toán</label>
        <Input value="Tiền mặt" disabled className="rounded-lg border-gray-200 bg-gray-50" />
      </div>
      <div className="md:col-span-2">
        <label className="block mb-1 font-semibold text-gray-700">Ghi chú cho đơn hàng</label>
        <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho đơn hàng" className="rounded-lg border-gray-300" />
      </div>
      <div className="md:col-span-2">
        <label className="block mb-1 font-semibold text-gray-700">Mã khuyến mãi (nếu có)</label>
        <div className="flex gap-2 items-center">
        <select
          className="rounded-lg border-gray-300 flex-1 px-3 py-2"
          value={promoCode.code}
          onChange={e => setPromoCode({ ...promoCode, code: e.target.value })}
          disabled={promoApplied}
        >
          <option value="">Chọn mã khuyến mãi</option>
          {discountList && discountList.length > 0 && discountList.map((d) => (
          <option key={d.discountID} value={d.discountID}>
            {d.discountID} - {d.discountDescription} {d.discountPercent ? `(${d.discountPercent}% off)` : ''}
          </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={handleApplyPromo}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded-lg"
          disabled={promoApplied || !promoCode.code}
        >
          {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
        </Button>
        </div>
        {promoError && <div className="text-red-500 text-sm mt-1">{promoError}</div>}
        {promoApplied && discount > 0 && (
        <div className="text-green-700 text-sm mt-1">Đã giảm: {discount.toLocaleString()} VND</div>
        )}
      </div>
      <div className="md:col-span-2">
        <label className="block mb-1 font-semibold text-gray-700">Phương thức giao hàng</label>
        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
        {deliveryMethods.map(method => (
          <label key={method.deliveryID} className="flex items-center gap-3 cursor-pointer hover:bg-green-50 px-2 py-1 rounded transition">
          <input
            type="radio"
            name="deliveryMethod"
            value={method.deliveryID}
            checked={deliveryID === method.deliveryID}
            defaultChecked={method.isDefault}
            onChange={() => setDeliveryID(method.deliveryID)}
            className="accent-green-600 w-4 h-4"
          />
          <span className="font-medium text-gray-700">
            {method.name} <span className="text-gray-500">- {method.basePrice.toLocaleString()} VND</span>
          </span>
          </label>
        ))}
        </div>
      </div>
      </div>
      <div className="mb-6">
      <div className="font-bold mb-2 text-lg text-gray-700">Sản phẩm</div>
      {cart && cart.products && cart.products.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-50">
          <tr>
            <th className="p-3 font-semibold text-left">Hình ảnh</th>
            <th className="p-3 font-semibold text-left">Tên sản phẩm</th>
            <th className="p-3 font-semibold text-right">Giá</th>
            <th className="p-3 font-semibold text-right">Giá giảm</th>
            <th className="p-3 font-semibold text-center">Số lượng</th>
            <th className="p-3 font-semibold text-right">Thành tiền</th>
            <th className="p-3 font-semibold text-center">Xóa</th>
          </tr>
          </thead>
          <tbody>
          {cart.products.map(p => (
            <tr key={p.productID} className="border-b last:border-b-0 hover:bg-green-50 transition">
            <td className="p-3">
              {p.images && p.images.length > 0 ? (
              <Image width={56} height={56} src={p.images[0]} alt={p.productName} className="w-14 h-14 object-cover rounded border" />
              ) : (
              <div className="w-14 h-14 bg-gray-200 flex items-center justify-center rounded text-gray-400">No image</div>
              )}
            </td>
            <td className="p-3 font-medium text-gray-800">{p.productName}</td>
            <td className="p-3 text-right text-gray-700">{p.productPrice?.toLocaleString()} VND</td>
            <td className="p-3 text-right text-gray-700">{p.productPriceSale?.toLocaleString()} VND</td>
            <td className="p-3 text-center text-gray-700">{p.CartItem?.quantity || 0}</td>
            <td className="p-3 text-right font-semibold text-green-700">
              {((p.CartItem?.price || 0) * (p.CartItem?.quantity || 0)).toLocaleString()} VND
            </td>
            <td className="p-3 text-center">
              <button
              className="text-red-600 hover:text-white hover:bg-red-500 font-bold rounded-full px-3 py-1 border border-red-200 hover:border-red-500 transition"
              title="Xóa sản phẩm khỏi giỏ"
              onClick={() => removeFromCart(p.productID, cart.cartID)}
              >
              &#10005;
              </button>
            </td>
            </tr>
          ))}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="text-gray-500 italic">Không có sản phẩm nào trong giỏ.</div>
      )}
      </div>
      <div className="flex flex-col items-end gap-2 mb-2 w-full">
      <div className="text-base md:text-lg">Tổng số lượng: <b className="text-green-700">{totalQuantity}</b></div>
      <div className="text-base md:text-2xl">Tổng tiền: <b className="text-green-700">{totalPayment.toLocaleString()} VND</b></div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full mt-2">
      <Button
        onClick={handleSubmit}
        disabled={loading || !cart?.products?.length}
        className="w-full md:w-1/2 py-3 text-lg font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white"
      >
        Tạo đơn hàng
      </Button>
      <Button
        type="button"
        onClick={() => {
        if (!cart || !cart.products?.length) return toast.error('Không có sản phẩm để in hóa đơn!');
        const billWindow = window.open('', 'PRINT', 'height=600,width=350');
        if (!billWindow) return;
        const billHtml = `
          <html>
          <head>
          <title>Hóa đơn bán hàng</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 0; }
            .bill-container { width: 260px; margin: 0 auto; padding: 8px; }
            .bill-title { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 4px; }
            .bill-info { margin-bottom: 6px; }
            .bill-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .bill-table th, .bill-table td { border-bottom: 1px dashed #aaa; padding: 2px 0; text-align: left; font-size: 12px; }
            .bill-table th { font-weight: bold; }
            .bill-total { font-weight: bold; text-align: right; font-size: 14px; }
            .bill-discount { font-weight: bold; text-align: right; color: #2563eb; font-size: 13px; }
            .bill-footer { text-align: center; margin-top: 8px; font-size: 12px; }
          </style>
          </head>
          <body>
          <div class="bill-container">
            <div class="bill-title">HÓA ĐƠN BÁN HÀNG</div>
            <div class="bill-info">
            <div>Khách: ${fullName || '-'} | ĐT: ${phone || '-'}</div>
            <div>Ngày: ${(new Date()).toLocaleString('vi-VN')}</div>
            </div>
            <table class="bill-table">
            <thead>
              <tr>
              <th style="width: 80px;">Tên</th>
              <th style="width: 30px; text-align:center;">SL</th>
              <th style="width: 60px; text-align:right;">Đơn giá</th>
              <th style="width: 60px; text-align:right;">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              ${cart.products.map(p => `
              <tr>
                <td>${p.productName}</td>
                <td style="text-align:center;">${p.CartItem?.quantity || 0}</td>
                <td style="text-align:right;">${(p.CartItem?.price || 0).toLocaleString()}</td>
                <td style="text-align:right;">${((p.CartItem?.price || 0) * (p.CartItem?.quantity || 0)).toLocaleString()}</td>
              </tr>
              `).join('')}
            </tbody>
            </table>
            ${promoApplied && discount > 0 ? `<div class="bill-discount">Giảm giá: -${discount.toLocaleString()} VND</div>` : ''}
            <div class="bill-total">Tổng cộng: ${totalPayment.toLocaleString()} VND</div>
            <div class="bill-footer">Cảm ơn quý khách!</div>
          </div>
          <script>window.print();</script>
          </body>
          </html>
        `;
        billWindow.document.write(billHtml);
        billWindow.document.close();
        }}
        className="w-full md:w-1/2 py-3 text-lg font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
      >
        In hóa đơn
      </Button>
      </div>
    </div>
  );
}
