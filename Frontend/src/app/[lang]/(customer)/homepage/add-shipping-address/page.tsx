"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/base-url";
import { Breadcrumb } from "@/components";
import Button from "@/components/ui/button/button-brand";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import toast from "react-hot-toast";

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
            toast.success("Thêm địa chỉ giao hàng thành công!");
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
        <div className="px-6 py-10">
            <Breadcrumb items={[
                { label: "Trang chủ", href: "/" },
                { label: "Thêm địa chỉ giao hàng" }
            ]} />
            <h1 className="text-xl font-bold mb-6 mt-6 uppercase">Thêm địa chỉ giao hàng mới</h1>
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-3 my-7 border-[2px] border-gray-200 p-6 rounded-lg">
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
                            name="detailAddress"
                            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                            value={form.detailAddress}
                            onChange={handleChange}
                            required
                            placeholder="Nhập số nhà, tên đường..."
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-normal text-sm text-black/40">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
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
                    <div className="flex justify-center mt-4">
                        <Button
                            type="submit"
                            className=""
                            disabled={loading}
                        >
                            {loading ? "Đang lưu..." : "Thêm địa chỉ"}
                        </Button>
                    </div>
                  
                </form>
            </div>
        </div>
    );
}