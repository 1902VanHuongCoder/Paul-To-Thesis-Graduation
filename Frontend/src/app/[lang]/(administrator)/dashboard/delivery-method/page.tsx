"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Pencil, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { createDeliveryMethod, deleteDeliveryMethod, fetchDeliveryMethods, updateDeliveryMethod } from "@/lib/delivery-apis";

type DeliveryFormValues = {
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  isActive: boolean;
  isDefault: boolean;
};

type Delivery = {
  deliveryID: number;
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// Helper for formatting VND
function formatVND(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function AddDeliveryMethodPage() {
  const methods = useForm<DeliveryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      minOrderAmount: undefined,
      region: "",
      isActive: true,
      isDefault: false,
    },
  });

  const [deliveryList, setDeliveryList] = useState<Delivery[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Delivery> | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState<number | null>(null);

  // Fetch all delivery methods
  const fetchDeliveryList = async () => {
    try {
      const data = await fetchDeliveryMethods();
      setDeliveryList(data);
    } catch {
      console.error("Failed to fetch delivery methods");
      toast.error("Không thể tải danh sách phương thức giao hàng.");
    }
  };

  useEffect(() => {
    fetchDeliveryList();
  }, []);

  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      await createDeliveryMethod(data);
      toast.success("Thêm phương thức giao hàng thành công!");
      methods.reset();
      fetchDeliveryList();
    } catch (error) {
      toast.error("Lỗi: " + (error as Error).message);
      console.error("Error creating delivery method:", error);
    }
  };

  // Delete delivery method
  const handleDelete = (id: number) => {
    setDeleteID(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteID) return;
    try {
      const { message, status } = await deleteDeliveryMethod(deleteID);
      if (status === 200) {
            toast.success(message);
          setDeliveryList(deliveryList.filter(item => item.deliveryID !== deleteID));
      }else{
        toast.error(message);
      }
    } catch (error) {
      console.error("Error deleting delivery method:", error);
    }
    setShowConfirm(false);
  };

  // Start editing
  const startEdit = (delivery: Delivery) => {
    setEditID(delivery.deliveryID);
    setEditForm({ ...delivery });
  };

  // Save edit
  const handleEditSave = async (id: number) => {
    if (!editForm) return;
    try {
      await updateDeliveryMethod(id, editForm as DeliveryFormValues);
      toast.success("Cập nhật phương thức giao hàng thành công!");
      setEditID(null);
      setEditForm(null);
      fetchDeliveryList();
    } catch (error) {
      toast.error("Lỗi: " + (error as Error).message);
      console.error("Error updating delivery method:", error);
    }
  };

  return (
    <main className="">
      <h1 className="text-2xl font-bold mb-4">Thêm Phương Thức Giao Hàng</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormItem>
            <FormLabel>Tên phương thức</FormLabel>
            <FormControl>
              <Input {...methods.register("name", { required: true })} placeholder="Nhập tên phương thức" />
            </FormControl>
            {methods.formState.errors.name && <FormMessage>Tên phương thức không được để trống.</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <Input {...methods.register("description")} placeholder="Nhập mô tả phương thức" />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Giá cơ bản (VND)</FormLabel>
            <FormControl>
              <Input
                type="text"
                min={0}
                step={1}
                {...methods.register("basePrice", {
                  setValueAs: v => {
                    const num = Number(v);
                    return num < 1000 ? num * 1000 : num;
                  },
                  required: true,
                  min: 0,
                })}
                onBlur={e => {
                  const value = Number(e.target.value);
                  if (value > 0 && value < 1000) {
                    e.target.value = formatVND(value * 1000);
                  } else if (value > 0 && value >= 1000) {
                    e.target.value = formatVND(value);
                  } else {
                    e.target.value = "0";
                  }
                }}
                placeholder="e.g. 100 (sẽ là 100.000)"
              />
            </FormControl>
            {methods.formState.errors.basePrice && <FormMessage>Giá cơ bản là bắt buộc.</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Đơn tối thiểu để miễn phí (VND)</FormLabel>
            <FormControl>
              <Input
                type="text"
                min={0}
                step={1}
                {...methods.register("minOrderAmount", {
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
                    e.target.value = "0";
                  }
                }}
                placeholder="e.g. 100 (sẽ là 100.000)"
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Khu vực</FormLabel>
            <FormControl>
              <Select value={methods.watch("region") || ""} onValueChange={val => methods.setValue("region", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="urban">Thành phố</SelectItem>
                  <SelectItem value="suburb">Ngoại thành</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>
              <Checkbox {...methods.register("isActive")} className="mr-2" />
              Kích hoạt
            </FormLabel>
          </FormItem>
          <FormItem>
            <FormLabel>
              <Checkbox {...methods.register("isDefault")} className="mr-2" />
              Mặc định
            </FormLabel>
          </FormItem>
          <div className="flex justify-end">
            <Button type="submit" className="mt-4">Thêm phương thức</Button>
          </div>
        </form>
      </FormProvider>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Danh sách phương thức giao hàng</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên phương thức</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Giá cơ bản</TableHead>
            <TableHead>Đơn tối thiểu</TableHead>
            <TableHead>Khu vực</TableHead>
            <TableHead>Kích hoạt</TableHead>
            <TableHead>Mặc định</TableHead>
            <TableHead className="w-32">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveryList.map((delivery) => (
            <TableRow key={delivery.deliveryID}>
              {editID === delivery.deliveryID && editForm ? (
                <>
                  <TableCell>
                    <Input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full" />
                  </TableCell>
                  <TableCell>
                    <Input value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full" />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={editForm.basePrice === undefined ? '' : editForm.basePrice}
                      onChange={e => {
                        console.log(e.target.value);
                        const num = Number(e.target.value);
                        setEditForm({ ...editForm, basePrice: num });
                      }}
                      onBlur={e => {
                        console.log(".. RUN ..");
                        const value = Number(e.target.value);
                        if (value > 0 && value < 1000) {
                          e.target.value = formatVND(value * 1000);
                        } else if (value >= 1000) {
                          e.target.value = formatVND(value);
                        } else {
                          e.target.value = "0";
                        }
                      }}
                      className="w-full"
                      placeholder="e.g. 100 (sẽ là 100.000)"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"

                      value={editForm.minOrderAmount === undefined ? '' : editForm.minOrderAmount}
                      onChange={e => {
                        const num = Number(e.target.value);
                        setEditForm({ ...editForm, minOrderAmount: num });
                      }}
                      onBlur={e => {
                        const value = Number(e.target.value);
                        if (value > 0 && value < 1000) {
                          e.target.value = formatVND(value * 1000);
                        } else if (value >= 1000) {
                          e.target.value = formatVND(value);
                        } else {
                          e.target.value = "0";
                        }
                      }}
                      className="w-full"
                      placeholder="e.g. 100 (sẽ là 100.000)"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={editForm.region || ""} onValueChange={val => setEditForm({ ...editForm, region: val })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="urban">Thành phố</SelectItem>
                        <SelectItem value="suburb">Ngoại thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={!!editForm.isActive}
                      onCheckedChange={checked => setEditForm({ ...editForm, isActive: !!checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={!!editForm.isDefault}
                      onCheckedChange={checked => setEditForm({ ...editForm, isDefault: !!checked })}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(delivery.deliveryID)} className="hover:cursor-pointer">Lưu</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditID(null); setEditForm(null); }} className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{delivery.name}</TableCell>
                  <TableCell>{delivery.description}</TableCell>
                  <TableCell>{delivery.basePrice?.toLocaleString()}₫</TableCell>
                  <TableCell>{delivery.minOrderAmount?.toLocaleString()}đ</TableCell>
                  <TableCell>{delivery.region === "urban" ? "Thành phố" : delivery.region === "suburb" ? "Ngoại thành" : "Tất cả"}</TableCell>
                  <TableCell>{delivery.isActive ? "Có" : "Không"}</TableCell>
                  <TableCell>{delivery.isDefault ? "Có" : "Không"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(delivery)} className="hover:cursor-pointer hover:bg-gray-200"><Pencil /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(delivery.deliveryID)} className="hover:cursor-pointer hover:bg-gray-200"><Trash className="text-red-500" /></Button>
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
            <DialogTitle>Xác nhận xóa phương thức giao hàng</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa phương thức giao hàng này không?</div>
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