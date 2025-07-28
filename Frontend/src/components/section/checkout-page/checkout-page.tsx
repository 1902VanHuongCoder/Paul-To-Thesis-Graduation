"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/button-brand";
import carttotalshaptop from "@public/vectors/cart+total+shap+top.png"
import carttotalshapbot from "@public/vectors/cart+total+shap+bot.png"
import Image from "next/image";
import formatVND from "@/lib/others/format-vnd";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useCheckout } from "@/contexts/checkout-context";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import PayPalButton from "@/components/ui/button/paypal-button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import TermsAndPrivacyDialog from "../terms-and-privacy-policy/terms-and-privacy-policy";
import { fetchDistrictList, fetchProvinceList, fetchWardList } from "@/lib/address-apis";
import { generateVNPayPaymentUrl } from "@/lib/payment-apis";
import { checkPromotionCode } from "@/lib/discount-apis";
import { createNewOrder } from "@/lib/order-apis";
import { fetchDeliveryMethods } from "@/lib/delivery-apis";
import { addNewShippingAddress, getShippingAddressesByUserID } from "@/lib/shipping-address-apis";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog/dialog";
import { calculateShippingCost } from "@/lib/others/calculate-shipping-cost";

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
    address: string;
    note?: string;
};

// Shipping address type
interface ShippingAddress {
    shippingAddressID: number;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    // Router
    const router = useRouter();

    // Contexts 
    const { cart, setCart } = useShoppingCart();
    const { user } = useUser();
    const { checkoutData, setCheckoutData } = useCheckout();

    // State variables
    const [paymentMethod, setPaymentMethod] = useState(""); // Default payment method
    const [openTermsAndPolicy, setOpenTermsAndPolicy] = useState(false); // For Terms and Privacy Policy dialog
    const [termsAccepted, setTermsAccepted] = useState(false); // For terms and conditions acceptance 
    const [promoCode, setPromoCode] = useState({
        code: "",
        maxDiscount: 0,
        discount: checkoutData?.discount ? checkoutData.discount.discountValue : 0,
    }); // For promo code input and discount value

    const [delivery, setDelivery] = useState<{
        allMethods: DeliveryMethod[];
        selectMethod: DeliveryMethod;
    }>({
        allMethods: [],
        selectMethod: {} as DeliveryMethod,
    }); // For delivery methods and selected method

    const methods = useForm<CheckoutFormValues>({
        defaultValues: {
            fullName: "",
            phone: "",
            address: "",
            note: "",
        },
    }); // Form state to manage checkout form inputs

    const [deliveryCost, setDeliveryCost] = useState(0); // For delivery cost calculation

