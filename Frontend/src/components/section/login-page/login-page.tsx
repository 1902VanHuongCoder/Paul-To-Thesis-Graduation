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
import { X } from "lucide-react";
import Link from "next/link";
import { baseUrl } from "@/lib/base-url";
import { useUser } from "@/contexts/user-context";

export default function LoginForm({ open, setOpen, setOpenSignUpForm }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    setOpenSignUpForm: (open: boolean) => void;
}) {
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Đăng nhập thất bại.");
            } else {
                // Save user info to context and optionally localStorage
                const userData = {
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
                // Optionally: redirect or close modal here
            }
        } catch (err) {
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger Button */}
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                <Button variant="primary" size="sm">
                    Open Login
                </Button>
            </DialogTrigger>

            {/* Modal Content */}
            <DialogContent className="py-8 px-8">
                <DialogHeader>
                    {/* Title & Description */}
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription>Sign in to your farm account!</DialogDescription>
                </DialogHeader>

                {/* Login Form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white "
                            aria-label="Email input"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <Input
                            type="password"
                            placeholder="Password *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white "
                            aria-label="Password input"
                            required
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-gray-600">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 mr-2"
                            />
                            Remember me
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-green-700 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="text-red-600 text-center">{errorMsg}</div>
                    )}

                    {/* Login Button */}
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="normal"
                            size="sm"
                            className="flex justify-center px-6 items-center bg-primary text-white hover:bg-secondary hover:border-secondary"
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
                        You not registered?{" "}
                        <button 
                            onClick={() => {
                                setOpen(false);
                                setOpenSignUpForm(true);
                            }}
                            className="text-green-700 font-medium hover:underline"
                        >
                            Create an account
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
        </Dialog>
    );
}