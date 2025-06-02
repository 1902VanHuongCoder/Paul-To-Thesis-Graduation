"use client";
import React, { useState } from "react";
import { baseUrl } from "@/lib/base-url";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";

const AddTagOfNews = () => {
    const [tagName, setTagName] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagName }),
            });
            if (!res.ok) {
                const data = await res.json();
                setErrorMsg(data.message || data.error || "Thêm tag thất bại.");
            } else {
                setSuccessMsg("Thêm tag thành công!");
                setTagName("");
            }
        } catch (err) {
            console.log(err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Thêm Tag Tin Tức</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Tên tag</label>
                    <Input
                        type="text"
                        value={tagName}
                        onChange={e => setTagName(e.target.value)}
                        required
                        placeholder="Nhập tên tag"
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? "Đang thêm..." : "Thêm tag"}
                </Button>
                {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
                {errorMsg && <div className="text-red-600 mt-2">{errorMsg}</div>}
            </form>
        </div>
    );
};

export default AddTagOfNews;