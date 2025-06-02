"use client";
import { baseUrl } from "@/lib/base-url";
import { useState } from "react";

export default function AddShippingAddressPage() {
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [isDefault, setIsDefault] = useState(true);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const res = await fetch(`${baseUrl}/api/shipping-address`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address, phone, isDefault }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Thêm địa chỉ thất bại");
            }
            setSuccessMsg("Thêm địa chỉ giao hàng thành công!");
            setAddress("");
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
                    <label className="block mb-1 font-medium">Địa chỉ</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                        placeholder="Nhập địa chỉ giao hàng"
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