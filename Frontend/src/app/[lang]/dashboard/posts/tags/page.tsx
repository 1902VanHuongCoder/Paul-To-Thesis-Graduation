"use client";
import React, { useState, useEffect } from "react";
import { baseUrl } from "@/lib/base-url";
import { Input } from "@/components/ui/input/input";
// import Button from "@/components/ui/button/button-brand";
import { useForm } from "react-hook-form";
import { Tag, PencilLine, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import toast from "react-hot-toast";

type TagOfNews = {
    newsTagID: number;
    tagName: string;
    createdAt?: string;
    updatedAt?: string;
};

const AddTagOfNews = () => {
    // const [tagName, setTagName] = useState("");
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<TagOfNews[]>([]);
    const [editID, setEditID] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteID, setDeleteID] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<{ tagName: string }>({ defaultValues: { tagName: "" } });

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

    const onSubmit = async (data: { tagName: string }) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagName: data.tagName }),
            });
            if (!res.ok) {
                toast.success("Thêm thẻ thất bại. Vui lòng thử lại!");
            } else {
                toast.success("Thêm tag thành công!");
                reset();
                fetchTags();
            }
        } catch (err) {
            console.error("Error adding tag:", err);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Delete tag
    // const handleDelete = async (id: number) => {
    //     if (!confirm("Bạn có chắc muốn xóa tag này?")) return;
    //     try {
    //         const res = await fetch(`${baseUrl}/api/tag-of-news/${id}`, {
    //             method: "DELETE",
    //         });
    //         if (res.ok) {
    //             setSuccessMsg("Đã xóa tag.");
    //             fetchTags();
    //         } else {
    //             setErrorMsg("Xóa tag thất bại.");
    //         }
    //     } catch {
    //         setErrorMsg("Có lỗi xảy ra khi xóa.");
    //     }
    // };

    const confirmDelete = async () => {
        if (!deleteID) return;
        try {
            const res = await fetch(`${baseUrl}/api/tag-of-news/${deleteID}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Xóa tag thành công!");
                fetchTags();
            } else {
                toast.error("Xóa tag thất bại.");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi xóa.");
        } finally {
            setShowConfirm(false);
            setDeleteID(null);
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
                toast.success("Cập nhật tag thành công!");
                setEditID(null);
                fetchTags();
            } else {
                toast.error("Cập nhật tag thất bại.");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi cập nhật.");
        }
    };

    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-4">Thêm Tag Tin Tức</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Tên thẻ</label>
                    <Input {...register("tagName", { required: true })} />
                    {errors.tagName && (
                        <div className="text-red-500 text-sm mt-1">Tên thẻ không được phép rỗng.</div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" className="hover:cursor-pointer" disabled={loading}>
                        {loading ? "Đang thêm..." : "Thêm thẻ"}
                    </Button>
                </div>
            </form>
            <hr className="my-6" />
            <div className="">
                <h2 className="text-xl font-semibold mb-2">Danh sách Thẻ Tin Tức</h2>
                <ul className="flex flex-wrap gap-x-4">
                    {tags.map(tag => (
                        <li key={tag.newsTagID} className="flex items-center gap-2 border p-2 rounded bg-gray-50 shrink-0">
                            <Tag className="w-4 h-4 text-blue-500" />
                            {editID === tag.newsTagID ? (
                                <>
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-40"
                                    />
                                    <Button size="icon" variant="default" onClick={() => handleEditSave(tag.newsTagID)} title="Save" className="hover:cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => setEditID(null)} title="Cancel" className="hover:bg-gray-200 hover:cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span>{tag.tagName}</span>
                                    <Button size="icon" variant="outline" onClick={() => startEdit(tag)} title="Edit" className="hover:bg-gray-200 hover:cursor-pointer">
                                        <PencilLine />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => { setShowConfirm(true); setDeleteID(tag.newsTagID); }} title="Delete" className="hover:bg-gray-200 hover:cursor-pointer">
                                        <Trash className="w-4 h-4 text-red-500" />
                                    </Button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa tag</DialogTitle>
                    </DialogHeader>
                    <div>Bạn có chắc chắn muốn xóa tag này không?</div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="hover:cursor-pointer">Hủy</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete} className="hover:cursor-pointer">Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddTagOfNews;