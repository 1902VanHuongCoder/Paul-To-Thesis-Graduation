"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { Label } from "@radix-ui/react-label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { Pencil, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";

type CategoryFormValues = {
  categoryName: string;
  categoryDescription?: string;
};

type Category = {
  categoryID: number;
  categoryName: string;
  categoryDescription?: string;
  categorySlug: string;
  count: number;
};

export default function AddCategoryPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteID, setPendingDeleteID] = useState<number | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await fetch(`${baseUrl}/api/category`);
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const onSubmit = async (data: CategoryFormValues) => {
  
    const res = await fetch(`${baseUrl}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Thêm danh mục thành công");
      reset();
      fetchCategories();
    } else {
      toast.error("Thêm danh mục thất bại. Vui lòng thử lại.");
    }
  };

  // Delete category
  const handleDelete = (id: number) => {
    setPendingDeleteID(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteID == null) return;
    const res = await fetch(`${baseUrl}/api/category/${pendingDeleteID}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } else {
      toast.error("Xóa danh mục thất bại. Vui lòng thử lại.");
    }
    setShowConfirm(false);
    setPendingDeleteID(null);
  };

  // Start editing
  const startEdit = (cat: Category) => {
    setEditID(cat.categoryID);
    setEditName(cat.categoryName);
    setEditDescription(cat.categoryDescription || "");
  };

  // Save edit
  const handleEditSave = async (id: number) => {
    const res = await fetch(`${baseUrl}/api/category/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryName: editName,
        categoryDescription: editDescription,
      }),
    });
    if (res.ok) {
      toast.success("Cập nhật danh mục thành công");
      setEditID(null);
      fetchCategories();
    } else {
      toast.error("Cập nhật danh mục thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <main className="">
      <h1 className="text-2xl font-bold mb-4">Thêm Danh Mục Chính</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Label className="block mb-1 font-medium">Tên danh mục</Label>
          <Input
            {...register("categoryName", { required: true })}
            placeholder="Nhập tên danh mục"
          />
          {errors.categoryName && (
            <div className="text-red-500 text-sm mt-1">
              Tên danh mục không được phép rỗng.
            </div>
          )}
        </div>
        <div className="mb-4">
          <Label className="block mb-1 font-medium">Mô tả danh mục</Label>
          <Input
            {...register("categoryDescription")}
            placeholder="Nhập mô tả danh mục"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="mt-4">
            Thêm danh mục
          </Button>
        </div>
      </form>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Danh sách danh mục</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-32">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.categoryID}>
              {editID === cat.categoryID ? (
                <>
                  <TableCell>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell >
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(cat.categoryID)}
                      className="hover:cursor-pointer"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditID(null)}
                      className="hover:cursor-pointer hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">
                    {cat.categoryName}
                  </TableCell>
                    <TableCell className="text-gray-500 text-sm max-w-[400px] truncate" >
                    {cat.categoryDescription}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(cat)}
                      className="hover:cursor-pointer hover:bg-gray-200"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cat.categoryID)}
                      className="hover:cursor-pointer hover:bg-gray-200"
                    >
                      <Trash className="text-red-500"/>
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa danh mục này không?</div>
          <DialogFooter> 
            <DialogClose asChild>
              <Button variant="outline" className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} className="hover:cursor-pointer ">Xóa</Button>
           
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}