    // Shipping address state
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]); // List of user addresses
    const [selectedAddressID, setSelectedAddressID] = useState<number | null>(null); // Selected address ID
    const [openAddAddress, setOpenAddAddress] = useState(false); // Add address dialog
    const [form, setForm] = useState({
        province: "",
        district: "",
        ward: "",
        detailAddress: "",
        phone: "",
        isDefault: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provinces, setProvinces] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [districts, setDistricts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Function to handle payment with VNPay
    const payWithVnPay = async ({ orderID, amount, orderDescription, bankCode, language }: {
        orderID: string;
        amount: number;
        orderDescription: string;
        bankCode: string;
        language: string;
    }) => {
        try {
            const data = await generateVNPayPaymentUrl(
                orderID,
                amount,
                orderDescription,
                bankCode,
                language,
            );
            window.location.href = data.url;
            console.log("VNPay payment URL:", data);
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error("Đã có lỗi xảy ra trong quá trình tạo thanh toán với VNPay. Hãy thử lại!");
        }
    }

    // Function to handle checking promo code
    const handleCheckPromoCode = async () => {
        if (!promoCode.code) {
            toast.error("Vui lòng nhập mã giảm giá.");
            return;
        }

        try {
            const discountID = promoCode.code;
            const { discount, status, message } = await checkPromotionCode(discountID);

            if (status === 200) {
                toast.success(`Mã giảm giá ${discount.discountPercent}% đã được áp dụng`);
            } else {
                toast.error(message);
                return;
            }


            // Calculate discount value
            let discountValue = 0;

            if (totalPayment < discount.minOrderAmount) {
                toast.error(`Đơn hàng của bạn không đủ điều kiện để áp dụng mã giảm giá. Giá trị đơn hàng tối thiểu là ${formatVND(discount.minOrderAmount)}.`);
                return;
            }
            if (discount.usageLimit && discount.usedCount && discount.usedCount >= discount.usageLimit) {
                toast.error(`Mã giảm giá đã hết lượt sử dụng.`);
                return;
            }

            if (discount.discountPercent) {
                discountValue = (discount.discountPercent / 100) * totalPayment;
            }


            if (discount.maxDiscountAmount && discountValue > discount.maxDiscountAmount) {
                discountValue = discount.maxDiscountAmount;
            }

            setCheckoutData({
                ...checkoutData,
                discount: {
                    discountID: discount.discountID,
                    discountValue,
                }
            });
            setPromoCode({
                code: "",
                maxDiscount: discount.maxDiscountAmount,
                discount: discountValue,
            });
        } catch (error) {
            console.error("Error checking promo code:", error);
            toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
    };

    // Function to handle form submission
    const onSubmit = async (data: CheckoutFormValues) => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để đặt hàng.");
            return;
        }
        if (!termsAccepted) {
            toast.error("Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật để tiếp tục.");
            return;
        }

        if (!delivery.selectMethod.deliveryID) {
            toast.error("Vui lòng chọn phương thức giao hàng.");
            return;
        }

        const productQuantity = cart.products.reduce((total, product) => {
            return total + product.CartItem.quantity;
        }, 0);

        const orderID = `OR${1}0${productQuantity}0${(new Date()).getDate()}${(new Date()).getMonth() + 1}${(new Date()).getFullYear()}0${Math.floor(Math.random() * 10000)}`;
        const orderDescription = `${"Thanh toán đơn hàng"} ${data.fullName} ${"trên"} ${new Date().toLocaleDateString()}`;
        const bankCode = "NCB"; // Default bank code, can be changed based on user selection
        const language = 'vi'; // Default language, can be changed based on user selection
        const selectedAddress = addresses.find(addr => addr.shippingAddressID === selectedAddressID);

        const orderDataSendToServer = {
            ...checkoutData,
            orderID: orderID,
            userID: user.userID,
            fullName: data.fullName,
            totalPayment: totalPayment,
            totalQuantity: productQuantity,
            note: data.note || "",
            phone: data.phone,
            address: selectedAddress ? selectedAddress.address : "",
            paymentMethod: paymentMethod,
            deliveryID: delivery.selectMethod.deliveryID,
            cartID: cart.cartID,
            deliveryCost: deliveryCost || 0,
            status: "pending",
        };
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
            return;
        } else if (paymentMethod === "cash") {
            try {
                await createNewOrder(orderDataSendToServer);
                setCart({
                    cartID: 0,
                    totalQuantity: 0,
                    products: []
                });
                toast.success("Đặt hàng thành công!");
                router.push(`/vi/homepage/checkout/cash-return`);
            } catch (error) {
                console.error("Error creating order:", error);
                toast.error("Đặt hàng thất bại, vui lòng thử lại sau!");
            }
        }
    };

    // Fetch delivery methods on mount
    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const data = await fetchDeliveryMethods();
                setDelivery({
                    allMethods: data,
                    selectMethod: data.find((method: DeliveryMethod) => method.isDefault) || {}
                });
            } catch (error) {
                console.error("Error fetching delivery methods:", error);
            }
        }
        fetchDeliveries();
    }, [])

    // Calculate total payment including products, discounts, delivery method, and delivery cost
    const totalPayment = useMemo(() => { // Use useMemo because this calculation can be expensive and we want to avoid recalculating it on every render 
        // Calculate total price of products in the cart 
        const totalPrice = cart.products.reduce((total, product) => {
            const price = product.productPriceSale ? product.productPriceSale : product.CartItem.price;
            return total + (price * product.CartItem.quantity);
        }, 0);

        const discount = checkoutData && checkoutData.discount ? checkoutData.discount.discountValue || 0 : promoCode.discount; // Get discount value from checkout data or default to 0

        const deliveryMethod = delivery.selectMethod.basePrice || 0; // Get delivery method base price or default to 0

        return totalPrice + deliveryMethod + deliveryCost - discount; // Return total payment including products, discounts, delivery method, and delivery cost
    }, [cart.products, delivery.selectMethod.basePrice, checkoutData, deliveryCost, promoCode]);

    const fetchAddresses = useCallback(async (user: { userID: string; username: string; }) => {
        try {
            const data: ShippingAddress[] = await getShippingAddressesByUserID(user.userID);
            setAddresses(data || []);
            if (data && data.length > 0) {
                const defaultAddr = data.find((a: ShippingAddress) => a.isDefault) || data[0];
                setSelectedAddressID(defaultAddr.shippingAddressID);
                // Auto-fill form with default address
                methods.reset({
                    fullName: user.username,
                    phone: defaultAddr.phone,
                    address: defaultAddr.address,
                    note: '',
                });
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            return [];
        }
    }, [methods]);

    // Fetch user addresses on mount
    useEffect(() => {
        if (!user) return;
        fetchAddresses(user);
    }, [user, fetchAddresses]);

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const data = await fetchProvinceList();
                setProvinces(data);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        if (openAddAddress) {
            fetchProvinces();
        }
    }, [openAddAddress]);

    // Fetch districts when province changes
    useEffect(() => {
        if (!form.province) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const selected = provinces.find(p => p.name === form.province);
        if (selected) {
            const fetchDistricts = async () => {
                try {
                    const data = await fetchDistrictList(selected.code);
                    setDistricts(data);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        }
    }, [form.province, provinces]);

    // Fetch wards when district changes
    useEffect(() => {
        if (!form.district) {
            setWards([]);
            return;
        }
        const selected = districts.find(d => d.name === form.district);
        if (selected) {
            const fetchWards = async () => {
                try {
                    const data = await fetchWardList(selected.code);
                    setWards(data);
                } catch (error) {
                    console.error("Error fetching wards:", error);
                }
            };
            fetchWards();
        }
    }, [form.district, districts]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle form submission
    const handleAddNewShippingAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.userID) {
            toast.error("Bạn cần đăng nhập để thêm địa chỉ giao hàng.");
            return;
        }
        setLoading(true);
        try {
            const address = `${form.detailAddress}, ${form.ward}, ${form.district}, ${form.province}`;
            await addNewShippingAddress({
                userID: user.userID,
                address,
                phone: form.phone,
                isDefault: form.isDefault,
            });

            setForm({
                province: "",
                district: "",
                ward: "",
                detailAddress: "",
                phone: "",
                isDefault: false,
            });
            fetchAddresses(user);
            toast.success("Thêm địa chỉ giao hàng thành công!");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Update shipping cost when address or cart changes
    useEffect(() => {
        let isMounted = true;
        async function updateShippingCost() {
            if (!addresses.length || !cart.products.length) {
                setDeliveryCost(0);
                return;
            }
            setLoading(true);
            try {
                // Use default address if no address is selected
                let selectedAddr = addresses.find(a => a.shippingAddressID === selectedAddressID);
                if (!selectedAddr) {
                    selectedAddr = addresses.find(a => a.isDefault) || addresses[0];
                }
                if (!selectedAddr) {
                    setDeliveryCost(0);
                    return;
                }

                // Extract province name from address (robust for different formats)
                const addressParts = selectedAddr.address.split(",").map(s => s.trim());
                // Try to find province by last part if not found by prefix
                const provinceName = addressParts.find(part => part.startsWith("Tỉnh") || part.startsWith("Thành phố"));

                // Slice "Tinh" or "Thanh pho" prefix if exists
                const slicedProvinceName = provinceName?.replace(/^(Tỉnh|Thành phố)\s*/, "") || "";

                if (!slicedProvinceName) {
                    setDeliveryCost(0);
                    return;
                }

                // Fetch province list and get province code
                const provincesList = await fetchProvinceList();


                const foundProvince = provincesList.find((p: { name: string }) => p.name.includes(slicedProvinceName));
                if (!foundProvince) {
                    setDeliveryCost(0);
                    return;
                }

                const provinceCode = foundProvince.code;
                // Calculate shipping cost using province code
                const shippingCost = await calculateShippingCost({ code: provinceCode });
                console.log(shippingCost);
                if (isMounted) setDeliveryCost(shippingCost || 0);
            } catch (err) {
                if (isMounted) setDeliveryCost(0);
                console.error("Error calculating shipping cost:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        updateShippingCost();
        return () => { isMounted = false; };
    }, [addresses, selectedAddressID, cart.products]);

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white mt-10">
            {/* Left Column – Billing Details Form */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 uppercase text-center">THANH TOÁN</h1>
                {/* Discount Section */}
                {/* {promoCode.discount !== 0 ? "" : ( */}
                    <div className="mt-6 flex items-center mb-4">
                        <input
                            type="text"
                            placeholder={"Nhập mã giảm giá"}
                            value={promoCode.code}
                            onChange={(e) => setPromoCode({ ...promoCode, code: e.target.value })}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-tl-full rounded-bl-full focus:outline-none focus:ring-1 focus:ring-primary/10"
                        />
                        <Button onClick={handleCheckPromoCode} variant="normal" size="sm" className="shrink-0 rounded-tl-none rounded-bl-none rounded-tr-full rounded-br-full py-3.5 bg-primary text-white transition-all">
                            {"Áp dụng mã giảm giá"}
                        </Button>
                    </div>
                {/* )} */}
                {promoCode.maxDiscount > 0 && (
                    <div className="flex text-gray-700 mb-4 justify-end gap-x-2">
                        <span>
                            {"Giảm giá tối đa: "}
                        </span>
                        <span>{formatVND(promoCode.maxDiscount)} VND</span>
                    </div>
                )}
                <FormProvider {...methods}>
                    <form
                        id="checkout-form"
                        onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                        <FormItem>
                            <FormLabel className="pl-1">{
                                "Tên người dùng"
                            } <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <input
                                    {...methods.register("fullName", { required: "Vui lòng nhập tên người dùng" })}
                                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                                    placeholder={"Tên người dùng"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel className="pl-1">
                                {"Số điện thoại"}
                                <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <input
                                    {...methods.register("phone", { required: "Vui lòng nhập số điện thoại" })}
                                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                                    placeholder={"Số điện thoại"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        {/* Address selection */}
                        {user && addresses.length > 0 && (
                            <div className="mb-4 w-full">
                                <FormLabel className="pb-2 pl-1">Chọn địa chỉ giao hàng <span className="text-red-500">*</span></FormLabel>
                                <div className="flex items-center">
                                    <Select
                                        value={selectedAddressID ? String(selectedAddressID) : undefined}
                                        onValueChange={val => setSelectedAddressID(Number(val))}
                                    >
                                        <SelectTrigger className="flex-1 px-4 py-6 rounded-tl-full rounded-bl-full  border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white truncate"
                                        >
                                            <SelectValue placeholder="Chọn địa chỉ giao hàng" className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectGroup>
                                                <SelectLabel>Địa chỉ giao hàng</SelectLabel>
                                                {addresses.map(addr => (
                                                    <SelectItem key={addr.shippingAddressID} value={String(addr.shippingAddressID)} className="truncate max-w-full">
                                                        <span className="truncate block max-w-full">{addr.address} - {addr.phone} {addr.isDefault ? '(Mặc định)' : ''}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <button type="button" className="border-gray-300 border-1 rounded-tl-none rounded-bl-none rounded-tr-full rounded-br-full px-4 shrink-0 py-3 bg-gray-200 text-black hover:bg-white hover:text-primary transition-all hover:cursor-pointer" onClick={() => setOpenAddAddress(true)}>
                                        Thêm địa chỉ
                                    </button>
                                </div>
                                {/* Add Address Dialog */}
                                <Dialog open={openAddAddress} onOpenChange={setOpenAddAddress}>
                                    <DialogContent className="w-6xl">
                                        <DialogHeader>
                                            <DialogTitle>Thêm địa chỉ giao hàng mới</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={async e => {
                                            e.preventDefault();
                                            await handleAddNewShippingAddress(e);
                                        }} className="space-y-3 p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block mb-1 font-normal text-sm text-black/40">Tỉnh/Thành phố</label>
                                                    <Select
                                                        value={form.province}
                                                        onValueChange={val => setForm(f => ({ ...f, province: val, district: "", ward: "" }))}
                                                        required
                                                        disabled={provinces.length === 0}
                                                    >
                                                        <SelectTrigger className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white">
                                                            <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60">
                                                            <SelectGroup>
                                                                <SelectLabel>Tỉnh/Thành phố</SelectLabel>
                                                                {provinces.map(p => (
                                                                    <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="block mb-1 font-normal text-sm text-black/40">Quận/Huyện</label>
                                                    <Select
                                                        value={form.district}
                                                        onValueChange={val => setForm(f => ({ ...f, district: val, ward: "" }))}
                                                        required
                                                        disabled={!form.province}
                                                    >
                                                        <SelectTrigger className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white" disabled={!form.province}>
                                                            <SelectValue placeholder="Chọn quận/huyện" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60">
                                                            <SelectGroup>
                                                                <SelectLabel>Quận/Huyện</SelectLabel>
                                                                {districts.map(d => (
                                                                    <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">  <div>
                                                <label className="block mb-1 font-normal text-sm text-black/40">Phường/Xã</label>
                                                <Select
                                                    value={form.ward}
                                                    onValueChange={val => setForm(f => ({ ...f, ward: val }))}
                                                    required
                                                    disabled={!form.district}
                                                >
                                                    <SelectTrigger className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white" disabled={!form.district}>
                                                        <SelectValue placeholder="Chọn phường/xã" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        <SelectGroup>
                                                            <SelectLabel>Phường/Xã</SelectLabel>
                                                            {wards.map(w => (
                                                                <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                                <div>
                                                    <label className="block mb-1 font-normal text-sm text-black/40">Địa chỉ cụ thể</label>
                                                    <input
                                                        type="text"
                                                        name="detailAddress"
                                                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                                        value={form.detailAddress}
                                                        onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                                                        required
                                                        placeholder="Nhập số nhà, tên đường..."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1 font-normal text-sm text-black/40">Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                                    value={form.phone}
                                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                    required
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="isDefault"
                                                    id="isDefault"
                                                    checked={form.isDefault}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                                            </div>
                                            <div className="flex justify-center mt-4">
                                                <Button
                                                    type="button"
                                                    onClick={handleAddNewShippingAddress}
                                                    className=""
                                                    disabled={loading}
                                                >
                                                    {loading ? "Đang lưu..." : "Thêm địa chỉ"}
                                                </Button>
                                            </div>
                                        </form>
                                        <DialogClose asChild>
                                            <button className="absolute top-4 right-4 hover:text-gray-700 hover:cursor-pointer" aria-label="Đóng">
                                                Đóng
                                            </button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        <FormItem>
                            <FormLabel className="pl-1">{
                                "Lưu ý"
                            }</FormLabel>
                            <FormControl>
                                <textarea
                                    {...methods.register("note")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder={"Ghi chú cho đơn hàng của bạn"}
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
                    "Tóm tắt đơn hàng"
                }</h2>
                <div className="space-y-4">
                    {/* Product List */}
                    <div className="space-y-2 border-b-[1px] border-solid border-black/10 pb-4">
                        <div className="flex justify-between text-gray-700 flex-col gap-y-2">
                            {
                                cart.products.map(product => (
                                    <div key={product.productID} className="flex justify-between">
                                        <span>{product.productName} × {product.CartItem.quantity}</span>
                                        <span>{formatVND(product.productPriceSale ? product.productPriceSale * product.CartItem.quantity : product.CartItem.price * product.CartItem.quantity)} VND</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex justify-between text-gray-700 border-b-[1px] border-solid border-black/10 pb-4">
                        <span>
                            {"Giảm giá"}
                        </span>
                        {/* <span>- {checkoutData?.discount ? formatVND(checkoutdiscount.discountValue) : 0} VND</span> */}
                        <span>- {promoCode.discount !== 0 ?
                            formatVND(promoCode.discount)
                            : checkoutData?.discount ? formatVND(checkoutData.discount.discountValue) : 0
                        } VND</span>
                    </div>
                    <div className=" text-gray-700 border-b-[1px] border-solid border-black/10 pb-4">
                        <span className="flex flex-col">
                            <span className="flex items-center justify-between w-full">
                                {"Phí vận chuyển"}
                                <span>{formatVND(deliveryCost)} VND</span>
                            </span>
                            <span className="text-sm">({
                                "Tính theo khoảng cách từ kho đến địa chỉ giao hàng"
                            })</span>
                        </span>

                    </div>
                    <div className="flex justify-between text-gray-700 border-b-[1px] border-solid border-black/10 pb-4 flex-col gap-y-4">
                        <span className="text-gray-700">{
                            "Phương thức giao hàng"
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
                            {"Phương thức thanh toán"}
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
                                        // onSubmit(methods.getValues());
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
                                {"Thanh toán khi nhận hàng"}
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-between text-gray-800 font-bold border-t-[1px] border-solid border-black/10 pt-4">
                        <span>
                            {"Tổng thanh toán"}
                        </span>
                        <span>{formatVND(totalPayment)} VND</span>
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
                    {/* Place Order Button */}
                    <div className="flex justify-center">
                        {paymentMethod === "paypal" ? (
                            // showPaypal ? (
                            //     <PayPalButton amount={totalPayment} />
                            // ) : (
                            //     <Button
                            //         type="submit"
                            //         form="checkout-form"
                            //         variant="primary"
                            //         size="md"
                            //         className="mt-4"
                            //     >
                            //         {"Đặt hàng"}
                            //     </Button>
                            // )
                            <PayPalButton termIsAccepted={termsAccepted} submitForm={() => { onSubmit(methods.getValues()) }} amount={totalPayment} />
                        ) : (
                            <Button
                                type="submit"
                                form="checkout-form"
                                variant="primary"
                                size="md"
                                className="mt-4"
                            >
                                {"Đặt hàng"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <TermsAndPrivacyDialog open={openTermsAndPolicy} setOpen={setOpenTermsAndPolicy} />
        </div>
    );
}
