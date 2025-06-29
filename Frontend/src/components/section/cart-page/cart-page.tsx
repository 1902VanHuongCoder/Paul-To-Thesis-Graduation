"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/button-brand";
import carttotalshaptop from "@public/vectors/cart+total+shap+top.png"
import carttotalshapbot from "@public/vectors/cart+total+shap+bot.png"
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useDictionary } from "@/contexts/dictonary-context";
import formatVND from "@/lib/format-vnd";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import toast from "react-hot-toast";
import { useCheckout } from "@/contexts/checkout-context";
import TermsAndPrivacyDialog from "../terms-and-privacy-policy/terms-and-privacy-policy";
import Link from "next/link";

export default function CartPage() {
    // Contexts 
    const { cart, setCart, removeFromCart, updateCart } = useShoppingCart(); // Shopping Cart Context  
    const { checkoutData, setCheckoutData } = useCheckout(); // Checkout Context
    const { dictionary: d, lang } = useDictionary(); // Dictionary Context

    // States variables
    const [openTermsAndPolicy, setOpenTermsAndPolicy] = useState(false); // Terms and Privacy Policy Dialog
    const [promoCode, setPromoCode] = useState({
        code: "",
        discount: 0,
    });
    const router = useRouter();

    // const [selectedShipping, setSelectedShipping] = useState("local");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const totalPayment = useMemo(()=> {
        const subtotal = cart.products.reduce((total, item) => {
            const price = item.productPriceSale ? item.productPriceSale : item.productPrice;
            return total + (price * (item.CartItem?.quantity || 0));
        }, 0);
        const discountValue = checkoutData?.discount?.discountValue || 0;
        return subtotal - discountValue;
    }, [cart.products, checkoutData?.discount?.discountValue]);

    const handleCheckPromoCode = async () => {
        try {
            await fetch(`${baseUrl}/api/discount/${promoCode.code}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch promo codes");
                } else {
                    return res.json();
                }
            }).then((data) => {
                toast.success("Áp dụng mã giảm giá thành công!");
                if (data.discount.isActive === false || data.discount.expireDate < new Date().toISOString() || data.discount.usedCount >= data.discount.usageLimit) {
                    toast.error("Mã giảm giá đã hết hạn hoặc không còn hiệu lực.");
                    return;
                } else if (data.discount.minOrderValue && totalPayment < data.discount.minOrderValue) {
                    toast.error(`Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá. Tối thiểu là ${formatVND(data.discount.minOrderValue)} VND.`);
                    return;
                } else {
                    const discountValue = (data.discount.discountPercent || 0) / 100 * totalPayment;
                    setCheckoutData({
                        ...checkoutData,
                        discount: {
                            discountID: data.discount.discountID,
                            discountValue: discountValue > data.discount.maxDiscountAmount ? data.discount.maxDiscountAmount : discountValue,
                        }
                    })
                    setPromoCode({
                        ...promoCode,
                        discount: data.discount.discountPercent || 0 * totalPayment / 100,
                    });
                }

            })

        } catch (error) {
            console.error("Error checking promo code:", error);
            toast.error("Đã xảy ra lỗi khi kiểm tra mã giảm giá. Vui lòng thử lại sau.");
        }
    }

    const handleCheckout = () => {
        if (cart.products.length === 0) {
            alert("Giỏ hàng của bạn đang trống");
            return;
        }
        if (!termsAccepted) {
            alert("Vui lòng đồng ý với các điều khoản và điều kiện");
            return;
        }
        router.push(`/${lang}/homepage/checkout`);
    };

    const handleChangeProductQuantity = (productID: number, quantity: number) => {
        // Find the current product
        const product = cart.products.find(p => p.productID === productID);
        if (!product) {
            alert("Sản phẩm không tồn tại trong giỏ hàng");
            return;
        };
        // Prevent quantity less than 1
        if (quantity < 1) {
            alert("Số lượng sản phẩm không thể nhỏ hơn 1");
            return;
        };
        const updatedProducts = cart.products.map(p => {
            if (p.productID === productID) {
                return {
                    ...p,
                    CartItem: {
                        ...p.CartItem,
                        quantity: quantity
                    }
                };
            }
            return p;
        });
        setCart({
            ...cart,
            products: updatedProducts
        });
        updateCart(cart.cartID, productID, quantity);
    };

    // Handle remove item from cart
    const handleRemoveItem = (productID: number) => {
        const updatedProducts = cart.products.filter(p => p.productID !== productID);
        setCart({
            ...cart,
            products: updatedProducts
        });
        removeFromCart(productID, cart.cartID);
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Section – Cart Items */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase text-center">{d?.shoppingCartPageTitle || "Giỏ hàng của bạn"}</h2>
                <table className="w-full border-collapse">
                    <thead className="border-b border-[rgba(0,0,0,.2)]">
                        <tr className="text-left text-gray-600">
                            <th className="p-2 md:p-4">{
                                d?.shoppingCartPageProductName || "Tên sản phẩm"
                            }</th>
                            <th className="p-2 md:p-4">{
                                d?.shoppingCartPageProductPrice || "Giá"
                            }</th>
                            <th className="p-2 md:p-4">{
                                d?.shoppingCartPageProductQuantity || "Số lượng"
                            }</th>
                            <th className="p-2 md:p-4">{
                                d?.shoppingCartPageProductTotal || "Tổng"
                            }</th>
                            <th className="p-2 md:p-4">{
                                d?.shoppingCartPageProductAction || "Hành động"
                            }</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.products.length > 0 ? cart.products.map((item) => (
                            <tr key={item.productID} className="border-b">
                                <td className="p-2 md:p-4 flex items-center gap-4">
                                    <Image
                                        src={item.images[0]}
                                        alt={item.productName}
                                        width={60}
                                        height={60}
                                        className="rounded-md"
                                    />
                                    <span>{item.productName}</span>
                                </td>
                                <td className="p-2 md:p-4">{formatVND(item.productPriceSale ? item.productPriceSale : item.productPrice)}</td>
                                <td className="p-2 md:p-4">
                                    <div className="flex items-center w-full gap-x-2 justify-start">
                                        <button className=" rounded-sm border-1 border-primary/10 px-4 py-2" onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity - 1)}>-</button>
                                        {item?.CartItem?.quantity ? item.CartItem?.quantity : 0}
                                        <button className=" rounded-sm border-1 border-primary/10 px-4 py-2" onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity + 1)}>+</button>
                                    </div>

                                </td>
                                <td className="p-2 md:p-4">{formatVND((item.productPriceSale ? item.productPriceSale : item.productPrice) * (item.CartItem?.quantity || 0))}</td>
                                <td className="p-2 md:p-4">
                                    <Button variant="normal" size="sm" onClick={() => handleRemoveItem(item.productID)}>Remove</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-500">
                                    {d?.shoppingCartPageEmpty || "Giỏ hàng của bạn đang trống"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Discount Section */}
                <div className="mt-6 flex items-center gap-4">
                    <input
                        type="text"
                        placeholder={d?.shoppingCartPagePromoCodeInput || "Nhập mã giảm giá"}
                        value={promoCode.code}
                        onChange={(e) => setPromoCode({ ...promoCode, code: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/10"
                    />
                    <Button variant="normal" size="sm" className="w-fit" onClick={handleCheckPromoCode}>
                        {d?.shoppingCartPageApplyCoupon || "Áp dụng mã giảm giá"}
                    </Button>
                </div>
            </div>

            {/* Right Section – Order Summary */}
            <div className="relative w-full md:w-1/4 bg-gray-100 py-4 px-6">
                <Image
                    src={carttotalshaptop}
                    alt="Cart Total Top Shape"
                    width={1000}
                    height={1000}
                    className="absolute -top-2 left-0 w-full h-auto"
                />
                <Image
                    src={carttotalshapbot}
                    alt="Cart Total Bottom Shape"
                    width={1000}
                    height={1000}
                    className="absolute -bottom-2 left-0 w-full h-auto"
                />
                <h2 className="text-xl font-bold text-gray-800 mb-4">{d?.shoppingCartPageSumOrderTitle || "Tổng quan giỏ hàng"}</h2>
                <div className="space-y-4">
                    <div className="flex justify-between text-gray-700">
                        <span>{
                            d?.shoppingCartPageSumOrderSubtotal || "Tổng phụ"
                        }</span>
                        <span>
                            {formatVND(totalPayment)} VND
                        </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>
                            {
                                d?.shoppingCartPageSumOrderDiscount || "Giảm giá"
                            }
                        </span>
                        <span>- {formatVND(checkoutData?.discount?.discountValue || 0)} VND</span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold">
                        <span>{
                            d?.shoppingCartPageSumOrderTotal || "Tổng"
                        }</span>
                        <span>{formatVND(totalPayment - (checkoutData?.discount?.discountValue || 0))} VND </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">
                            <span>Đồng ý với </span><button className="font-semibold hover:underline cursor-pointer" onClick={() => setOpenTermsAndPolicy(true)}>Điều khoản và quy định</button>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 flex-col">
                        <Button
                            onClick={handleCheckout}
                            variant="primary"
                            size="md"
                            disabled={!termsAccepted}
                            className=""
                        >
                            {
                                d?.shoppingCartPageSumOrderCheckout || "Thanh toán"
                            }
                        </Button>
                        <Link
                            href={`/${lang}/homepage`}
                            className="text-sm text-green-700 underline hover:text-green-800 block text-center mt-2"
                        >
                            {
                                d?.shoppingCartPageSumOrderContinueShopping || "Tiếp tục mua sắm"
                            }
                        </Link>
                    </div>
                    <TermsAndPrivacyDialog open={openTermsAndPolicy} setOpen={setOpenTermsAndPolicy} />
                </div>
            </div>
        </div>
    );
}