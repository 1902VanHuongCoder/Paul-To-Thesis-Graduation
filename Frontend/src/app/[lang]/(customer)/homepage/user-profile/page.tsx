"use client";

import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

interface ShippingAddress {
    shippingAddressID: number;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function UserProfilePage() {
    const { user, logout } = useUser();
    const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
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
    const [loadingForm, setLoadingForm] = useState(false);
    const [formMsg, setFormMsg] = useState("");
    const {dictionary: d} = useDictionary();

    useEffect(() => {
        const fetchAddresses = async () => {
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

    // Address API for add form
    useEffect(() => {
        if (showAddForm) {
            fetch("https://provinces.open-api.vn/api/?depth=1")
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [showAddForm]);

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

    const handleSetDefault = async (shippingAddressID: number) => {
        try {
            await fetch(`${baseUrl}/api/shipping-address/${user?.userID}/${shippingAddressID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDefault: true }),
            });
            setLoadingAddresses(true);
            // Refetch addresses
            const res = await fetch(`${baseUrl}/api/shipping-address/user/${user?.userID}`);
            const data = await res.json();
            setShippingAddresses(data);
        } catch {
            // handle error
        }
    };

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setFormMsg(err.message || "Có lỗi xảy ra.");
        } finally {
            setLoadingForm(false);
        }
    };

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
        <div className="max-w-xl mx-auto py-16">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Tài khoản của bạn"}]} />
            <div className="flex flex-col items-center gap-4">
                <Avatar className="size-24">
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                    ) : (
                        <AvatarFallback>
                            {user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="text-2xl font-bold">{user.username}</div>
                <div className="text-gray-500">{user.email}</div>
                <button
                    className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={logout}
                >
                    Đăng xuất
                </button>
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={() => setShowAddForm(v => !v)}
                    >
                        {showAddForm ? "Đóng" : "Thêm địa chỉ mới"}
                    </button>
                </div>
                {showAddForm && (
                    <form onSubmit={handleAddAddress} className="space-y-3 bg-gray-50 p-4 rounded mb-6">
                        <div>
                            <label className="block mb-1 font-medium">Tỉnh/Thành phố</label>
                            <select
                                value={form.province}
                                onChange={e => setForm(f => ({ ...f, province: e.target.value, district: "", ward: "" }))}
                                required
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {provinces.map(p => (
                                    <option key={p.code} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Quận/Huyện</label>
                            <select
                                value={form.district}
                                onChange={e => setForm(f => ({ ...f, district: e.target.value, ward: "" }))}
                                required
                                className="w-full border rounded px-3 py-2"
                                disabled={!form.province}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map(d => (
                                    <option key={d.code} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Phường/Xã</label>
                            <select
                                value={form.ward}
                                onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}
                                required
                                className="w-full border rounded px-3 py-2"
                                disabled={!form.district}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map(w => (
                                    <option key={w.code} value={w.name}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Địa chỉ cụ thể</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.detailAddress}
                                onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                                required
                                placeholder="Nhập số nhà, tên đường..."
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Số điện thoại</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
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
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                            disabled={loadingForm}
                        >
                            {loadingForm ? "Đang lưu..." : "Thêm địa chỉ"}
                        </button>
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
                                className={`p-4 border rounded flex justify-between items-center ${addr.isDefault ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                            >
                                <div>
                                    <div className="font-medium">{addr.address}</div>
                                    <div className="text-gray-600">SĐT: {addr.phone}</div>
                                    {addr.isDefault && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                                            Mặc định
                                        </span>
                                    )}
                                    <button
                                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleDeleteAddress(addr.shippingAddressID)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                                {!addr.isDefault && (<>
                                    <button
                                        className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        onClick={() => handleSetDefault(addr.shippingAddressID)}
                                    >
                                        Đặt làm mặc định
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleDeleteAddress(addr.shippingAddressID)}
                                    >
                                        Xóa
                                    </button></>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}