"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { fetchCartByCustomerID, createShoppingCartWithBarcode, updateShoppingCartWithBarcode } from "@/lib/shopping-cart-apis";
import { baseUrl } from "@/lib/others/base-url";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Select, SelectItem } from "@/components/ui/select/select";
import { toast } from "react-toastify";

function generateOrderID(productQuantity: number) {
  const now = new Date();
  return `OR10${productQuantity}0${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}0${Math.floor(Math.random() * 10000)}`;
}

export default function AddOrderPage() {
  const { user } = useUser();
  const { cart, setCart } = useShoppingCart();
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [deliveryID, setDeliveryID] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const barcodeBuffer = useRef("");
  const bufferTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch delivery methods
  useEffect(() => {
    fetch(`${baseUrl}/api/delivery-methods`)
      .then(res => res.json())
      .then(data => setDeliveryMethods(data))
      .catch(() => setDeliveryMethods([]));
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    if (user?.userID) {
      fetchCartByCustomerID(user.userID)
        .then(data => setCart(data))
        .catch(() => setCart(null));
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
  }, [user, cart]);

  // Add product to cart by barcode
  const handleAddBarcode = useCallback(async (bc: string) => {
    if (!user) return toast.error("Bạn cần đăng nhập.");
    setError("");
    setLoading(true);
    try {
      let res;
      if (!cart) {
        res = await createShoppingCartWithBarcode(user.userID, bc, 1);
        setCart(res);
      } else {
        res = await updateShoppingCartWithBarcode(cart.cartID, res?.productID || 0, 1);
        setCart(res);
      }
      // Refetch cart to update products
      const updatedCart = await fetchCartByCustomerID(user.userID);
      setCart(updatedCart);
      setProducts(updatedCart.products || []);
      setBarcode("");
    } catch (err) {
      setError("Không tìm thấy sản phẩm với mã vạch này.");
    } finally {
      setLoading(false);
    }
  }, [user, cart, setCart]);

  // Manual add
  const handleManualAdd = () => {
    if (barcode.trim()) handleAddBarcode(barcode.trim());
  };

  // Calculate totals
  const totalQuantity = products.reduce((sum, p) => sum + (p.CartItem?.quantity || 0), 0);
  const subtotal = products.reduce((sum, p) => sum + ((p.CartItem?.price || 0) * (p.CartItem?.quantity || 0)), 0);
  // TODO: Apply promo code logic if needed
  const totalPayment = subtotal; // Add delivery cost, discount, etc. as needed

  // Submit order
  const handleSubmit = async () => {
    if (!user) return toast.error("Bạn cần đăng nhập.");
    if (!fullName || !phone) return toast.error("Vui lòng nhập đầy đủ thông tin.");
    if (!deliveryID) return toast.error("Vui lòng chọn phương thức giao hàng.");
    setLoading(true);
    try {
      const orderID = generateOrderID(totalQuantity);
      const res = await fetch(`${baseUrl}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          discount: promoCode ? { discountID: promoCode, discountValue: 0 } : undefined,
          deliveryCost: 0,
          status: "completed",
        })
      });
      if (res.ok) {
        toast.success("Tạo đơn hàng thành công!");
        setCart(null);
        setProducts([]);
        setFullName("");
        setPhone("");
        setNote("");
        setPromoCode("");
      } else {
        toast.error("Tạo đơn hàng thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tạo Đơn Hàng (Quét Mã Vạch)</h1>
      <div className="flex gap-2 mb-4">
        <Input
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          placeholder="Nhập hoặc quét mã vạch sản phẩm"
          onKeyDown={e => e.key === "Enter" && handleManualAdd()}
        />
        <Button onClick={handleManualAdd} disabled={loading}>Thêm</Button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-4">
        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Họ tên khách hàng" />
      </div>
      <div className="mb-4">
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" />
      </div>
      <div className="mb-4">
        <Input value="Tại cửa hàng" disabled />
      </div>
      <div className="mb-4">
        <Input value="Tiền mặt" disabled />
      </div>
      <div className="mb-4">
        <Select value={deliveryID?.toString() || ""} onValueChange={v => setDeliveryID(Number(v))}>
          <SelectItem value="">Chọn phương thức giao hàng</SelectItem>
          {deliveryMethods.map((d: any) => (
            <SelectItem key={d.deliveryID} value={d.deliveryID.toString()}>{d.name}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="mb-4">
        <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho đơn hàng" />
      </div>
      <div className="mb-4">
        <Input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Mã khuyến mãi (nếu có)" />
      </div>
      <div className="mb-4">
        <div className="font-semibold">Sản phẩm trong giỏ:</div>
        <ul className="list-disc ml-6">
          {products.map(p => (
            <li key={p.productID}>{p.productName} x {p.CartItem?.quantity || 0}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">Tổng số lượng: <b>{totalQuantity}</b></div>
      <div className="mb-4">Tổng tiền: <b>{totalPayment.toLocaleString()} VND</b></div>
      <Button onClick={handleSubmit} disabled={loading || !products.length}>Tạo đơn hàng</Button>
    </div>
  );
}
