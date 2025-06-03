"use client";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/base-url";
import { useEffect, useState } from "react";

export default function AddShippingAddressPage() {
    const { user } = useUser();
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [isDefault, setIsDefault] = useState(true);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Address API data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provinces, setProvinces] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [districts, setDistricts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wards, setWards] = useState<any[]>([]);

    // Fetch provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then(res => res.json())
            .then(data => setProvinces(data));
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (!province) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const selected = provinces.find(p => p.name === province);
        if (selected) {
            fetch(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts || []));
        }
    }, [province, provinces]);

    // Fetch wards when district changes
    useEffect(() => {
        if (!district) {
            setWards([]);
            return;
        }
        const selected = districts.find(d => d.name === district);
        if (selected) {
            fetch(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards || []));
        }
    }, [district, districts]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const address = `${detailAddress}, ${ward}, ${district}, ${province}`;
            const res = await fetch(`${baseUrl}/api/shipping-address`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: user?.userID, address, phone}),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Thêm địa chỉ thất bại");
            }
            setSuccessMsg("Thêm địa chỉ giao hàng thành công!");
            setDetailAddress("");
            setProvince("");
            setDistrict("");
            setWard("");
            setPhone("");
            setIsDefault(true);
        } catch (err) {
            console.error("Error adding shipping address:", err);
            setErrorMsg(
                err && typeof err === "object" && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Có lỗi xảy ra."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Thêm địa chỉ giao hàng mới</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Tỉnh/Thành phố</label>
                    <select
                        value={province}
                        onChange={e => {
                            setProvince(e.target.value);
                            setDistrict("");
                            setWard("");
                        }}
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
                        value={district}
                        onChange={e => {
                            setDistrict(e.target.value);
                            setWard("");
                        }}
                        required
                        className="w-full border rounded px-3 py-2"
                        disabled={!province}
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
                        value={ward}
                        onChange={e => setWard(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                        disabled={!district}
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
                        value={detailAddress}
                        onChange={e => setDetailAddress(e.target.value)}
                        required
                        placeholder="Nhập số nhà, tên đường..."
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Số điện thoại</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        placeholder="Nhập số điện thoại"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isDefault"
                        checked={isDefault}
                        onChange={e => setIsDefault(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : "Thêm địa chỉ"}
                </button>
                {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
                {errorMsg && <div className="text-red-600 mt-2">{errorMsg}</div>}
            </form>
        </div>
    );
}