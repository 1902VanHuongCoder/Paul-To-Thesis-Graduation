"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import Image from "next/image";
import { uploadAvatar } from "@/lib/upload-images";
import { Eye, EyeOff } from "lucide-react";

interface UserProfile {
    userID: string;
    username: string;
    email: string;
    avatar?: string;
    password: string | null;
    providerID: string | null;
}

export default function UpdateUserProfilePage() {
    const param = useSearchParams();
    const userID = param.get("userID") || "";
    const { dictionary: d } = useDictionary();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        username: "",
        email: "",
        avatar: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user info
    useEffect(() => {
        if (!userID) return;
        setLoading(true);
        fetch(`${baseUrl}/api/users/${userID}`)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched user data:", data);
                setUser(data);
                setForm(f => ({
                    ...f,
                    username: data.username || "",
                    email: data.email || "",
                    avatar: data.avatar || "",
                }));
                setAvatarPreview(data.avatar || "");
            })
            .catch(() => setErrorMsg("Không thể tải thông tin người dùng"))
            .finally(() => setLoading(false));
    }, [userID]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle avatar file change
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Confirm old password before changing password
    const confirmOldPassword = async (): Promise<boolean> => {
        setConfirmingPassword(true);
        try {
            const res = await fetch(`${baseUrl}/api/users/confirm-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID,
                    password: form.oldPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || "Xác nhận mật khẩu cũ thất bại");
                return false;
            } else {
                console.log("Success message", data.message);
            }
            alert("Mật khẩu cũ xác nhận thành công!");
            return true;
        } catch {
            setErrorMsg("Lỗi xác nhận mật khẩu cũ");
            return false;
        } finally {
            setConfirmingPassword(false);
        }
    };

    // Validate input fields
    const validate = () => {
        if (!form.username.trim()) return "Tên người dùng không được để trống";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Email không hợp lệ";
        if (showPasswordFields) {
            if (user?.password && !form.oldPassword) return "Vui lòng nhập mật khẩu cũ";
            if (!form.newPassword || form.newPassword.length < 6) return "Mật khẩu mới phải từ 6 ký tự";
            if (form.newPassword !== form.confirmPassword) return "Xác nhận mật khẩu mới không khớp";
        }
        return "";
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        const err = validate();
        if (err) {
            setErrorMsg(err);
            return;
        }
        setSubmitting(true);
        try {
            let avatarUrl = form.avatar;
            if (avatarFile) {
                avatarUrl = await uploadAvatar(avatarFile);
            }
            // If changing password, confirm old password first
            if (showPasswordFields) {
                const ok = await confirmOldPassword();
                if (!ok) {
                    setSubmitting(false);
                    return;
                }
            }
            // Update user info
            const res = await fetch(`${baseUrl}/api/users/${userID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    avatar: avatarUrl,
                    password: showPasswordFields ? form.newPassword : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || "Cập nhật thất bại");
            setSuccessMsg("Cập nhật thông tin thành công!");
            setUser(data.user);
            setForm(f => ({
                ...f,
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            setShowPasswordFields(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Update user error:", err);
            setErrorMsg(err.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải thông tin...</div>;
    if (!user) return <div className="p-8 text-center text-red-500">Không tìm thấy người dùng</div>;

    return (
        <div className="max-w-xl mx-auto py-10">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Cập nhật thông tin người dùng" }]} />

            <h1 className="text-2xl font-bold mb-6 mt-6">Cập nhật hồ sơ người dùng</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <Image
                        width={80}
                        height={80}
                        src={avatarPreview || "/avatar.png"}
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Đổi ảnh đại diện
                        </Button>
                    </div>
                </div>
                {/* Username */}
                <div>
                    <label className="block font-medium mb-1">Tên người dùng</label>
                    <Input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Email */}
                {user && !user.providerID && (
                    <div>
                        <label className="block font-medium mb-1">Email</label>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                {/* Change Password */}
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordFields(v => !v)}
                    >
                        {showPasswordFields ? "Huỷ đổi mật khẩu" : "Đổi mật khẩu"}
                    </Button>
                </div>
                {showPasswordFields && (
                    <div className="space-y-4">
                        {user.password && (
                            <div>
                                <label className="block font-medium mb-1">Mật khẩu cũ</label>
                                <div className="relative">
                                    <Input
                                        name="oldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        value={form.oldPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        tabIndex={-1}
                                        onClick={() => setShowOldPassword(v => !v)}
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block font-medium mb-1">Mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                    onClick={() => setShowNewPassword(v => !v)}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Error/Success */}
                {errorMsg && <div className="text-red-500">{errorMsg}</div>}
                {successMsg && <div className="text-green-600">{successMsg}</div>}
                {/* Submit */}
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={submitting || confirmingPassword}
                    className="w-full"
                >
                    {submitting ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
            </form>
        </div>
    );
}