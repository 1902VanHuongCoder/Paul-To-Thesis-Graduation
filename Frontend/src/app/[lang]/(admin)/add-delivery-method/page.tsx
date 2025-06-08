"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { baseUrl } from "@/lib/base-url";

type DeliveryFormValues = {
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  speed?: string;
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
  speed?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AddDeliveryMethodPage() {
  const methods = useForm<DeliveryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      minOrderAmount: undefined,
      region: "",
      speed: "",
      isActive: true,
      isDefault: false,
    },
  });

  // List state
  const [deliveryList, setDeliveryList] = useState<Delivery[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Delivery> | null>(null);

  // Fetch all delivery methods
  const fetchDeliveryList = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/delivery`);
      if (res.ok) {
        const data = await res.json();
        setDeliveryList(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDeliveryList();
  }, []);

  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      const res = await fetch(`${baseUrl}/api/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add delivery method");
      alert("Delivery method added successfully!");
      methods.reset();
      fetchDeliveryList();
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  // Delete delivery method
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa phương thức này?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/delivery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Đã xóa phương thức giao hàng.");
        fetchDeliveryList();
      } else {
        alert("Xóa thất bại.");
      }
    } catch {
      alert("Có lỗi xảy ra khi xóa.");
    }
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
      const res = await fetch(`${baseUrl}/api/delivery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        setEditID(null);
        setEditForm(null);
        fetchDeliveryList();
      } else {
        alert("Cập nhật thất bại.");
      }
    } catch {
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thêm phương thức giao hàng mới</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* ...existing form fields... */}
          <FormItem>
            <FormLabel>Tên phương thức</FormLabel>
            <FormControl>
              <input
                {...methods.register("name", { required: "Tên là bắt buộc" })}
                className="input input-bordered w-full"
                placeholder="Tên phương thức"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <textarea
                {...methods.register("description")}
                className="input input-bordered w-full"
                placeholder="Mô tả"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Giá cơ bản (VND)</FormLabel>
            <FormControl>
              <input
                type="number"
                step="1000"
                {...methods.register("basePrice", { required: "Giá cơ bản là bắt buộc", min: 0 })}
                className="input input-bordered w-full"
                placeholder="Giá cơ bản"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Đơn tối thiểu để miễn phí (VND)</FormLabel>
            <FormControl>
              <input
                type="number"
                step="1000"
                {...methods.register("minOrderAmount")}
                className="input input-bordered w-full"
                placeholder="Đơn tối thiểu để miễn phí"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Khu vực</FormLabel>
            <FormControl>
              <select {...methods.register("region")} className="input input-bordered w-full">
                <option value="">Tất cả</option>
                <option value="urban">Thành phố</option>
                <option value="suburb">Ngoại thành</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Tốc độ giao</FormLabel>
            <FormControl>
              <select {...methods.register("speed")} className="input input-bordered w-full">
                <option value="">Chọn tốc độ</option>
                <option value="standard">Tiêu chuẩn</option>
                <option value="fast">Nhanh</option>
                <option value="same_day">Trong ngày</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>
              <input type="checkbox" {...methods.register("isActive")} className="mr-2" />
              Kích hoạt
            </FormLabel>
          </FormItem>
          <FormItem>
            <FormLabel>
              <input type="checkbox" {...methods.register("isDefault")} className="mr-2" />
              Mặc định
            </FormLabel>
          </FormItem>
          <button type="submit" className="btn btn-primary mt-4 w-full">
            Thêm phương thức giao hàng
          </button>
        </form>
      </FormProvider>

      <h2 className="text-xl font-semibold mt-10 mb-2">Danh sách phương thức giao hàng</h2>
      <div className="space-y-2">
        {deliveryList.map((delivery) => (
          <div key={delivery.deliveryID} className="flex items-center gap-2 border-b py-2">
            {editID === delivery.deliveryID && editForm ? (
              <>
                <input
                  className="w-32 border px-2 py-1"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
                <input
                  className="w-40 border px-2 py-1"
                  value={editForm.description || ""}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
                <input
                  className="w-20 border px-2 py-1"
                  type="number"
                  value={editForm.basePrice}
                  onChange={e => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                />
                <input
                  className="w-20 border px-2 py-1"
                  type="number"
                  value={editForm.minOrderAmount || ""}
                  onChange={e => setEditForm({ ...editForm, minOrderAmount: Number(e.target.value) })}
                />
                <select
                  className="w-24 border px-2 py-1"
                  value={editForm.region || ""}
                  onChange={e => setEditForm({ ...editForm, region: e.target.value })}
                >
                  <option value="">Tất cả</option>
                  <option value="urban">Thành phố</option>
                  <option value="suburb">Ngoại thành</option>
                </select>
                <select
                  className="w-24 border px-2 py-1"
                  value={editForm.speed || ""}
                  onChange={e => setEditForm({ ...editForm, speed: e.target.value })}
                >
                  <option value="">Chọn tốc độ</option>
                  <option value="standard">Tiêu chuẩn</option>
                  <option value="fast">Nhanh</option>
                  <option value="same_day">Trong ngày</option>
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  Kích hoạt
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editForm.isDefault}
                    onChange={e => setEditForm({ ...editForm, isDefault: e.target.checked })}
                  />
                  Mặc định
                </label>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleEditSave(delivery.deliveryID)}
                >
                  Lưu
                </button>
                <button
                  className="px-2 py-1 bg-gray-300 rounded"
                  onClick={() => {
                    setEditID(null);
                    setEditForm(null);
                  }}
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{delivery.name}</span>
                <span className="text-gray-500 text-sm">{delivery.description}</span>
                <span className="text-gray-500 text-sm">{delivery.basePrice}₫</span>
                <span className="text-xs text-gray-400">Min: {delivery.minOrderAmount}</span>
                <span className="text-xs">{delivery.region}</span>
                <span className="text-xs">{delivery.speed}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{delivery.isActive ? "Kích hoạt" : "Ẩn"}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-200">{delivery.isDefault ? "Mặc định" : ""}</span>
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => startEdit(delivery)}
                >
                  Sửa
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(delivery.deliveryID)}
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}