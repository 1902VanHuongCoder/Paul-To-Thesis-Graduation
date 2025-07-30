"use client";

import React from "react";
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
import { Button } from "@/components/ui/button/button";
import { X } from "lucide-react";
import { baseUrl } from "@/lib/others/base-url";
import toast from "react-hot-toast";

export default function PasswordForgetDialog({ open, setOpen, email, setEmail, setOpenCreateNewPass }: { open: boolean, setOpen: (open: boolean) => void, email: string, setEmail: (email: string) => void, setOpenCreateNewPass: (open: boolean) => void }) {

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const res = await fetch(`${baseUrl}/api/users/forgot-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message || data.error || "Gửi mã xác nhận thất bại.");
                    } else {
                        resolve("Mã xác nhận đã được gửi đến email của bạn.");
                        setOpenCreateNewPass(true); // Open checking confirm code and creating new password dialog
                        setOpen(false); // Close the forget password dialog
                    }
                } catch (error) {
                    reject(error);
                }
            }),
            {
                loading: "Đang gửi mã xác nhận đến email của bạn ...",
                success: "Mã xác nhận đã được gửi thành công!",
                error: "Gửi mã xác nhận thất bại. Vui lòng thử lại sau.",
            }
        )

    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-sm text-green-700 hover:underline cursor-pointer">
                    Quên mật khẩu?
                </button>
            </DialogTrigger>
            <DialogContent className="min-w-xl">
                <DialogHeader>
                    <DialogTitle>Quên mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSendCode}
                            variant="default"
                            size="default"
                            type="button"
                            className="w-full cursor-pointer"
                            disabled={!email.trim()}
                        >
                            Gửi mã xác nhận đến email
                        </Button>
                    </DialogFooter>
                </form>
                <DialogClose asChild>
                    <button
                        className="absolute top-4 right-4 hover:text-gray-700"
                        aria-label="Đóng"
                    >
                        <X />
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}