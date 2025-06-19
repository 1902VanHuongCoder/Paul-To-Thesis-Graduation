"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
import { baseUrl } from "@/lib/base-url";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Label } from "@radix-ui/react-label";
// import toast from "react-hot-toast";

export default function AddNewUserPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [role, setRole] = useState("cus");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provinces, setProvinces] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [districts, setDistricts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wards, setWards] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

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

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !province || !district || !ward) {
            setErrorMsg("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Mật khẩu không khớp");
            return;
        }
        setLoading(true);
        try {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = String(now.getFullYear());
            // generate 4 random number
            const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
            const userID = `USR${day}${month}${year}${randomNumber}L`;
            
            const res = await fetch(`${baseUrl}/api/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID,
                    username,
                    email,
                    password,
                    role,
                    shippingAddress: {
                        address: `${detailAddress}, ${ward}, ${district}, ${province}`,
                        phone,
                        isDefault: true,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || "Đăng ký thất bại");
            } else {
                setSuccessMsg("Tạo người dùng thành công!");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setPhone("");
                setProvince("");
                setDistrict("");
                setWard("");
                setDetailAddress("");
                setRole("cus");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
            <h2 className="text-2xl font-bold mb-2">Tạo người dùng mới</h2>
            <p className="mb-6 text-gray-600">Nhập thông tin để tạo tài khoản mới cho người dùng.</p>
            <form className="space-y-4" onSubmit={handleRegister}>
                <div className="flex flex-row gap-x-4">
                    {/* Username */}
                    <div className="w-full">
                        <Label htmlFor="username" className="block mb-1 font-normal text-sm pl-1 pb-1">Tên người dùng <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="username"
                            id="username"
                            type="text"
                            placeholder="Tên người dùng"
                            value={username}
                            className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        {username && username.length < 3 && (
                            <span className="text-red-500 text-sm pl-1">Tên người dùng phải có ít nhất 3 ký tự.</span>
                        )}
                    </div>
                    {/* Email */}
                    <div className="w-full">
                        <Label htmlFor="email" className="block mb-1 font-normal text-sm pl-1 pb-1">Email <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="email"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                        />
                        {email && !/^\S+@\S+\.\S+$/.test(email) && (
                            <span className="text-red-500 text-sm pl-1">Email không hợp lệ.</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-row gap-x-4">
                    {/* Password */}
                    <div className="w-full">
                        <Label htmlFor="password" className="block mb-1 font-normal text-sm pl-1 pb-1">Mật khẩu <span className="text-red-500">*</span></Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                        />
                        {password && password.length < 6 && (
                            <span className="text-red-500 text-sm pl-1">Mật khẩu phải có ít nhất 6 ký tự.</span>
                        )}
                    </div>
                    {/* Confirm Password */}
                    <div className="w-full">
                        <Label htmlFor="confirmPassword" className="block mb-1 font-normal text-sm pl-1 pb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                        <Input
                            id="confirmPassword"
                            autoComplete="confirm-password"
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                        />
                        {confirmPassword && confirmPassword !== password && (
                            <span className="text-red-500 text-sm pl-1">Mật khẩu xác nhận không khớp.</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-row gap-x-4">
                    {/* Phone */}
                    <div className="w-full">
                        <Label htmlFor="phone" className="block mb-1 font-normal text-sm pl-1 pb-1">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="tel"
                            id="phone"
                            type="text"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                        />
                        {phone && !/^0\d{9,10}$/.test(phone) && (
                            <span className="text-red-500 text-sm pl-1">Số điện thoại không hợp lệ.</span>
                        )}
                    </div>
                    {/* Role */}
                    <div className="w-full">
                        <Label htmlFor="role" className="block mb-1 font-normal text-sm pl-1 pb-1">Vai trò <span className="text-red-500">*</span></Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="w-full pl-4 pr-3 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white">
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectGroup>
                                    <SelectLabel>Vai trò</SelectLabel>
                                    <SelectItem value="cus">Khách hàng</SelectItem>
                                    <SelectItem value="sta">Nhân viên</SelectItem>
                                    <SelectItem value="adm">Quản trị viên</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-row gap-x-4">
                    {/* Province */}
                    <div className="w-full">
                        <Label htmlFor="province" className="block mb-1 font-normal text-sm pl-1 pb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                        <Select
                            value={province}
                            onValueChange={val => {
                                setProvince(val);
                                setDistrict("");
                                setWard("");
                            }}
                        >
                            <SelectTrigger id="province" className="w-full pl-4 pr-3 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white">
                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectGroup>
                                    <SelectLabel>Tỉnh/Thành phố</SelectLabel>
                                    {provinces.map(p => (
                                        <SelectItem key={p.code} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {!province && <span className="text-red-500 text-sm pl-1">Vui lòng chọn tỉnh/thành phố</span>}
                    </div>
                    <div className="w-full">
                        <Label htmlFor="district" className="block mb-1 font-normal text-sm pl-1 pb-1">Quận/Huyện <span className="text-red-500">*</span></Label>
                        <Select
                            value={district}
                            onValueChange={val => {
                                setDistrict(val);
                                setWard("");
                            }}
                            disabled={!province}
                        >
                            <SelectTrigger id="district" className="w-full pl-4 pr-3 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white" disabled={!province}>
                                <SelectValue placeholder="Chọn quận/huyện" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectGroup>
                                    <SelectLabel>Quận/Huyện</SelectLabel>
                                    {districts.map(d => (
                                        <SelectItem key={d.code} value={d.name}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {province && !district && <span className="text-red-500 text-sm pl-1">Vui lòng chọn quận/huyện</span>}
                    </div>
                    {/* Ward */}
                    <div className="w-full">
                        <Label htmlFor="ward" className="block mb-1 font-normal text-sm pl-1 pb-1">Phường/Xã <span className="text-red-500">*</span></Label>
                        <Select
                            value={ward}
                            onValueChange={val => setWard(val)}
                            disabled={!district}
                        >
                            <SelectTrigger id="ward" className="w-full pl-4 pr-3 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white" disabled={!district}>
                                <SelectValue placeholder="Chọn phường/xã" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectGroup>
                                    <SelectLabel>Phường/Xã</SelectLabel>
                                    {wards.map(w => (
                                        <SelectItem key={w.code} value={w.name}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {district && !ward && <span className="text-red-500 text-sm pl-1">Vui lòng chọn phường/xã</span>}
                    </div>
                </div>
                {/* Detail Address */}
                <div>
                    <Label htmlFor="detailAddress" className="block mb-1 font-normal text-sm pl-1 pb-1">Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                    <Input
                        id="detailAddress"
                        type="text"
                        placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
                        value={detailAddress}
                        onChange={(e) => setDetailAddress(e.target.value)}
                        required
                        className="w-full px-4 py-5 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                    />
                    {detailAddress && detailAddress.length < 5 && (
                        <span className="text-red-500 text-sm pl-1">Địa chỉ phải có ít nhất 5 ký tự.</span>
                    )}
                </div>
                {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                {successMsg && <div className="text-green-600">{successMsg}</div>}
                <div className="flex flex-row gap-2 justify-center">
                    <Button
                        variant="normal"
                        size="md"
                        className="flex justify-center pr-4 items-center bg-primary text-white hover:bg-secondary hover:border-secondary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Đang tạo..." : "Tạo người dùng"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
