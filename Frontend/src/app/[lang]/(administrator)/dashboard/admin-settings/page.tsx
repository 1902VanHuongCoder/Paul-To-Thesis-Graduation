"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import Image from "next/image";
import { deleteOneImage, uploadAvatar } from "@/lib/others/upload-images";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { checkPassword, updateUserProfile } from "@/lib/user-apis";

export default function AdminSettingsPage() {
    const { user, setUser } = useUser();
    const { dictionary: d } = useDictionary();
    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || "");
    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || "",
                email: user.email || "",
                avatar: user.avatar || "",
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setAvatarPreview(user.avatar || "");
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const confirmOldPassword = async (): Promise<boolean> => {
        setConfirmingPassword(true);
        try {
            const res = await checkPassword(form.oldPassword, user?.userID || "");
            if (!res) {
                setErrorMsg("Mật khẩu cũ không chính xác, vui lòng thử lại.");
                return false;
            }
            return true;
        } catch {
            setErrorMsg("Đã xảy ra lỗi khi xác nhận mật khẩu cũ, vui lòng thử lại.");
            return false;
        } finally {
            setConfirmingPassword(false);
        }
    };

    const validate = () => {
        if (!form.username.trim()) return "Tên người dùng không được để trống";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Email không hợp lệ";
        if (form.oldPassword !== "" || form.newPassword !== "" || form.confirmPassword !== "") {
            if (form.oldPassword.length < 8) return "Mật khẩu cũ phải từ 8 ký tự";
            if (!form.newPassword || form.newPassword.length < 8) return "Mật khẩu mới phải từ 8 ký tự";
            if (form.newPassword !== form.confirmPassword) return "Xác nhận mật khẩu mới không khớp";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        const err = validate();
        if (err) {
            setErrorMsg(err);
            return;
        }
        setSubmitting(true);
        let avatarUrl = form.avatar;
        try {
            if (avatarFile) {
                avatarUrl = await uploadAvatar(avatarFile);
                deleteOneImage(form.avatar);
            }
        } catch (error) {
            setErrorMsg("Lỗi tải ảnh đại diện");
            console.error("Error uploading avatar:", error);
            setSubmitting(false);
            return;
        }
        if (form.oldPassword && form.newPassword && form.confirmPassword) {
            const ok = await confirmOldPassword();
            if (!ok) {
                setSubmitting(false);
                return;
            }
        }
        try {
            const data = await updateUserProfile(
                form.username,
                form.email,
                avatarUrl,
                form.newPassword || null,
                user?.userID || ""
            );
            toast.success("Cập nhật thông tin thành công!");
            setUser(data.user);
            setForm(f => ({
                ...f,
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            setErrorMsg("Có lỗi xảy ra khi cập nhật thông tin, hãy thử lại!");
            console.error("Error updating user info:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-red-500">Không tìm thấy quản trị viên</div>;

    return (
        <div className="px-6 py-10">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Cập nhật thông tin quản trị viên" }]} />
            <h1 className="text-2xl font-bold mb-6 mt-6 uppercase text-center">Cập nhật hồ sơ quản trị viên</h1>
            <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg mt-10">
                <div className="w-full h-[200px] flex flex-col justify-end p-6 bg-linear-210 from-green-600 via-green-500 to-secondary">
                    <div className="flex items-center gap-x-4">
                        <div className="w-25 h-25 flex-shrink-0 bg-white rounded-full overflow-hidden">
                            {avatarPreview ? (
                                <Image
                                    width={80}
                                    height={80}
                                    src={avatarPreview || "/avatar.png"}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full text-center text-4xl flex justify-center items-center">{user.username?.[0]?.toUpperCase() || "A"}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <span className="text-5xl font-semibold text-white drop-shadow-6xl">{user.username}</span>
                            <p className="text-md text-white/80 pl-1">{user.email}</p>
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
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer bg-white hover:opacity-80 hover:bg-white"
                                >
                                    Đổi ảnh đại diện
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="block mb-1 text-gray-500 text-sm">Tên quản trị viên</label>
                        <Input
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-gray-500 text-sm">Email</label>
                        <Input
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-gray-500 text-sm">Mật khẩu cũ</label>
                            <div className="relative">
                                <Input
                                    name="oldPassword"
                                    type={showOldPassword ? "text" : "password"}
                                    value={form.oldPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                    onClick={() => setShowOldPassword(v => !v)}
                                >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-500 text-sm">Mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                    onClick={() => setShowNewPassword(v => !v)}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-500 text-sm">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {errorMsg && <div className="text-red-500">{errorMsg}</div>}
                    <div className="flex justify-end mt-8">
                        <Button
                            type="submit"
                            variant="default"
                            size="sm"
                            disabled={submitting || confirmingPassword}
                            className="text-md px-4 py-2 cursor-pointer"
                        >
                            {submitting ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
