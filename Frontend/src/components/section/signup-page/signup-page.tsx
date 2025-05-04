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


export default function SignUpForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = () => {
        if (username.trim() && email.trim() && password.trim() && confirmPassword.trim()) {
            if (password !== confirmPassword) {
                console.error("Passwords do not match!");
                return;
            }
            console.log("Registering with:", { username, email, password });
            // Add registration logic here
        }
    };

    return (
        <Dialog>
            {/* Trigger Button */}
            <DialogTrigger asChild>
                <Button variant="primary" size="lg">
                    Open Sign Up
                </Button>
            </DialogTrigger>

            {/* Modal Content */}
            <DialogContent>
                <DialogHeader>
                    {/* Title & Description */}
                    <DialogTitle>Register</DialogTitle>
                    <DialogDescription>
                        Register for a farm account to enjoy exclusive privileges!
                    </DialogDescription>
                </DialogHeader>

                {/* Sign Up Form */}
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

                    {/* Email Input */}
                    <div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white"
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
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white"
                            aria-label="Password input"
                            required
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <Input
                            type="password"
                            placeholder="Confirm Password *"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-0 focus:bg-white"
                            aria-label="Confirm password input"
                            required
                        />
                    </div>

                    {/* Register Button */}
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="normal"
                            size="lg"
                            className="flex justify-center px-6 items-center bg-primary text-white hover:bg-secondary hover:border-secondary"
                            onClick={handleRegister}
                            aria-label="Track order button"
                        >
                            Đăng ký
                        </Button>
                    </div>

                </form>

                {/* Redirect to Login */}
                <DialogFooter>
                    <p className="text-gray-600 text-center">
                        Do you already have an account?{" "}
                        <a
                            href="/login"
                            className="text-green-700 font-medium hover:underline"
                        >
                            Login
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