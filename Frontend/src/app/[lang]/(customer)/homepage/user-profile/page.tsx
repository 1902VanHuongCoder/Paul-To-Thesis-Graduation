"use client";

import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";
import { addNewShippingAddress, deleteShippingAddress, getShippingAddressesByUserID, setAddressAsDefault } from "@/lib/shipping-address-apis";
import { fetchDistrictList, fetchProvinceList, fetchWardList } from "@/lib/address-apis";

interface ShippingAddress {
    shippingAddressID: number;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function UserProfilePage() {
    // Contexts 
    const { user, logout } = useUser(); // User context to get user info and logout function

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
                const data = await getShippingAddressesByUserID(user.userID);
                setShippingAddresses(data);

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
        const fetchProvinces = async () => {
            try {
                const data = await fetchProvinceList();
                setProvinces(data);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        if (showAddForm) {
            fetchProvinces();
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
        const fetchDistricts = async (provinceCode: string) => {
            try {
                const data = await fetchDistrictList(provinceCode);
                setDistricts(data);
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        if (selected) {
            fetchDistricts(selected.code);
        }
    }, [form.province, provinces]);

    // Fetch wards based on selected district
    useEffect(() => {
        if (!form.district) {
            setWards([]);
            return;
        }
        const selected = districts.find(d => d.name === form.district);
        const fetchWards = async (districtCode: string) => {
            try {
                const data = await fetchWardList(districtCode);
                setWards(data);
            } catch (error) {
                console.error("Error fetching wards:", error);
            }
        };
        if (selected) {
            fetchWards(selected.code);
        }
    }, [form.district, districts]);

    // Function to set a shopping address as default 
    const handleSetDefault = async (shippingAddressID: number) => {
        if(!user){
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
            return;
        }
        try {
            await setAddressAsDefault({
                shippingAddressID,
                userID: user.userID,
            });
            const data = shippingAddresses.map(addr => {
                if( addr.shippingAddressID === shippingAddressID) {
                    return { ...addr, isDefault: true };
                }else {
                    return { ...addr, isDefault: false };
                }
            });            
            setShippingAddresses(data); 
        } catch (error) {
            console.error("Error setting default address:", error);
            toast.error("Xay ra lỗi khi đặt địa chỉ làm mặc định.");
        }
    };

    // Function to handle adding a new address
    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Bạn cần đăng nhập để thêm địa chỉ.");
            return;
        }
        setLoadingForm(true);
        setFormMsg("");
        try {
            const address = `${form.detailAddress}, ${form.ward}, ${form.district}, ${form.province}`;
            await addNewShippingAddress({
                userID: user.userID,
                address,
                phone: form.phone,
                isDefault: form.isDefault,
            });
            setShowAddForm(false);
            setForm({
                province: "",
                district: "",
                ward: "",
                detailAddress: "",
                phone: "",
                isDefault: false,
            });
            setFormMsg("Thêm địa chỉ thành công!");
        } catch (error) {
            console.error("Error adding address:", error);
            setFormMsg(error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm địa chỉ.");
        } finally {
            setLoadingForm(false);
        }
    };

    // Function to handle deleting an address
    const handleDeleteAddress = async (shippingAddressID: number) => {
        if(!user) {
            toast.error("Bạn cần đăng nhập để xóa địa chỉ.");
            return;
        }
        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
            await deleteShippingAddress(shippingAddressID, user.userID);
            // Refetch addresses
            setLoadingAddresses(true);
            const data = await getShippingAddressesByUserID(user.userID);
            setShippingAddresses(data);
        } catch (err) {
            console.log(err);
            toast.error("Xóa địa chỉ thất bại, hãy thử lại sau.");
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
        <div className="px-6 py-10 bg-gradient-to-br from-primary/5 via-white to-primary/10 min-h-screen">
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản của bạn" }]} />
            <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-6 bg-white/80 rounded-xl shadow-lg py-10 mb-10 border border-primary/10">
                <Avatar className="size-28 border-4 border-primary/40 shadow-lg">
                {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.username} className="object-cover rounded-full w-full h-full" />
                ) : (
                    <AvatarFallback className="border border-gray-300 text-4xl bg-primary/10 text-primary font-bold">
                    {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                )}
                </Avatar>
                <div className="text-center">
                <div className="text-5xl font-extrabold text-primary drop-shadow">{user.username}</div>
                <div className="text-gray-500 text-lg">{user.email}</div>
                </div>
                <button
                className="px-8 py-3 bg-gradient-to-r from-primary to-green-500 text-white rounded-full shadow hover:scale-105 hover:from-green-500 hover:to-primary transition-all duration-200 font-semibold"
                onClick={logout}
                >
                Đăng xuất
                </button>
            </div>
            <hr className="border-t-2 border-primary/10 w-full my-8" />
            <div>
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">{showAddForm ? "Nhập thông tin địa chỉ mới" : "Danh sách địa chỉ giao hàng của bạn"}</h3>
                <button
                    className="text-primary px-6 py-2 rounded-full border border-primary shadow hover:bg-primary hover:text-white transition-all duration-150 font-semibold"
                    onClick={() => setShowAddForm(v => !v)}
                >
                    {showAddForm ? "Đóng" : "Thêm địa chỉ mới"}
                </button>
                </div>
                {showAddForm && (
                <form onSubmit={handleAddAddress} className="space-y-4 my-7 border border-primary/20 p-8 rounded-xl bg-white shadow-lg">
                    <div>
                    <label className="block mb-2 font-medium text-primary/70">Tỉnh/Thành phố</label>
                    <Select
                        value={form.province}
                        onValueChange={val => setForm(f => ({ ...f, province: val, district: "", ward: "" }))}
                        required
                        disabled={provinces.length === 0}
                    >
                        <SelectTrigger className="w-full px-4 py-4 rounded-full border border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white shadow">
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
                    <label className="block mb-2 font-medium text-primary/70">Quận/Huyện</label>
                    <Select
                        value={form.district}
                        onValueChange={val => setForm(f => ({ ...f, district: val, ward: "" }))}
                        required
                        disabled={!form.province}
                    >
                        <SelectTrigger className="w-full px-4 py-4 rounded-full border border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white shadow" disabled={!form.province}>
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
                    <label className="block mb-2 font-medium text-primary/70">Phường/Xã</label>
                    <Select
                        value={form.ward}
                        onValueChange={val => setForm(f => ({ ...f, ward: val }))}
                        required
                        disabled={!form.district}
                    >
                        <SelectTrigger className="w-full px-4 py-4 rounded-full border border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white shadow" disabled={!form.district}>
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
                    <label className="block mb-2 font-medium text-primary/70">Địa chỉ cụ thể</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-full border border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white shadow"
                        value={form.detailAddress}
                        onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                        required
                        placeholder="Nhập số nhà, tên đường..."
                    />
                    </div>
                    <div>
                    <label className="block mb-2 font-medium text-primary/70">Số điện thoại</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-full border border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white shadow"
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
                        className="mr-2 accent-primary"
                    />
                    <label htmlFor="isDefault" className="text-primary font-medium">Đặt làm địa chỉ mặc định</label>
                    </div>
                    <div className="flex justify-end">
                    <Button
                        variant="default"
                        size={"lg"}
                        type="submit"
                        className="bg-gradient-to-r from-primary to-green-500 text-white py-2 px-8 rounded-full font-semibold shadow hover:scale-105 transition-all"
                        disabled={loadingForm}
                    >
                        {loadingForm ? "Đang lưu..." : "Thêm địa chỉ"}
                    </Button>
                    </div>
                    {formMsg && <div className="text-center text-sm mt-2 text-green-600 font-semibold">{formMsg}</div>}
                </form>
                )}

                {loadingAddresses ? (
                <div className="text-center text-primary font-semibold py-8 animate-pulse">Đang tải danh sách địa chỉ...</div>
                ) : shippingAddresses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Bạn chưa có địa chỉ giao hàng nào.</div>
                ) : (
                <ul className="space-y-6">
                    {shippingAddresses.map(addr => (
                    <li
                        key={addr.shippingAddressID}
                        className={`relative bg-white p-6 rounded-xl flex flex-col justify-between items-start shadow-lg border-2 ${addr.isDefault ? "border-primary" : "border-gray-200"} hover:shadow-2xl transition-all duration-200`}
                    >
                        <div className="w-full">
                        <div className="font-semibold text-lg text-primary">{addr.address}</div>
                        <div className="text-gray-600 mt-1">SĐT: <span className="font-medium">{addr.phone}</span></div>
                        {addr.isDefault && (
                            <span className="flex items-center gap-x-2 text-green-600 absolute top-6 right-6 font-semibold">
                            <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></span>
                            <span>Mặc định</span>
                            </span>
                        )}
                        <div className="flex gap-x-3 justify-end w-full mt-4">
                            {!addr.isDefault && (
                            <button
                                className="px-4 py-2 border border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white shadow transition-all"
                                onClick={() => handleSetDefault(addr.shippingAddressID)}
                            >
                                Đặt làm mặc định
                            </button>
                            )}
                            <button
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow hover:scale-105 transition-all"
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