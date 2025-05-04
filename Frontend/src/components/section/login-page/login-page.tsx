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


export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => {
        if (username.trim() && password.trim()) {
            console.log("Logging in with:", { username, password, rememberMe });
            // Add login logic here
        }
    };

    return (
        <Dialog>
            {/* Trigger Button */}
            <DialogTrigger asChild>
                <Button variant="primary" size="lg">
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
                <form className="space-y-4">
                    {/* Username Input */}
                    <div>
                        <Input
                            type="text"
                            placeholder="Username *"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white "
                            aria-label="Username input"
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
                        <a
                            href="/forgot-password"
                            className="text-sm text-green-700 hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="normal"
                            size="lg"
                            className="flex justify-center px-6 items-center bg-primary text-white hover:bg-secondary hover:border-secondary"
                            onClick={handleLogin}
                            aria-label="Track order button"
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </form>

                {/* Registration Prompt */}
                <DialogFooter>
                    <p className="text-gray-600 text-center">
                        You not registered?{" "}
                        <a
                            href="/register"
                            className="text-green-700 font-medium hover:underline"
                        >
                            Create an account
                        </a>
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