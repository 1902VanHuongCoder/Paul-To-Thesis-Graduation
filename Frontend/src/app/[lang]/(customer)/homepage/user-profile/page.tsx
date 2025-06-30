"use client";

import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";

interface ShippingAddress {
    shippingAddressID: number;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function UserProfilePage() {
    // Contexts 
    const { user, logout } = useUser(); // User context to get user info and logout function
    const { dictionary: d } = useDictionary(); // Dictionary context to get dictionary items

    // State variables
    const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]); // List of shipping addresses
    const [loadingAddresses, setLoadingAddresses] = useState(true); // Loading state for addresses
    const [showAddForm, setShowAddForm] = useState(false); // Toggle for showing/hiding add address form
    const [form, setForm] = useState({
        province: "",
        district: "",
        ward: "",
        detailAddress: "",
        phone: "",
        isDefault: false,
    }); // Form state for adding new address

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provinces, setProvinces] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [districts, setDistricts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wards, setWards] = useState<any[]>([]);

    const [loadingForm, setLoadingForm] = useState(false); // Loading state for form submission
    const [formMsg, setFormMsg] = useState(""); // Message to show after form submission

    // Fetch user shipping addresses when component mounts or when showAddForm changes
    useEffect(() => {
        const fetchAddresses = async () => {
            // Check if user is logged in
            if (!user?.userID) return;
            try {
                const res = await fetch(`${baseUrl}/api/shipping-address/user/${user.userID}`);
                if (res.ok) {
                    const data = await res.json();
                    setShippingAddresses(data);
                } else {
                    setShippingAddresses([]);
                }

            } catch {
                setShippingAddresses([]);
            } finally {
                setLoadingAddresses(false);
            }

        };
        fetchAddresses();
    }, [user?.userID, showAddForm]);

    // Address API for add address form
    useEffect(() => {
        if (showAddForm) {
            fetch("https://provinces.open-api.vn/api/?depth=1")
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [showAddForm]);

    // Fetch districts and wards based on selected province and district
    useEffect(() => {
        if (!form.province) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const selected = provinces.find(p => p.name === form.province);
        if (selected) {
            fetch(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts || []));
        }
    }, [form.province, provinces]);

    // Fetch wards based on selected district
    useEffect(() => {
        if (!form.district) {
            setWards([]);
            return;
        }
        const selected = districts.find(d => d.name === form.district);
        if (selected) {
            fetch(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards || []));
        }
    }, [form.district, districts]);

    // Function to set a shopping address as default 
    const handleSetDefault = async (shippingAddressID: number) => {
        try {
            await fetch(`${baseUrl}/api/shipping-address/${user?.userID}/${shippingAddressID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDefault: true }),
            });
            
            // After setting default, refetch addresses
            const res = await fetch(`${baseUrl}/api/shipping-address/user/${user?.userID}`);
            const data = await res.json();
            setShippingAddresses(data); 
        } catch (error) {
            console.error("Error setting default address:", error);
            toast.error("Xay ra lỗi khi đặt địa chỉ làm mặc định.");
        }
    };

    // Function to handle adding a new address
    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingForm(true);
        setFormMsg("");
        try {
            const address = `${form.detailAddress}, ${form.ward}, ${form.district}, ${form.province}`;
            const res = await fetch(`${baseUrl}/api/shipping-address`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: user?.userID,
                    address,
                    phone: form.phone,
                    isDefault: form.isDefault,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Thêm địa chỉ thất bại");
            }
            setFormMsg("Thêm địa chỉ thành công!");
            setShowAddForm(false);
            setForm({
                province: "",
                district: "",
                ward: "",
                detailAddress: "",
                phone: "",
                isDefault: false,
            });
        } catch (error) {
            console.error("Error adding address:", error);
            setFormMsg(error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm địa chỉ.");
        } finally {
            setLoadingForm(false);
        }
    };

    // Function to handle deleting an address
    const handleDeleteAddress = async (shippingAddressID: number) => {
        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
            const res = await fetch(`${baseUrl}/api/shipping-address/${user?.userID}/${shippingAddressID}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Xóa địa chỉ thất bại");
            }
            
            // Refetch addresses
            setLoadingAddresses(true);
            const data = await fetch(`${baseUrl}/api/shipping-address/user/${user?.userID}`);
            setShippingAddresses(await data.json());
        } catch (err) {
            console.log(err);
        }
    }

    if (!user) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-10">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Tài khoản của bạn" }]} />
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="size-24 border-2 border-primary/30">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.username} className="object-cover border-[2px] border-primary"/>
                        ) : (
                            <AvatarFallback className="border-[1px] border-gray-300 text-3xl">
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                   <div className="text-center">
                        <div className="text-5xl font-bold">{user.username}</div>
                        <div className="text-gray-500 text-lg">{user.email}</div>
                   </div>
                    <button
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition cursor-pointer"
                        onClick={logout}
                    >
                        Đăng xuất
                    </button>
                </div>
                <hr className="border-[1px] border-gray-100 w-full my-8" />
                <div className="">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{showAddForm ? "Nhập thông tin địa chỉ mới" : "Danh sách địa chỉ giao hàng của bạn"}</h3>
                        <button
                            className=" text-primary px-4 py-2 rounded border-1 border-primary  hover:bg-primary hover:text-white transition cursor-pointer"
                            onClick={() => setShowAddForm(v => !v)}
                        >
                            {showAddForm ? "Đóng" : "Thêm địa chỉ mới"}
                        </button>
                    </div>
                    {showAddForm && (
                        <form onSubmit={handleAddAddress} className="space-y-3 my-7 border-[1px] border-gray-200 p-6 rounded-lg bg-white">
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
                            <div>
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
                                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                    value={form.detailAddress}
                                    onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                                    required
                                    placeholder="Nhập số nhà, tên đường..."
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-normal text-sm text-black/40">Số điện thoại</label>
                                <input
                                    type="text"
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
                                    id="isDefault"
                                    checked={form.isDefault}
                                    onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                                    className="mr-2"
                                />
                                <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="default"
                                    size={"lg"}
                                    type="submit"
                                    className="bg-primary text-white py-2 rounded font-semibold hover:bg-green-700 transition cursor-pointer"
                                    disabled={loadingForm}
                                >
                                    {loadingForm ? "Đang lưu..." : "Thêm địa chỉ"}
                                </Button>
                            </div>
                            {formMsg && <div className="text-center text-sm mt-2">{formMsg}</div>}
                        </form>
                    )}

                    {loadingAddresses ? (
                        <div>Đang tải danh sách địa chỉ...</div>
                    ) : shippingAddresses.length === 0 ? (
                        <div>Bạn chưa có địa chỉ giao hàng nào.</div>
                    ) : (
                        <ul className="space-y-4">
                            {shippingAddresses.map(addr => (
                                <li
                                    key={addr.shippingAddressID}
                                    className={`relative bg-white p-4 rounded flex flex-col justify-between items-start ${addr.isDefault ? "border-primary-hover border-[1px]" : "border-gray-200 border-[1px]"} hover:shadow-xl transition shadow-gray-100`}
                                >
                                    <div className="w-full">
                                        <div className="font-medium">{addr.address}</div>
                                        <div className="text-gray-600">SĐT: {addr.phone}</div>
                                        {addr.isDefault && (
                                            <span className="flex items-center gap-x-2 text-gray-400 absolute top-5 right-5">
                                                <span className="w-[10px] h-[10px] bg-green-500 rounded-full"></span>
                                                <span>Mặc định</span>
                                            </span>
                                        )}
                                        <div className="flex gap-x-2 justify-end w-full">
                                            {!addr.isDefault && (
                                                <button
                                                    className="mt-4 px-3 py-1 border-1 border-primary hover:text-white hover:bg-primary text-primary rounded cursor-pointer transition-all"
                                                    onClick={() => handleSetDefault(addr.shippingAddressID)}
                                                >
                                                    Đặt làm mặc định
                                                </button>)}
                                            <button
                                                className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                                                onClick={() => handleDeleteAddress(addr.shippingAddressID)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}