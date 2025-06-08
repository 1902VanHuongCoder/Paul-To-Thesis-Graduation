"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
import { baseUrl } from "@/lib/base-url";
import { useSearchParams } from "next/navigation";

export default function CreateNewPassword({ onSuccess }: { userID: string | undefined; onSuccess?: () => void }) {
    const param = useSearchParams();
    const email = param.get("email") || "";
    const [userID, setUserID] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<"code" | "password" | "done">("code");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Step 1: Check recovery code
    const handleCheckCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);
        if(!email){
            alert("Email không hợp lệ. Vui lòng thử lại.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/users/check-recovery-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Mã xác nhận không hợp lệ hoặc đã hết hạn.");
            } else {
                setUserID(data.userID);
                setStep("password");
            }
        } catch (err) {
            console.error("Error checking recovery code:", err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Set new password
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (newPassword.length < 6) {
            setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("Xác nhận mật khẩu không khớp.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/${userID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || data.error || "Không thể đặt lại mật khẩu.");
            } else {
                setSuccessMsg("Đặt lại mật khẩu thành công!");
                setStep("done");
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error("Error setting new password:", err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (step === "done") {
        return (
            <div className="p-6 text-center">
                <div className="text-green-600 font-semibold mb-2">Đặt lại mật khẩu thành công!</div>
                <div>Bạn có thể đăng nhập với mật khẩu mới.</div>
            </div>
        );
    }

    return (
        <div className="max-w-sm mx-auto p-6 bg-white rounded shadow">
            {step === "code" && (
                <form onSubmit={handleCheckCode} className="space-y-4">
                    <h2 className="text-lg font-bold mb-2">Nhập mã xác nhận</h2>
                    <Input
                        type="text"
                        maxLength={6}
                        pattern="\d{6}"
                        placeholder="Nhập mã 6 số"
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                        required
                    />
                    {errorMsg && <div className="text-red-600 text-center">{errorMsg}</div>}
                    <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                        {loading ? "Đang kiểm tra..." : "Xác nhận mã"}
                    </Button>
                </form>
            )}
            {step === "password" && (
                <form onSubmit={handleSetPassword} className="space-y-4">
                    <h2 className="text-lg font-bold mb-2">Tạo mật khẩu mới</h2>
                    <Input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                    {errorMsg && <div className="text-red-600 text-center">{errorMsg}</div>}
                    {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                    </Button>
                </form>
            )}
        </div>
    );
}