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
import Button from "@/components/ui/button/button-brand";
import { X } from "lucide-react";
import { baseUrl } from "@/lib/base-url";

export default function PasswordForgetDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Không thể gửi mã xác nhận.");
            } else {
                setSuccessMsg("Mã xác nhận đã được gửi tới email của bạn!");
                setCodeSent(true);
            }
        } catch (err) {
            console.error("Error sending code:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Quên mật khẩu?
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Quên mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSendCode}>
                    <div>
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {errorMsg && <div className="text-red-600 text-center">{errorMsg}</div>}
                    {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
                    <DialogFooter>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            className="w-full"
                            disabled={loading || codeSent}
                        >
                            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
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