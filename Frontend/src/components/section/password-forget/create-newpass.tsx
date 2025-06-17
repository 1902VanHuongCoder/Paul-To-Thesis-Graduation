"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import toast from "react-hot-toast";
import { useLoading } from "@/contexts/loading-context";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateNewPassword({ open, setOpen, email }: { open: boolean; setOpen: (open: boolean) => void, email?: string }) {
    const [userID, setUserID] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<"code" | "password" | "done">("code");
    const { loading, setLoading } = useLoading();
    const [errorMsg, setErrorMsg] = useState("");

    // For 6 input fields for code
    const [codeArr, setCodeArr] = useState(["", "", "", "", "", ""]);
    const codeInputs = [0, 1, 2, 3, 4, 5];
    const codeRefs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());

    // Show/hide password state
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Helper to handle input change for each code field
    const handleCodeInput = (idx: number, val: string) => {
        if (!/^[0-9]?$/.test(val)) return;
        const newArr = [...codeArr];
        newArr[idx] = val;
        setCodeArr(newArr);
        setCode(newArr.join(""));
        if (val && idx < 5) {
            codeRefs[idx + 1].current?.focus();
        }
        if (!val && idx > 0) {
            codeRefs[idx - 1].current?.focus();
        }
    };

    // Step 1: Check recovery code
    const handleCheckCode = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const res = await fetch(`${baseUrl}/api/users/check-recovery-code`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code, email }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message || data.error || "Mã xác nhận không hợp lệ hoặc đã hết hạn.");
                    } else {
                        setUserID(data.userID);
                        setStep("password");
                        resolve("Mã xác nhận hợp lệ!");
                    }
                } catch (err) {
                    console.error("Error checking recovery code:", err);
                    reject(err);
                } finally {
                    setLoading(false);
                }
            }),
            {
                loading: "Đang kiểm tra mã...",
                success: <b>Mã xác nhận hợp lệ!</b>,
                error: <b>Mã xác nhận không hợp lệ hoặc đã hết hạn.</b>,
            }

        )
    };

    // Step 2: Set new password
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        if (newPassword.length < 8) {
            setErrorMsg("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("Xác nhận mật khẩu không khớp.");
            return;
        }
        toast.promise(
            fetch(`${baseUrl}/api/users/${userID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            }).then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || data.error || "Không thể đặt lại mật khẩu.");
                } else {
                    setStep("done");
                }
            }),
            {
                loading: "Đang cập nhật...",
                success: "Đặt lại mật khẩu thành công!",
                error: "Không thể đặt lại mật khẩu!",
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className=" min-w-xl p-4 ">
                <DialogHeader>
                    <DialogTitle>
                        {step === "code" && "Nhập mã xác nhận"}
                        {step === "password" && "Tạo mật khẩu mới"}
                        {step === "done" && "Đặt lại mật khẩu thành công!"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "code" && "Vui lòng nhập mã xác nhận đã gửi đến email của bạn."}
                        {step === "password" && "Vui lòng nhập mật khẩu mới cho tài khoản của bạn."}
                        {step === "done" && "Bạn có thể đăng nhập với mật khẩu mới."}
                    </DialogDescription>
                </DialogHeader>
                {step === "done" ? (
                    <div className="px-6 py-4 text-center">
                        <motion.svg
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { scale: 0, opacity: 0 },
                                visible: {
                                    scale: 1,
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 260, damping: 20 }
                                }
                            }}
                            width={100}
                            height={100}
                            viewBox="0 0 80 80"
                            className="mx-auto mb-6"
                        >
                            <motion.circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="6"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6 }}
                            />
                            <motion.path
                                d="M25 42 L37 54 L56 31"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            />
                        </motion.svg>
                        <div className="text-green-600 font-semibold mb-2 text-xl">Mật khẩu đã được thay đổi</div>
                        <div>Bạn có thể đăng nhập với mật khẩu mới.</div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button className="w-full mt-4">Đóng</Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                ) : step === "code" ? (
                    <form onSubmit={handleCheckCode} className="space-y-6">
                        <div className="flex gap-2 justify-center">
                            {codeInputs.map((_, idx) => (
                                <Input
                                    key={idx}
                                    ref={codeRefs[idx]}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="w-10 h-12 text-center text-lg font-bold border-2 border-gray-300 focus:border-primary"
                                    value={codeArr[idx]}
                                    onChange={e => handleCodeInput(idx, e.target.value.replace(/\D/g, ""))}
                                    onPaste={e => {
                                        const paste = e.clipboardData.getData("text").replace(/\D/g, "");
                                        if (paste.length === 6) {
                                            setCodeArr(paste.split(""));
                                            setCode(paste);
                                            codeRefs[5].current?.focus();
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        <Button type="submit" className="w-full cursor-pointer" disabled={code.length !== 6}>
                            {loading ? "Đang kiểm tra..." : "Xác nhận mã"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSetPassword} className="space-y-4 px-6 py-3">
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"

                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                tabIndex={-1}
                                onClick={() => setShowNewPassword(v => !v)}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"

                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword(v => !v)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                        <Button type="submit" className="w-full cursor-pointer mt-4" disabled={loading}>
                            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}