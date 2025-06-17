"use client";

import React, { useState } from "react";
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
import { Eye, EyeOff, X } from "lucide-react";
import { baseUrl } from "@/lib/base-url";
import { useUser } from "@/contexts/user-context";
import { useLoading } from "@/contexts/loading-context";
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import gglogo from "@public/images/gg+logo.png";
import Image from "next/image";
import PasswordForgetDialog from "../password-forget/password-forget";
import CreateNewPassword from "../password-forget/create-newpass";

export default function LoginForm({ open, setOpen, setOpenSignUpForm }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    setOpenSignUpForm: (open: boolean) => void;
}) {
    const { setUser } = useUser();
    const { loading, setLoading } = useLoading();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [openForgetPassword, setOpenForgetPassword] = React.useState(false);
    const [openCreateNewPass, setOpenCreateNewPass] = React.useState(false);
    const [emailToGetConfirmCode, setEmailToGetConfirmCode] = useState("");

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        if (!email || !password) {
            setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || "Đăng nhập thất bại.");
                return;
            } else {
                const userData = {
                    userID: data.user.userID,
                    username: data.user.username,
                    email: data.user.email,
                    avatar: data.user.avatar,
                    token: data.token,
                };
                setUser(userData);
                if (rememberMe) {
                    localStorage.setItem("user", JSON.stringify(userData));
                } else {
                    localStorage.removeItem("user");
                }
                toast.success("Đăng nhập thành công!");
                setOpen(false);
            }
        } catch (err) {
            setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại sau");
            console.error("Login error:", err);
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

            const now = new Date();
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = String(now.getFullYear());
            const userID = `USR${day}${month}${year}P`;

            // Send info to backend
            const res = await fetch(`${baseUrl}/api/users/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID,
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
                    userID: data.user.userID,
                    username: data.user.username,
                    email: data.user.email,
                    avatar: data.user.avatar,
                    token: data.token,
                });
                localStorage.setItem("user", JSON.stringify({
                    userID: data.user.userID,
                    username: data.user.username,
                    email: data.user.email,
                    avatar: data.user.avatar,
                    token: data.token,
                }));
            }
        } catch (error) {
            console.error("Google login error:", error);
            setErrorMsg("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger Button */}
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <Button variant="primary" size="sm">
                    Đăng nhập
                </Button>
            </DialogTrigger>

            {/* Modal Content */}
            <DialogContent className="py-8 px-8">
                <DialogHeader>
                    {/* Title & Description */}
                    <DialogTitle className="text-2xl">Đăng nhập</DialogTitle>
                    <DialogDescription>Đăng nhập vào tài khoản của bạn</DialogDescription>
                </DialogHeader>

                {/* Login Form */}
                <button className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-full px-4 hover:opacity-80 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50" onClick={handleGoogleLogin}>
                    <span><Image src={gglogo} alt="Google Logo" width={50} height={50} /></span>
                    <span>Đăng nhập bằng Google</span>
                </button>
                <p className="py-1 text-center">Hoặc</p>
                <form className="space-y-4" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div>
                        <Input
                            autoComplete="email"
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                            aria-label="Email input"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Input
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-6 pr-20 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                            aria-label="Password input"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-gray-600 text-sm">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 mr-2"
                            />
                            Ghi nhớ tôi
                        </label>
                        <PasswordForgetDialog
                            email={emailToGetConfirmCode}
                            setEmail={setEmailToGetConfirmCode}
                            open={openForgetPassword}
                            setOpen={setOpenForgetPassword}
                            setOpenCreateNewPass={setOpenCreateNewPass}
                        />
                    </div>
                    {/* Success Message */}
                    {successMsg && (
                        <p className="text-green-600 text-sm mt-2">
                            {successMsg}
                        </p>
                    )}
                    {/* Error Message */}
                    {errorMsg && (
                        <p className="text-red-600 text-sm mt-2">
                            {errorMsg}
                        </p>
                    )}

                    {/* Login Button */}
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            aria-label="Login button"
                            disabled={loading}
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </div>
                </form>

                {/* Registration Prompt */}
                <DialogFooter>
                    <p className="text-gray-600 text-center">
                        Bạn chưa có tài khoản?{" "}
                        <button
                            onClick={() => {
                                setOpen(false);
                                setOpenSignUpForm(true);
                            }}
                            className="text-green-700 font-medium hover:underline cursor-pointer"
                        >
                            Tạo tài khoản
                        </button>
                    </p>
                </DialogFooter>

                {/* Close Button */}
                <DialogClose asChild>
                    <button
                        className="absolute top-4 right-4  hover:text-gray-700"
                        aria-label="Close login modal"
                    >
                        <X />
                    </button>
                </DialogClose>
            </DialogContent>
            <CreateNewPassword email={emailToGetConfirmCode} open={openCreateNewPass} setOpen={setOpenCreateNewPass} />
        </Dialog>
    );
}