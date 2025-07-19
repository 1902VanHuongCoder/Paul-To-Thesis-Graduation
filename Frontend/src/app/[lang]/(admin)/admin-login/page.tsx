"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import { useUser } from "@/contexts/user-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Đăng nhập thất bại.");
        return;
      }
      if (data.user.role !== "adm") {
        setErrorMsg("Chỉ quản trị viên mới được truy cập trang này.");
        return;
      }
      // Store user in context
      setUser({
        userID: data.user.userID,
        username: data.user.username,
        email: data.user.email,
        avatar: data.user.avatar,
        token: data.token,
        // role: data.user.role,
      });
      // Optionally store in localStorage
      localStorage.setItem("user", JSON.stringify({
        userID: data.user.userID,
        username: data.user.username,
        email: data.user.email,
        avatar: data.user.avatar,
        token: data.token,
        role: data.user.role,
      }));
      router.push("/vi/dashboard");
    } catch (err) {
      setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại sau");
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center">Đăng nhập Quản trị viên</h1>
        <Input
          type="email"
          placeholder="Email quản trị viên"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
        <div className="flex justify-center">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-fit disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          </div>
      </form>
    </div>
  );
}
