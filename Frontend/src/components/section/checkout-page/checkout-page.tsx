"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/button-brand";
import carttotalshaptop from "@public/vectors/cart+total+shap+top.png"
import carttotalshapbot from "@public/vectors/cart+total+shap+bot.png"
import Image from "next/image";
import { baseUrl } from "@/lib/base-url";
import formatVND from "@/lib/format-vnd";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useDictionary } from "@/contexts/dictonary-context";
import { useCheckout } from "@/contexts/checkout-context";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { provinceCoordinate } from "@/lib/vietnam-province-coordinate";
import PayPalButton from "@/components/ui/button/paypal-button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";

export type RegionType = 'urban' | 'rural' | 'international' | null;
export type SpeedType = 'standard' | 'fast' | 'same_day' | null;

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

export interface Cart {
    cartID: number;
    totalQuantity: number;
    products: Product[];
}

type CheckoutFormValues = {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    note?: string;
};
export default function CheckoutPage() {
    const { cart, setCart } = useShoppingCart();
    const { user } = useUser();
    const router = useRouter();
    const { dictionary: d, lang } = useDictionary();
    const { checkoutData, setCheckoutData } = useCheckout();
    const [showPaypal, setShowPaypal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [promoCode, setPromoCode] = useState({
        code: "",
        discount: checkoutData?.discount ? checkoutData.discount.discountValue : 0,
    });

    const [delivery, setDelivery] = useState<{
        allMethods: DeliveryMethod[];
        selectMethod: Partial<DeliveryMethod>;
    }>({
        allMethods: [],
        selectMethod: {}
    });

    console.log("selectedDeliveryMethod:", delivery.selectMethod);

    const methods = useForm<CheckoutFormValues>({
        defaultValues: {
            fullName: "",
            phone: "",
            province: "",
            district: "",
            ward: "",
            detailAddress: "",
            note: "",
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provinces, setProvinces] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [districts, setDistricts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState({ selectedProvince: "", code: 1 });
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [distance, setDistance] = useState<number | null>(null);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
            const data = await res.json();
            setProvinces(data);
            console.log(data, "Provinces data fetched");
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const fetchDistricts = async () => {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinces.find(p => p.name === selectedProvince.selectedProvince)?.code}?depth=2`);
            const data = await res.json();
            setDistricts(data.districts || []);
            setWards([]);
        };
        fetchDistricts();
    }, [selectedProvince, provinces]);

    // Fetch wards when district changes
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            return;
        }
        const fetchWards = async () => {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districts.find(d => d.name === selectedDistrict)?.code}?depth=2`);
            const data = await res.json();
            setWards(data.wards || []);
        };
        fetchWards();
    }, [selectedDistrict, districts]);

    const payWithVnPay = async ({ orderID, amount, orderDescription, bankCode, language }: {
        orderID: string;
        amount: number;
        orderDescription: string;
        bankCode: string;
        language: string;
    }) => {
        try {
            const response = await fetch(`${baseUrl}/api/create-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID, amount, orderDescription, bankCode, language, orderType: "other" }),
            });

            const data = await response.json();
            if (data.url) {
                // Redirect to VNPay payment URL
                window.location.href = data.url;
            } else {
                alert(data.message || "Failed to create payment");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            alert("An error occurred. Please try again.");
        }
    }

    const handleCheckPromoCode = async () => {
        if (!promoCode.code) {
            toast.error("Vui lòng nhập mã giảm giá.");
            return;
        }
        try {
            const discountID = promoCode.code;
            const res = await fetch(`${baseUrl}/api/discount/${discountID}`);
            if (!res.ok) {
                throw new Error("Failed to fetch promo codes");
            }
            const data = await res.json();
            const discount = data.discount || data; // Support both API shapes
            const now = new Date();
            const expireDate = new Date(discount.expireDate);

            if (
                discount.isActive === false ||
                expireDate < now ||
                (discount.usageLimit && discount.usedCount >= discount.usageLimit)
            ) {
                toast.error("Mã giảm giá đã hết hạn hoặc không còn hiệu lực.");
                return;
            } else if (discount.minOrderValue && totalPayment < discount.minOrderValue) {
                toast.error(
                    `Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá. Tối thiểu là ${formatVND(
                        discount.minOrderValue
                    )} VND.`
                );
                return;
            } else {
                const discountValue = (data.discount.discountPercent || 0) / 100 * totalPayment;
                console.log("Discount Value:", formatVND(discountValue));
                toast.success("Áp dụng mã giảm giá thành công!");
                setCheckoutData({
                    ...checkoutData,
                    discount: {
                        discountID: data.discount.discountID,
                        discountValue: discountValue > data.discount.maxDiscountAmount ? data.discount.maxDiscountAmount : discountValue,
                    }
                })
                setPromoCode({
                    code: "",
                    discount: 0,
                });
            }
        } catch (error) {
            console.error("Error checking promo code:", error);
            toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
    };

    const onSubmit = async (data: CheckoutFormValues) => {
        if (!user) {
            return;
        }

        const productQuantity = cart.products.reduce((total, product) => {
            return total + product.CartItem.quantity;
        }, 0);
        const orderID = `OR${1}0${productQuantity}0${(new Date()).getDate()}${(new Date()).getMonth() + 1}${(new Date()).getFullYear()}0${Math.floor(Math.random() * 10000)}`;
        const orderDescription = `${d?.orderDescription || "Thanh toán đơn hàng"} ${data.fullName} ${d?.orderDescriptionOnWord || "trên"} ${new Date().toLocaleDateString()}`;
        const bankCode = "NCB"; // Default bank code, can be changed based on user selection
        const language = lang; // Default language, can be changed based on user selection
        const orderDataSendToServer = {
            ...checkoutData,
            orderID: orderID,
            userID: user?.userID,
            fullName: data.fullName,
            totalPayment: totalPayment,
            totalQuantity: productQuantity,
            note: data.note || "",
            phone: data.phone,
            address: `${data.detailAddress}, ${data.ward}, ${data.district}, ${data.province}`,
            paymentMethod: paymentMethod,
            deliveryID: delivery.selectMethod.deliveryID || 0,
            cartID: cart.cartID,
            deliveryCost: deliveryCost || 0,
            status: "pending", // Default status, can be changed based on business logic
        };
        console.log("Order Data to Send:", orderDataSendToServer);
        setCheckoutData(orderDataSendToServer);
        if (paymentMethod === "vn-pay") {
            localStorage.setItem("checkoutData", JSON.stringify(orderDataSendToServer));
            payWithVnPay({
                orderID,
                amount: totalPayment,
                orderDescription,
                bankCode,
                language
            });
        } else if (paymentMethod === "paypal") {
            setShowPaypal(true);
        } else if (paymentMethod === "cash") {
            await fetch(`${baseUrl}/api/order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderDataSendToServer)
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
                    router.push(`/${lang}/homepage/checkout/cash-return`); // Redirect to order success page

                }
            })
        }
    };


    useEffect(() => {
        const fetchDeliveryMethods = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/delivery`);
                if (!response.ok) {
                    throw new Error("Failed to fetch delivery methods");
                }
                const data = await response.json();
                setDelivery({
                    allMethods: data,
                    selectMethod: data.find((method: DeliveryMethod) => method.isDefault) || {}
                });
            } catch (error) {
                console.error("Error fetching delivery methods:", error);
            }
        }
        fetchDeliveryMethods();
    }, [])

    useEffect(() => {
        const calculateShippingCost = async () => {
            const origin = provinceCoordinate.find((item) => item.code === 92);
            const destination = provinceCoordinate.find((item) => item.code === selectedProvince.code);
            console.log([
                [origin?.lng, origin?.lat],
                [destination?.lng, destination?.lat]
            ])
            if (!origin || !destination) {
                console.error("Origin or destination not found");
                return;
            } else {
                await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY || ''
                    },
                    body: JSON.stringify({
                        coordinates: [
                            [origin?.lng, origin?.lat],
                            [destination?.lng, destination?.lat]
                        ],
                        profile: 'driving-car'
                    })
                }).then((res) => res.json()).then((data) => setDistance(data.features[0].properties.summary.distance / 1000)).catch((error) => {
                    console.error("Error fetching distance:", error);
                });
            }
        }
        if (selectedProvince) {
            calculateShippingCost();
        }
    }, [selectedProvince]);

    const deliveryCost = useMemo(() => {
        if (distance && distance < 10) {
            return 0;
        } else if (distance && distance > 10 && distance < 50) {
            return 30000;
        } else if (distance && distance > 50 && distance < 100) {
            return 50000;
        } else if (distance && distance > 100) {
            return 70000;
        }
        return 0;
    }, [distance]);

    const totalPayment = useMemo(() => {
        const totalPrice = cart.products.reduce((total, product) => {
            return total + (product.CartItem.price * product.CartItem.quantity);
        }, 0);
        const discount = checkoutData?.discount?.discountValue || 0;
        const deliveryMethod = delivery.selectMethod.basePrice || 0;
        return totalPrice + (discount + deliveryMethod + deliveryCost);
    }, [cart.products, delivery.selectMethod.basePrice, deliveryCost, checkoutData?.discount?.discountValue]);

    useEffect(() => {
        // If you want to clear discount on unmount or before navigation,
        // you can do it here or handle it after order placement.
        return () => {
            setCheckoutData((prev) => ({
                ...prev,
                discount: undefined, // or discount: null
            }));
        };
    }, [setCheckoutData]);

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white">
            {/* Left Column – Billing Details Form */}
            <div className="flex-1">

                <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase">{d?.checkoutPageTitle || "Thông tin giao hàng"}</h2>
                {/* Discount Section */}
                {promoCode.discount !== 0 ? "" : (
                    <div className="mt-6 flex items-center gap-4 mb-4">
                        <input
                            type="text"
                            placeholder={d?.shoppingCartPagePromoCodeInput || "Nhập mã giảm giá"}
                            value={promoCode.code}
                            onChange={(e) => setPromoCode({ ...promoCode, code: e.target.value })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/10"
                        />
                        <Button onClick={handleCheckPromoCode} variant="normal" size="sm" className="w-fit">
                            {d?.shoppingCartPageApplyCoupon || "Áp dụng mã giảm giá"}
                        </Button>
                    </div>
                )}

                <FormProvider {...methods}>
                    <form
                        id="checkout-form"
                        onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                        <FormItem>
                            <FormLabel>{
                                d?.checkoutPageFullName || "Tên người dùng"
                            } <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <input
                                    {...methods.register("fullName", { required: d?.checkoutPageFullNameRequired || "Vui lòng nhập tên người dùng" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={d?.checkoutPageFullName || "Tên người dùng"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>
                                {d?.checkoutPagePhone || "Số điện thoại"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <input
                                    {...methods.register("phone", { required: d?.checkoutPagePhoneRequired || "Vui lòng nhập số điện thoại" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={d?.checkoutPagePhone || "Số điện thoại"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>
                                {d?.checkoutPageProvince || "Tỉnh/Thành phố"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Select
                                    value={methods.watch("province")}
                                    onValueChange={val => {
                                        methods.setValue("province", val);
                                        setSelectedProvince({ selectedProvince: val, code: provinces.find(p => p.name === val)?.code || "" });
                                        setSelectedDistrict("");
                                        methods.setValue("district", "");
                                        methods.setValue("ward", "");
                                    }}
                                    disabled={provinces.length === 0}
                                >
                                    <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                        <SelectValue placeholder={d?.checkoutPageSelectProvince || "Chọn tỉnh/thành phố"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        <SelectGroup>
                                            <SelectLabel>{d?.checkoutPageProvince || "Tỉnh/Thành phố"}</SelectLabel>
                                            {provinces.map(province => (
                                                <SelectItem key={province.code} value={province.name}>{province.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>
                                {d?.checkoutPageDistrict || "Quận/Huyện"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Select
                                    value={methods.watch("district")}
                                    onValueChange={val => {
                                        methods.setValue("district", val);
                                        setSelectedDistrict(val);
                                        methods.setValue("ward", "");
                                    }}
                                    disabled={!selectedProvince.selectedProvince}
                                >
                                    <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!selectedProvince.selectedProvince}>
                                        <SelectValue placeholder={d?.checkoutPageSelectDistrict || "Vui lòng chọn quận/huyện"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        <SelectGroup>
                                            <SelectLabel>{d?.checkoutPageDistrict || "Quận/Huyện"}</SelectLabel>
                                            {districts.map(district => (
                                                <SelectItem key={district.code} value={district.name}>{district.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>
                                {d?.checkoutPageWard || "Phường/Xã"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Select
                                    value={methods.watch("ward")}
                                    onValueChange={val => methods.setValue("ward", val)}
                                    disabled={!selectedDistrict}
                                >
                                    <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!selectedDistrict}>
                                        <SelectValue placeholder={d?.checkoutPageSelectWard || "Chọn phường/xã"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        <SelectGroup>
                                            <SelectLabel>{d?.checkoutPageWard || "Phường/Xã"}</SelectLabel>
                                            {wards.map(ward => (
                                                <SelectItem key={ward.code} value={ward.name}>{ward.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>
                                {d?.checkoutPageDetailAddress || "Địa chỉ"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <input
                                    {...methods.register("detailAddress", { required: d?.checkoutPageDetailAddressRequired || "Vui lòng nhập địa chỉ cụ thể" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={d?.checkoutPageDetailAddress || "Địa chỉ cụ thể"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>{
                                d?.checkoutPageNote || "Lưu ý"
                            }</FormLabel>
                            <FormControl>
                                <textarea
                                    {...methods.register("note")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={d?.checkoutPageNotePlaceholder || "Ghi chú cho đơn hàng của bạn"}
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </form>
                </FormProvider>
            </div>

            {/* Right Column – Order Summary and Payment */}
            <div className="relative w-full md:w-1/3 bg-gray-100 py-6 px-6">
                <Image src={carttotalshaptop} alt="Cart Top Shape" className="absolute -top-2 left-0 w-full h-auto" />
                <Image src={carttotalshapbot} alt="Cart Bottom Shape" className="absolute -bottom-2 left-0 w-full h-auto" />
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-[1px] border-solid border-black/10 pb-4">{
                    d?.checkoutPageOrderSummary || "Tóm tắt đơn hàng"
                }</h2>
                <div className="space-y-4">
                    {/* Product List */}
                    <div className="space-y-2 border-b-[1px] border-solid border-black/10 pb-4">
                        <div className="flex justify-between text-gray-700 flex-col gap-y-2">
                            {
                                cart.products.map(product => (
                                    <div key={product.productID} className="flex justify-between">
                                        <span>{product.productName} × {product.CartItem.quantity}</span>
                                        <span>{formatVND(product.CartItem.price * product.CartItem.quantity)} VND</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex justify-between text-gray-700 border-b-[1px] border-solid border-black/10 pb-4">
                        <span>
                            {d?.checkoutDiscount || "Giảm giá"}
                        </span>
                        {/* <span>- {checkoutData?.discount ? formatVND(checkoutData.discount.discountValue) : 0} VND</span> */}
                        <span>- {promoCode.discount !== 0 ?
                            formatVND(promoCode.discount)
                            : checkoutData?.discount ? formatVND(checkoutData.discount.discountValue) : 0
                        }
                            VND</span>
                    </div>
                    <div className=" text-gray-700 border-b-[1px] border-solid border-black/10 pb-4">
                        <span className="flex flex-col">
                            <span className="flex items-center justify-between w-full">
                                {d?.checkoutShippingCost || "Phí vận chuyển"}
                                <span>{formatVND(deliveryCost)} VND</span>
                            </span>
                            <span className="text-sm">({
                                d?.checkoutShippingCostDescription || "Tính theo khoảng cách từ kho đến địa chỉ giao hàng"
                            })</span>
                        </span>

                    </div>
                    <div className="flex justify-between text-gray-700 border-b-[1px] border-solid border-black/10 pb-4 flex-col gap-y-4">
                        <span className="text-gray-700">{
                            d?.checkoutDeliveryMethod || "Phương thức giao hàng"
                        }</span>
                        <div className="flex flex-col gap-2">
                            {delivery.allMethods.map(method => (
                                <label key={method.deliveryID} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value={method.deliveryID}
                                        checked={delivery.selectMethod.deliveryID === method.deliveryID}
                                        onChange={() => setDelivery(prev => ({ ...prev, selectMethod: method }))}
                                    />
                                    <span>
                                        {method.name} - {formatVND(method.basePrice)} VND
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Payment Methods */}
                    <div className="flex flex-col gap-4 mt-4">
                        <span className="text-gray-700">
                            {d?.checkoutPaymentMethod || "Phương thức thanh toán"}
                        </span>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="vn-pay"
                                    checked={paymentMethod === "vn-pay"}
                                    onChange={() => setPaymentMethod("vn-pay")}
                                />
                                VNPAY
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="paypal"
                                    checked={paymentMethod === "paypal"}
                                    onChange={() => {
                                        setPaymentMethod("paypal");
                                        onSubmit(methods.getValues());
                                    }}
                                />
                                PayPal
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === "cash"}
                                    onChange={() => setPaymentMethod("cash")}
                                />
                                {d?.checkoutPaymentMethodCash || "Thanh toán khi nhận hàng"}
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold border-t-[1px] border-solid border-black/10 pt-4">
                        <span>
                            {d?.checkoutTotalPayment || "Tổng thanh toán"}
                        </span>
                        <span>{formatVND(totalPayment)} VND</span>
                    </div>



                    {/* Place Order Button */}
                    <div className="flex justify-center">
                        {paymentMethod === "paypal" ? (
                            showPaypal ? (
                                <PayPalButton amount={totalPayment} />
                            ) : (
                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    variant="primary"
                                    size="md"
                                    className="mt-4"
                                >
                                    {d?.checkoutPlaceOrder || "Đặt hàng"}
                                </Button>
                            )
                        ) : (
                            <Button
                                type="submit"
                                form="checkout-form"
                                variant="primary"
                                size="md"
                                className="mt-4"
                            >
                                {d?.checkoutPlaceOrder || "Đặt hàng"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}