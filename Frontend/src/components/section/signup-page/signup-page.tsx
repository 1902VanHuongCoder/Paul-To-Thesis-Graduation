"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import Button from "../../ui/button/button-brand";
import { X } from "lucide-react";
import { baseUrl } from "@/lib/base-url";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { useUser } from "@/contexts/user-context";

// Google OAuth (you may use next-auth or your own logic)
// const GOOGLE_AUTH_URL = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || "#";

export default function SignUpForm({open, setOpen, setOpenLoginForm}: {open: boolean, setOpen: (open: boolean) => void, setOpenLoginForm: (open: boolean) => void}) {
    const {setUser } = useUser(); 
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
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
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !province || !district || !ward || !detailAddress.trim()) {
            setErrorMsg("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Mật khẩu không khớp.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role: "customer",
                    shippingAddress: {
                        address: `${detailAddress}, ${ward}, ${district}, ${province}`,
                        phone,
                        isDefault: true,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Đăng ký thất bại.");
            } else {
                setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setPhone("");
                setProvince("");
                setDistrict("");
                setWard("");
                setDetailAddress("");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Get user info from Google
            const username = user.displayName || "";
            const email = user.email || "";
            const avatar = user.photoURL || "";
            const providerID = user.uid;

            // Send info to backend
            const res = await fetch(`${baseUrl}/api/users/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    avatar,
                    providerID,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Đăng ký Google thất bại.");
            } else {
                setSuccessMsg("Đăng ký Google thành công! Vui lòng đăng nhập.");
                setUser({
                    username: data.username,
                    email: data.email,
                    avatar: data.avatar,
                    token: data.token,
                });
                localStorage.setItem("user", JSON.stringify({
                    username: data.username,
                    token: data.token,
                }));
            }
        } catch (error) {
            console.error("Google login error:", error);
            setErrorMsg("Google login failed. Please try again.");
        }
      };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <Button variant="primary" size="sm">
                    Open Sign Up
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register</DialogTitle>
                    <DialogDescription>
                        Register for a farm account to enjoy exclusive privileges!
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <Input
                            type="text"
                            placeholder="Username *"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Password *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Confirm Password *"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            placeholder="Phone *"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    {/* Address selection */}
                    <div>
                        <select
                            value={province}
                            onChange={e => {
                                setProvince(e.target.value);
                                setDistrict("");
                                setWard("");
                            }}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Chọn tỉnh/thành phố *</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={district}
                            onChange={e => {
                                setDistrict(e.target.value);
                                setWard("");
                            }}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            disabled={!province}
                        >
                            <option value="">Chọn quận/huyện *</option>
                            {districts.map(d => (
                                <option key={d.code} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={ward}
                            onChange={e => setWard(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            disabled={!district}
                        >
                            <option value="">Chọn phường/xã *</option>
                            {wards.map(w => (
                                <option key={w.code} value={w.name}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Input
                            type="text"
                            placeholder="Địa chỉ cụ thể (số nhà, tên đường...) *"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="normal"
                            size="md"
                            className="flex justify-center px-6 items-center bg-primary text-white hover:bg-secondary hover:border-secondary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>
                        <Button
                            variant="outline"
                            size="md"
                            className="flex justify-center px-6 items-center border border-gray-300"
                            type="button"
                            onClick={handleGoogleLogin}
                        >
                            Đăng ký với Google
                        </Button>
                        {errorMsg && <div className="text-red-600 text-center">{errorMsg}</div>}
                        {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
                    </div>
                </form>
                <DialogFooter>
                    <p className="text-gray-600 text-center">
                        Do you already have an account?{" "}
                        <button
                            onClick={() => {
                                setOpen(false);
                                setOpenLoginForm(true);
                            }}
                            className="text-green-700 font-medium hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </DialogFooter>
                <DialogClose asChild>
                    <button
                        className="absolute top-4 right-4  hover:text-gray-700"
                        aria-label="Close login modal"
                    >
                        <X />
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}