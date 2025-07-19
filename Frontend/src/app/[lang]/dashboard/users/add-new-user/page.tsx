"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/input";
// import Button from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddNewUserPage() {
    // Routers
    const router = useRouter();

    // State variables
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [provinceTouched, setProvinceTouched] = useState(false);

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
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
            return;
        }
        setLoading(true);
        try {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = String(now.getFullYear());

            // generate 4 random number to create userID
            const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

            // generate userID
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
            // const data = await res.json();
            if (!res.ok) {
                toast.error("Có lỗi khi tạo người dùng. Kiểm tra kết nối và thử lại!");
            } else {
                toast.success("Tạo người dùng thành công!");
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
                router.push("/vi/dashboard/users");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            toast.error("Có lỗi xảy ra. Kiểm tra kết nối mạng và thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <h2 className="text-2xl font-bold mb-2 text-primary">Thêm Tài Khoản Người Dùng</h2>
            <p className="mb-6 text-gray-600">Nhập thông tin để tạo tài khoản mới cho người dùng.</p>
            <form className="space-y-6" onSubmit={handleRegister}>
                {/* Row 1: Username & Email */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="username" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Tên người dùng <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="username"
                            id="username"
                            type="text"
                            placeholder="Tên người dùng"
                            value={username}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={20}
                        />
                        {username && username.length < 3 && (
                            <span className="text-red-500 text-xs">Tên người dùng phải có ít nhất 3 ký tự.</span>
                        )}
                        {username && username.length > 20 && (
                            <span className="text-red-500 text-xs">Tên người dùng phải ngắn hơn 20 ký tự.</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="email" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Email <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="email"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                            <span className="text-red-500 text-xs">Email không hợp lệ.</span>
                        )}
                    </div>
                </div>
                {/* Row 2: Password & Confirm Password */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="password" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Mật khẩu <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                maxLength={20}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {password && password.length < 6 && (
                            <span className="text-red-500 text-xs">Mật khẩu phải có ít nhất 6 ký tự.</span>
                        )}
                        {password && password.length > 20 && (
                            <span className="text-red-500 text-xs">Mật khẩu phải nhỏ hơn 20 ký tự.</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="confirmPassword" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                autoComplete="new-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                            <span className="text-red-500 text-xs">Mật khẩu xác nhận không khớp.</span>
                        )}
                    </div>
                </div>
                {/* Row 3: Phone & Role */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="phone" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="tel"
                            id="phone"
                            type="text"
                            placeholder="10 số (XX XXXX XXXX)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {phone && !/^0\d{9,10}$/.test(phone) && (
                            <span className="text-red-500 text-xs">Số điện thoại không hợp lệ.</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="role" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Vai trò <span className="text-red-500">*</span></Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50">
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
                {/* Row 4: Address */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="province" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                            <Select
                                defaultValue="Cần Thơ"
                                value={province}
                                onValueChange={val => {
                                    setProvince(val);
                                    setDistrict("");
                                    setWard("");
                                    setProvinceTouched(true);
                                }}
                            >
                                <SelectTrigger
                                    id="province"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    onBlur={() => setProvinceTouched(true)}
                                >
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
                            {provinceTouched && !province && (
                                <span className="text-red-500 text-xs">Vui lòng chọn tỉnh/thành phố</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="district" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Quận/Huyện <span className="text-red-500">*</span></Label>
                            <Select
                                value={district}
                                onValueChange={val => {
                                    setDistrict(val);
                                    setWard("");
                                }}
                                disabled={!province}
                            >
                                <SelectTrigger id="district" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50" disabled={!province}>
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
                            {province && !district && <span className="text-red-500 text-xs">Vui lòng chọn quận/huyện</span>}
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="ward" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Phường/Xã <span className="text-red-500">*</span></Label>
                            <Select
                                value={ward}
                                onValueChange={val => setWard(val)}
                                disabled={!district}
                            >
                                <SelectTrigger id="ward" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50" disabled={!district}>
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
                            {district && !ward && <span className="text-red-500 text-xs">Vui lòng chọn phường/xã</span>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="detailAddress" className="block mb-1 font-medium text-sm text-gray-600 pl-0">Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                        <Input
                            autoComplete="address-line1"
                            id="detailAddress"
                            type="text"
                            placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            required
                            minLength={5}
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {detailAddress && detailAddress.length < 5 && (
                            <span className="text-red-500 text-xs">Địa chỉ phải có ít nhất 5 ký tự.</span>
                        )}
                        {detailAddress && detailAddress.length > 100 && (
                            <span className="text-red-500 text-xs">Địa chỉ phải nhỏ hơn 100 ký tự.</span>
                        )}
                    </div>
                </div>
                {errorMsg && <div className="text-red-600 font-medium text-center">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 font-medium text-center">{successMsg}</div>}
                <div className="flex flex-row gap-2 justify-end mt-4">
                    <Button
                        variant={"default"}
                        className="flex justify-center items-center bg-primary text-white hover:bg-secondary hover:border-secondary px-6 py-3 rounded-lg text-base font-semibold cursor-pointer"
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
