"use client";
import React, { useState, useEffect } from "react";
import { baseUrl } from "@/lib/base-url";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";

type TagOfNews = {
    newsTagID: number;
    tagName: string;
    createdAt?: string;
    updatedAt?: string;
};

const AddTagOfNews = () => {
    const [tagName, setTagName] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [tags, setTags] = useState<TagOfNews[]>([]);
    const [editID, setEditID] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Fetch all tags
    const fetchTags = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news`);
            if (res.ok) {
                const data = await res.json();
                setTags(data);
            }
        } catch (err) {
            console.error("Error fetching tags:", err);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

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
                fetchTags();
            }
        } catch (err) {
            console.error("Error adding tag:", err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Delete tag
    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa tag này?")) return;
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccessMsg("Đã xóa tag.");
                fetchTags();
            } else {
                setErrorMsg("Xóa tag thất bại.");
            }
        } catch {
            setErrorMsg("Có lỗi xảy ra khi xóa.");
        }
    };

    // Start editing
    const startEdit = (tag: TagOfNews) => {
        setEditID(tag.newsTagID);
        setEditName(tag.tagName);
    };

    // Save edit
    const handleEditSave = async (id: number) => {
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagName: editName }),
            });
            if (res.ok) {
                setSuccessMsg("Cập nhật tag thành công!");
                setEditID(null);
                fetchTags();
            } else {
                setErrorMsg("Cập nhật tag thất bại.");
            }
        } catch {
            setErrorMsg("Có lỗi xảy ra khi cập nhật.");
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
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Danh sách Tag Tin Tức</h2>
                <ul className="space-y-2">
                    {tags.map(tag => (
                        <li key={tag.newsTagID} className="flex items-center gap-2">
                            {editID === tag.newsTagID ? (
                                <>
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-40"
                                    />
                                    <Button size="sm" onClick={() => handleEditSave(tag.newsTagID)}>Lưu</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditID(null)}>Hủy</Button>
                                </>
                            ) : (
                                <>
                                    <span>{tag.tagName}</span>
                                    <Button size="sm" variant="outline" onClick={() => startEdit(tag)}>Sửa</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(tag.newsTagID)}>Xóa</Button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AddTagOfNews;