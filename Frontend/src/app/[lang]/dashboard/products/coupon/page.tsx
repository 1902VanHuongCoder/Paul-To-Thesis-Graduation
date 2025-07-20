"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { PencilLine, Trash, CheckCircle, XCircle } from "lucide-react";
import { baseUrl } from "@/lib/others/base-url";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination/pagination";
import formatVND from "@/lib/others/format-vnd";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import toast from "react-hot-toast";

type Discount = {
  discountID: string;
  discountDescription: string;
  discountPercent: number;
  expireDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortUsageLimit, setSortUsageLimit] = useState<"asc" | "desc" | "none">("none");
  const [descFilter, setDescFilter] = useState("");
  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(discounts.length / itemsPerPage);

  const methods = useForm<Discount>();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = methods;

  useEffect(() => {
    fetch(`${baseUrl}/api/discount`)
      .then(res => res.json())
      .then((data: Discount[]) => setDiscounts(data));
  }, []);

  const handleOpenAdd = () => {
    reset({
      discountID: "",
      discountDescription: "",
      discountPercent: 0,
      expireDate: "",
      isActive: true,
      usageLimit: 0,
      usedCount: 0,
      minOrderValue: 0,
      maxDiscountAmount: 0,
    });
    setEditDiscount(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (discount: Discount) => {
    reset({
      discountID: discount.discountID,
      discountDescription: discount.discountDescription,
      discountPercent: discount.discountPercent,
      expireDate: discount.expireDate ? discount.expireDate.slice(0, 10) : "",
      isActive: discount.isActive,
      usageLimit: discount.usageLimit || 0,
      usedCount: discount.usedCount || 0,
      minOrderValue: discount.minOrderValue || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
    });
    setEditDiscount(discount);
    setOpenDialog(true);
  };

  const handleDelete = async (discountID: string) => {
    try {
      await fetch(`${baseUrl}/api/discount/${discountID}`, { method: "DELETE" });
      toast.success("Xóa mã giảm giá thành công!");
      setDiscounts(discounts => discounts.filter(d => d.discountID !== discountID));
    }catch(error){
      toast.error("Xóa mã giảm giá thất bại. Vui lòng thử lại.");
      console.error("Failed to delete discount:", error);
      return;
    }
  };

  const onSubmit = async (data: Discount) => {
    const payload: Discount = {
      ...data,
      discountPercent: Number(data.discountPercent),
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usedCount: data.usedCount ? Number(data.usedCount) : 0,
      minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : undefined,
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
      isActive: !!data.isActive,
    };
    try {
      if (editDiscount) {
        const res = await fetch(`${baseUrl}/api/discount/${data.discountID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok){
          toast.error("Cập nhật mã giảm giá thất bại");
          throw new Error("Update failed");
        } ;
        setDiscounts(ds => ds.map(d => d.discountID === data.discountID ? { ...d, ...payload } : d));
      } else {
        const res = await fetch(`${baseUrl}/api/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          toast.error("Thêm mã giảm giá thất bại. Kiểm tra kết nối và thử lại.");
          throw new Error("Add failed"); 
        };
        const resData = await res.json();
        setDiscounts(ds => [...ds, resData.data]);
        toast.success("Mã giảm giá đã được thêm thành công!");
      }
      setOpenDialog(false);
    } catch (err) {
      toast.error("Không thể lưu mã giảm giá. Kiểm tra kết nối và thử lại.");
      console.error(err);
    }
  };

  const generateDiscountCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("discountID", code);
  };

  // Filter and sort discounts
  const filteredDiscounts = discounts
    .filter((d) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return d.isActive;
      if (statusFilter === "inactive") return !d.isActive;
      return true;
    })
    .filter((d) =>
      descFilter.trim() === "" || d.discountDescription.toLowerCase().includes(descFilter.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortUsageLimit === "none") return 0;
      const aVal = a.usageLimit ?? 0;
      const bVal = b.usageLimit ?? 0;
      return sortUsageLimit === "asc" ? aVal - bVal : bVal - aVal;
    });

  // Update status handler
  const handleToggleStatus = async (discount: Discount) => {
    try {
      const updated = { ...discount, isActive: !discount.isActive };
      const res = await fetch(`${baseUrl}/api/discount/${discount.discountID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setDiscounts(ds => ds.map(d => d.discountID === discount.discountID ? { ...d, isActive: !d.isActive } : d));
    } catch {
      toast.error("Không thể cập nhật trạng thái mã giảm giá. Vui lòng thử lại.");
      console.error("Failed to update discount status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh Sách Chương Trình Giảm Giá</h1>
      </div>
      {/* Filter and sort controls */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-medium mr-2">Trạng thái:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium mr-2">Sắp xếp theo giới hạn sử dụng:</label>
          <Select value={sortUsageLimit} onValueChange={val => setSortUsageLimit(val as "asc" | "desc" | "none")}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Chọn sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không sắp xếp</SelectItem>
              <SelectItem value="asc">Tăng dần</SelectItem>
              <SelectItem value="desc">Giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="font-medium mr-2">Tìm theo mô tả:</label>
          <input
            type="text"
            value={descFilter}
            onChange={e => setDescFilter(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Nhập mô tả..."
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Phần trăm</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giới hạn</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Đơn tối thiểu</TableHead>
              <TableHead>Giảm tối đa</TableHead>
              <TableHead>Ngày tạo</TableHead>
              {/* Ẩn cột cập nhật */}
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((d) => (
              <TableRow key={d.discountID}>
                <TableCell>{d.discountID}</TableCell>
                <TableCell className="max-w-[100px] truncate">{d.discountDescription}</TableCell>
                <TableCell>{d.discountPercent}%</TableCell>
                <TableCell>{d.expireDate ? d.expireDate.slice(0, 10) : ""}</TableCell>
                <TableCell>
                  <button
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold hover:bg-green-50 hover:cursor-pointer ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
                    title="Bấm để đổi trạng thái"
                    onClick={() => handleToggleStatus(d)}
                  >
                    {d.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {d.isActive ? "Hoạt động" : "Hết hạn"}
                  </button>
                </TableCell>
                <TableCell>{d.usageLimit ?? ""}</TableCell>
                <TableCell>{d.usedCount ?? 0}</TableCell>
                <TableCell>{d.minOrderValue ? formatVND(d.minOrderValue) : ""}</TableCell>
                <TableCell>{d.maxDiscountAmount ? formatVND(d.maxDiscountAmount) : ""}</TableCell>
                <TableCell>{d.createdAt ? d.createdAt.slice(0, 10) : ""}</TableCell>
                {/* Ẩn cột cập nhật */}
                <TableCell className="flex items-center justify-center">
                  <button className="text-blue-600 mr-2 cursor-pointer" title="Chỉnh sửa" onClick={() => handleOpenEdit(d)}>
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-red-600" title="Xóa"><Trash className="w-4 h-4 cursor-pointer" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa mã giảm giá này?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(d.discountID)}>Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        {/* Pagination controls */}
        <Pagination className="w-full flex justify-start my-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <PaginationItem key={pg}>
                <PaginationLink
                  href="#"
                  isActive={pg === page}
                  onClick={e => { e.preventDefault(); setPage(pg); }}
                >
                  {pg}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                aria-disabled={page === totalPages || totalPages === 0}
                tabIndex={page === totalPages || totalPages === 0 ? -1 : 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        {/* Move add button to bottom */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleOpenAdd} className="flex gap-2 items-center hover:cursor-pointer">Thêm mã giảm giá</Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="min-w-4xl">
          <DialogHeader>
            <DialogTitle>{editDiscount ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
              <FormItem>
                <FormLabel className="text-gray-600">Mã giảm giá</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...register("discountID", { required: true })} disabled={!!editDiscount} readOnly={editDiscount ? true : false}/>
                    <Button type="button" onClick={generateDiscountCode} variant="outline" disabled={editDiscount ? true : false}>Tạo mã</Button>
                  </div>
                </FormControl>
                {errors.discountID && <FormMessage>Mã giảm giá là bắt buộc</FormMessage>}
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Mô tả</FormLabel>
                <FormControl>
                  <Input {...register("discountDescription", { required: true })} maxLength={100} />
                </FormControl>
                {errors.discountDescription && <FormMessage>Mô tả là bắt buộc</FormMessage>}
              </FormItem>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <FormLabel className="text-gray-600">Phần trăm (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={100} {...register("discountPercent", { required: true, min: 1, max: 100 })} />
                  </FormControl>
                  {errors.discountPercent && <FormMessage>Phần trăm phải từ 1-100</FormMessage>}
                </FormItem>
                <FormItem>
                  <FormLabel className="text-gray-600">Ngày hết hạn</FormLabel>
                  <FormControl>
                    <Input className="!block" type="date" {...register("expireDate", { required: true })} />
                  </FormControl>
                  {errors.expireDate && <FormMessage>Ngày hết hạn là bắt buộc</FormMessage>}
                </FormItem>
                <FormItem>
                  <FormLabel className="text-gray-600">Giới hạn sử dụng</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...register("usageLimit")} />
                  </FormControl>
                </FormItem>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <FormLabel className="text-gray-600">Đã dùng</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...register("usedCount")} />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel className="text-gray-600">Đơn tối thiểu</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      min={0}
                      step={1}
                      {...register("minOrderValue", {
                        min: { value: 1, message: "Giá phải lớn hơn 1." },
                        setValueAs: v => {
                          const num = Number(v);
                          return num < 1000 ? num * 1000 : num;
                        },
                      })}
                      onBlur={e => {
                        const value = Number(e.target.value);
                        if (value > 0 && value < 1000) {
                          e.target.value = formatVND(value * 1000);
                        } else if (value > 0 && value >= 1000) {
                          e.target.value = formatVND(value);
                        } else {
                          e.target.value = "";
                        }
                      }}
                      placeholder="e.g. 100 (sẽ là 100.000)"
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel className="text-gray-600">Giảm tối đa</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      min={0}
                      step={1}
                      {...register("maxDiscountAmount", {
                        min: { value: 1, message: "Giá phải lớn hơn 1." },
                        setValueAs: v => {
                          const num = Number(v);
                          return num < 1000 ? num * 1000 : num;
                        },
                      })}
                      onBlur={e => {
                        const value = Number(e.target.value);
                        if (value > 0 && value < 1000) {
                          e.target.value = formatVND(value * 1000);
                        } else if (value > 0 && value >= 1000) {
                          e.target.value = formatVND(value);
                        } else {
                          e.target.value = "";
                        }
                      }}
                      placeholder="e.g. 100 (sẽ là 100.000)"
                    />
                  </FormControl>
                </FormItem>
              </div>
              <FormItem className="flex items-center gap-x-2">
                <FormLabel className="text-gray-600">Trạng thái</FormLabel>
                <FormControl>
                  <Checkbox {...register("isActive")} />
                </FormControl>
              </FormItem>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Hủy</Button>
                </DialogClose>
                <Button type="submit">{editDiscount ? "Cập nhật" : "Thêm"}</Button>
              </DialogFooter>
            </form>
          </FormProvider>

        </DialogContent>
      </Dialog>
    </div>
  );
}