"use client"
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Label } from "@/components/ui/label/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { addOrigin, deleteOrigin, fetchOrigins, updateOrigin } from "@/lib/origin-apis";
import { deleteAImage, uploadSingleImage } from "@/lib/file-apis";

type OriginFormValues = {
  originName: string;
  image: FileList;
};

type Origin = {
  originID: number;
  originName: string;
  originImage: string;
};

export default function AddOriginPage() {
  const methods = useForm<OriginFormValues>();
  const { register, handleSubmit, reset, formState: { errors } } = methods;
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState<number>();

  // Fetch all origins


  useEffect(() => {
    const fetchOriginsData = async () => {
      const data = await fetchOrigins();
      setOrigins(data);
    };
    fetchOriginsData();
  }, []);

  const onSubmit = async (data: OriginFormValues) => {
    if (!data.image || data.image.length === 0) {
      toast.error("Hãy chọn một ảnh nhà sản xuất");
      return;
    }
    // Upload image
    const imageUrl = await uploadSingleImage(data.image[0]);

    // Save origin with image URL
    const res = await addOrigin(data.originName, imageUrl);
    if (res) {
      toast.success("Thêm xuất xứ thành công!");
      reset();
      fetchOrigins();
    } else {
      toast.error("Thêm xuất xứ thất bại. Vui lòng thử lại.");
    }
  };

  // Delete origin
  const handleDelete = async (id: number | undefined) => {
    if (!id) {
      toast.error("Mã sản phẩm không tồn tại. Hãy thử lại.");
      return;
    }
    const res = await deleteOrigin(id);
    if (res) {
      toast.success("Đã xóa xuất xứ thành công!");
      setShowConfirm(false);
      fetchOrigins();
    } else {
      toast.error("Xóa xuất xứ thất bại. Vui lòng thử lại.");
    }
  };

  // Start editing
  const startEdit = (origin: Origin) => {
    setEditID(origin.originID);
    setEditName(origin.originName);
    setEditImage(null);
  };

  // Save edit
  const handleEditSave = async (originID: number) => {
    let imageUrl = "";
    if (editImage) {
      try {
        imageUrl = await uploadSingleImage(editImage);
      } catch (error) {
        toast.error("Xảy ra lỗi khi tải ảnh lên.");
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      // Delete old image if a new one is uploaded
      if (imageUrl && origins.find(o => o.originID === originID)?.originImage) {
        const oldImage = origins.find(o => o.originID === originID)?.originImage;
        if (oldImage) {
          await deleteAImage(oldImage);
        }
      }
    } catch (error) {
      toast.error("Xảy ra lỗi khi xóa ảnh cũ.");
      console.error("Error deleting old image:", error);
      return;
    }

    const res = await updateOrigin(originID, editName, imageUrl);

    if (res.ok) {
      toast.success("Cập nhật nhà sản xuất thành công!");
      setOrigins(origins.map(o =>
        o.originID === originID ? { ...o, originName: editName, originImage: imageUrl || o.originImage } : o
      ));
      setEditID(null);
      fetchOrigins();
    } else {
      toast.error("Cập nhật nhà sản xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <main className="">
      <h1 className="text-2xl font-bold mb-4">Thêm Nhà Sản Xuất</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Label className="block mb-1 font-medium">Tên nhà sản xuất</Label>
            <Input {...register("originName", { required: true })} placeholder="Nhập tên nhà sản xuất" />
            {errors.originName && (
              <div className="text-red-500 text-sm mt-1">Tên nhà sản xuât không được phép rỗng.</div>
            )}
          </div>
          <div className="mb-4">
            <Label className="block mb-1 font-medium">Ảnh đại diện nhà sản xuất</Label>
            <Input type="file" {...register("image", { required: true })} />
            {errors.image && (
              <div className="text-red-500 text-sm mt-1">Ảnh đại diện là sản xuất là bắt buộc.</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="mt-4">Thêm nhà sản xuất</Button>
          </div>
        </form>
      </FormProvider>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Danh sách nhà sản xuất</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên nhà sản xuất</TableHead>
            <TableHead>Ảnh đại diện/Logo</TableHead>
            <TableHead className="w-32">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {origins.map(origin => (
            <TableRow key={origin.originID}>
              {editID === origin.originID ? (
                <>
                  <TableCell>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="w-full" />
                  </TableCell>
                  <TableCell>
                    <Input type="file" onChange={e => setEditImage(e.target.files?.[0] || null)} className="w-full" />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(origin.originID)} className="hover:cursor-pointer">Lưu</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditID(null)} className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{origin.originName}</TableCell>
                  <TableCell>
                    {origin.originImage && (
                      <Image width={400} height={400} src={origin.originImage} alt={origin.originName} className="w-12 h-12 object-cover rounded" />
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(origin)} className="hover:cursor-pointer hover:bg-gray-200"><Pencil /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditID(null); setShowConfirm(true); setDeleteID(origin.originID); }} className="hover:cursor-pointer hover:bg-gray-200"><Trash className="text-red-500" /></Button>
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
            <DialogTitle>Xác nhận xóa xuất xứ</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa xuất xứ này không?</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => handleDelete(deleteID)} className="hover:cursor-pointer ">Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}