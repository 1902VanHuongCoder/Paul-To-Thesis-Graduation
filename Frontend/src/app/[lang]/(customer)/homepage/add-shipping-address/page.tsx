"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/base-url";
import { Breadcrumb } from "@/components";
import Button from "@/components/ui/button/button-brand";

export default function AddShippingAddressPage() {
    const { user } = useUser();
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
    const [msg, setMsg] = useState("");

    // Fetch provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then(res => res.json())
            .then(data => setProvinces(data));
    }, []);

    // Fetch districts when province changes
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

    // Fetch wards when district changes
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
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
            setMsg("Thêm địa chỉ thành công!");
            setForm({
                province: "",
                district: "",
                ward: "",
                detailAddress: "",
                phone: "",
                isDefault: false,
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10">
            <Breadcrumb items={[
                { label: "Trang chủ", href: "/" },
                { label: "Thêm địa chỉ giao hàng" }
            ]} />
            <h1 className="text-2xl font-bold mb-6 mt-6">Thêm địa chỉ giao hàng mới</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded">
                <div>
                    <label className="block mb-1 font-medium">Tỉnh/Thành phố</label>
                    <select
                        name="province"
                        value={form.province}
                        onChange={handleChange}
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
                        name="district"
                        value={form.district}
                        onChange={handleChange}
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
                        name="ward"
                        value={form.ward}
                        onChange={handleChange}
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
                        name="detailAddress"
                        className="w-full border rounded px-3 py-2"
                        value={form.detailAddress}
                        onChange={handleChange}
                        required
                        placeholder="Nhập số nhà, tên đường..."
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        className="w-full border rounded px-3 py-2"
                        value={form.phone}
                        onChange={handleChange}
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
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : "Thêm địa chỉ"}
                </Button>
                {msg && <div className="text-center text-sm mt-2">{msg}</div>}
            </form>
        </div>
    );
}