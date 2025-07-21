"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { Pencil, Trash } from "lucide-react";
// import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import toast from "react-hot-toast";
import { fetchCategories } from "@/lib/category-apis";
import { createSubCategory, deleteSubCategory, fetchSubCategories, updateSubCategory } from "@/lib/subcategory-apis";

type SubCategoryFormValues = {
  subcategoryName: string;
  categoryID: string;
};

type Category = {
  categoryID: string;
  categoryName: string;
};

type SubCategory = {
  subcategoryID: string;
  subcategoryName: string;
  categoryID: string;
  category?: Category;
};

export default function AddSubCategoryPage() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SubCategoryFormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [editID, setEditID] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryID, setEditCategoryID] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Lỗi khi tải danh mục.");
      }
    };
    fetchData();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSubCategories();
        setSubCategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast.error("Lỗi khi tải danh mục con.");
      }
    };
    fetchData();
  }, []);

  // Add new subcategory
  const onSubmit: SubmitHandler<SubCategoryFormValues> = async (data) => {
    try {
      const res = await createSubCategory(data);
      if (res) {
        toast.success("Thêm danh mục con thành công!");
        reset();
        fetchSubCategories();
      } else {
        toast.error("Thêm danh mục con thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Thêm danh mục con thất bại. Vui lòng thử lại.");
    }
  };

  // Delete subcategory
  const handleDelete = (id: string) => {
    setDeleteID(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteID) return;
    try {
      await deleteSubCategory(deleteID);
      setSubCategories(subCategories.filter(sub => sub.subcategoryID !== deleteID));
      fetchSubCategories();
      toast.success("Xóa danh mục con thành công");
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Xóa danh mục con thất bại. Vui lòng thử lại.");
    }
    setShowConfirm(false);
  };

  // Start editing
  const startEdit = (sub: SubCategory) => {
    setEditID(sub.subcategoryID);
    setEditName(sub.subcategoryName);
    setEditCategoryID(sub.categoryID);
  };

  // Save edit
  const handleEditSave = async (id: string) => {
    try {
      const updatedSubCategory = {
        subcategoryName: editName,
        categoryID: editCategoryID,
      };
      const res = await updateSubCategory(id, updatedSubCategory);
      if (res) {
        setEditID(null);
        fetchSubCategories();
        toast.success("Cập nhật danh mục con thành công");
      } else {
        toast.error("Cập nhật danh mục con thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Cập nhật danh mục con thất bại. Vui lòng thử lại.");
    }
  };
  return (
    <main className="">
      <h1 className="text-2xl font-bold mb-4">Thêm Danh Mục Con</h1>
      <FormProvider {...{ ...useForm() }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormItem className="mb-4">
            <FormLabel>Tên danh mục con</FormLabel>
            <FormControl>
              <Input {...register("subcategoryName", { required: true })} placeholder="Nhập tên danh mục con" />
            </FormControl>
            {errors.subcategoryName && (
              <FormMessage>Tên danh mục con không được để trống.</FormMessage>
            )}
          </FormItem>
          <FormItem>
            <FormLabel>Danh mục</FormLabel>
            <FormControl>
              <Select
                value={String(watch("categoryID") ?? "")}
                onValueChange={val => {
                  setValue("categoryID", val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {errors.categoryID && <FormMessage>
              Danh mục không được phép rỗng.
            </FormMessage>}
          </FormItem>
          {/* <FormItem>
            <FormLabel>Số lượng trên thùng/lô</FormLabel>
            <FormControl>
              <Input type="number" {...register("quantityPerBox", { required: true })} placeholder="Nhập số lượng sản phẩm/lô(thùng) nếu có."/>
            </FormControl>
          </FormItem> */}
          <div className="flex justify-end">
            <Button type="submit" className="mt-4">Thêm danh mục con</Button>
          </div>
        </form>
      </FormProvider>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Danh sách danh mục con</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên danh mục con</TableHead>
            <TableHead>Danh mục chính</TableHead>
            <TableHead className="w-32">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subCategories.map((sub) => (
            <TableRow key={sub.subcategoryID}>
              {editID === sub.subcategoryID ? (
                <>
                  <TableCell>
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={editCategoryID} onValueChange={val => setEditCategoryID(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn danh mục chính" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(sub.subcategoryID)} className="hover:cursor-pointer">Lưu</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditID(null)} className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{sub.subcategoryName}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {categories.find(cat => String(cat.categoryID) === String(sub.categoryID))?.categoryName || ""}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(sub)} className="hover:cursor-pointer hover:bg-gray-200"><Pencil /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(sub.subcategoryID)} className="hover:cursor-pointer hover:bg-gray-200"><Trash className="text-red-500" /></Button>
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
            <DialogTitle>Xác nhận xóa danh mục con</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa danh mục con này không?</div>
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