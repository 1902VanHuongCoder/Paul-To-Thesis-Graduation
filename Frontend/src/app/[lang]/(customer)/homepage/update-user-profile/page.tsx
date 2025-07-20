"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { baseUrl } from "@/lib/others/base-url";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Breadcrumb, ContentLoading } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import Image from "next/image";
import { deleteOneImage, uploadAvatar } from "@/lib/others/upload-images";
import { Eye, EyeOff } from "lucide-react";
import PasswordForgetDialog from "@/components/section/password-forget/password-forget";
import CreateNewPassword from "@/components/section/password-forget/create-newpass";
import toast from "react-hot-toast";

interface UserProfile {
    userID: string;
    username: string;
    email: string;
    avatar?: string;
    password: string | null;
    providerID: string | null;
}

export default function UpdateUserProfilePage() {
    // Search params
    const param = useSearchParams();
    const userID = param.get("userID") || "";

    // Contexts 
    const { dictionary: d } = useDictionary(); // Dictionary for translations

    // State variables
    const [user, setUser] = useState<UserProfile | null>(null); // User profile data
    const [loading, setLoading] = useState(true); // Loading state for fetching user data
    const [form, setForm] = useState({
        username: "",
        email: "",
        avatar: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    }); // Form state for updating user profile
    const [avatarFile, setAvatarFile] = useState<File | null>(null); // Avatar file for upload
    const [avatarPreview, setAvatarPreview] = useState<string>(""); // Avatar preview URL
    const [errorMsg, setErrorMsg] = useState(""); // Error message state
    const [submitting, setSubmitting] = useState(false); // Submitting state for form submission
    const [confirmingPassword, setConfirmingPassword] = useState(false); // Confirming password state for old password validation
    const [showOldPassword, setShowOldPassword] = useState(false); // Show/Hide old password
    const [showNewPassword, setShowNewPassword] = useState(false); // Show/Hide new password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Show/Hide confirm password
    const fileInputRef = useRef<HTMLInputElement>(null); // Reference to file input for avatar upload

    const [emailToGetConfirmCode, setEmailToGetConfirmCode] = useState(""); // Email for password reset confirmation code
    const [openForgetPassword, setOpenForgetPassword] = useState(false); // State to control the visibility of the password forget dialog
    const [openCreateNewPass, setOpenCreateNewPass] = useState(false); // State to control the visibility of the create new password dialog

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
                setErrorMsg("Mật khẩu cũ không chính xác, vui lòng thử lại.");
                return false;
            } else {
                console.log("Success message", data.message);
            }
            return true;
        } catch {
            setErrorMsg("Đã xảy ra lỗi khi xác nhận mật khẩu cũ, vui lòng thử lại.");
            return false;
        } finally {
            setConfirmingPassword(false);
        }
    };

    // Validate input fields
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

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        const err = validate(); // Validate form inputs before submission
        if (err) {
            setErrorMsg(err);
            return;
        }
        setSubmitting(true);
        let avatarUrl = form.avatar;
        try {
            if (avatarFile) { // If a new avatar file is selected, upload it
                avatarUrl = await uploadAvatar(avatarFile);
                deleteOneImage(form.avatar); // Delete old avatar if exists
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setErrorMsg("Lỗi tải ảnh đại diện");
            setSubmitting(false);
            return;
        }
        // If changing password, confirm old password first
        if (form.oldPassword && form.newPassword && form.confirmPassword) {
            const ok = await confirmOldPassword();
            if (!ok) {
                setSubmitting(false);
                return;
            }
        }

        try {
            // Update user info
            const res = await fetch(`${baseUrl}/api/users/${userID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    avatar: avatarUrl,
                    password: form.newPassword || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.message || "Cập nhật thông tin người dùng thất bại, hãy thử lại!");
                throw new Error(data.message || data.error || "Cập nhật thất bại");
            }
            toast.success("Cập nhật thông tin thành công!");
            setUser(data.user);
            setForm(f => ({
                ...f,
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            console.error("Error updating user profile:", error);
            setErrorMsg("Có lỗi xảy ra khi cập nhật thông tin người dùng, hãy thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ContentLoading />;
    if (!user) return <div className="p-8 text-center text-red-500">Không tìm thấy người dùng</div>;

    return (
        <div className="px-6 py-10">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Cập nhật thông tin người dùng" }]} />
            <h1 className="text-2xl font-bold mb-6 mt-6 uppercase text-center">Cập nhật hồ sơ người dùng</h1>
            <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg mt-10">
                <div className="w-full h-[200px] flex flex-col justify-end p-6 bg-linear-210 from-green-600 via-green-500 to-secondary">
                    {/* Avatar */}
                    <div className="flex items-center gap-x-4">
                        <div className="w-25 h-25 flex-shrink-0 bg-white rounded-full overflow-hidden">
                            {avatarPreview ? (<Image
                                width={80}
                                height={80}
                                src={avatarPreview || "/avatar.png"}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />) : (
                                <span className="w-full h-full text-center text-4xl flex justify-center items-center">{user.username?.[0]?.toUpperCase() || "U"}</span>
                            )
                            }

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
                    {/* Username */}
                    <div>
                        <label className="block mb-1 text-gray-500 text-sm">Tên người dùng</label>
                        <Input
                            className="w-full px-4 py-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Email */}
                    {user && !user.providerID && (
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
                    )}
                    <div className="space-y-4">
                        {user.password && (
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
                                <div className="flex justify-end mt-4">
                                    <PasswordForgetDialog
                                        email={emailToGetConfirmCode}
                                        setEmail={setEmailToGetConfirmCode}
                                        open={openForgetPassword}
                                        setOpen={setOpenForgetPassword}
                                        setOpenCreateNewPass={setOpenCreateNewPass}
                                    />
                                </div>
                            </div>
                        )}

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
                    {/* )} */}
                    {/* Error/Success */}
                    {errorMsg && <div className="text-red-500">{errorMsg}</div>}
                    {/* Submit */}
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
            <CreateNewPassword email={emailToGetConfirmCode} open={openCreateNewPass} setOpen={setOpenCreateNewPass} />
        </div>
    );
}