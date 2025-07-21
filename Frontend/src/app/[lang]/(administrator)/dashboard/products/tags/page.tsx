"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { PencilLine, Tag, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog/dialog";
import toast from "react-hot-toast";
import { createTag, deleteTag, fetchTags, updateTag } from "@/lib/product-tag-apis";

type TagFormValues = {
  tagName: string;
};

type Tag = {
  tagID: number;
  tagName: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AddTagPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagFormValues>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteID, setPendingDeleteID] = useState<number | null>(null);

  // Fetch current tags
  const fetchTagsData = async () => {
    const data = await fetchTags();
    if (data) {
      setTags(data);
    } else {
      toast.error("Không thể tải danh sách thẻ. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchTagsData();
  }, []);

  const onSubmit = async (data: TagFormValues) => {
    const res = await createTag(data.tagName);
    if (res) {
      toast.success("Thẻ đã được thêm thành công!");
      reset();
      fetchTags();
    } else {
      toast.error("Thêm thẻ thất bại. Vui lòng thử lại.");
    }
  };

  // Delete tag
  const handleDelete = async (id: number) => {
    setPendingDeleteID(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteID == null) return;
    const res = await deleteTag(pendingDeleteID);
    if (res) {
      toast.success("Thẻ đã được xóa thành công!");
      fetchTags();
    } else {
      toast.error("Xóa thẻ thất bại. Vui lòng thử lại.");
    }
    setShowConfirm(false);
    setPendingDeleteID(null);
  };

  // Start editing
  const startEdit = (tag: Tag) => {
    setEditID(tag.tagID);
    setEditName(tag.tagName);
  };

  // Save edit
  const handleEditSave = async (id: number) => {
    const res = await updateTag(id, editName);
    if (res) {
      toast.success("Thẻ đã được cập nhật thành công!");
      setEditID(null);
      fetchTags();
    } else {
      toast.error("Cập nhật thẻ thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Thêm Thẻ Sản Phẩm</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tên thẻ</label>
          <Input {...register("tagName", { required: true })} />
          {errors.tagName && (
            <div className="text-red-500 text-sm mt-1">Tên thẻ không được phép rỗng.</div>
          )}
        </div>
        <div className="flex justify-end"><Button type="submit" className="hover:cursor-pointer">Thêm thẻ</Button></div>
      </form>
      <div className="">
        <ul className="flex flex-wrap gap-x-4">
          {tags.map(tag => (
            <li key={tag.tagID} className="flex items-center gap-2 border p-2 rounded bg-gray-50 shrink-0">
              <Tag className="w-4 h-4 text-blue-500" />
              {editID === tag.tagID ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-40"
                  />
                  <Button size="icon" variant="default" onClick={() => handleEditSave(tag.tagID)} title="Save" className="hover:cursor-pointer">
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
                  <Button size="icon" variant="outline" onClick={() => handleDelete(tag.tagID)} title="Delete" className="hover:bg-gray-200 hover:cursor-pointer">
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
            <DialogTitle>Xác nhận xóa thẻ</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa thẻ này không?</div>
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
}