"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { useRouter } from "next/navigation";

type DeliveryFormValues = {
  name: string;
  description?: string;
  base_price: number;
  min_order_amount?: number;
  region?: string;
  speed?: string;
  is_active: boolean;
  is_default: boolean;
};

export default function AddDeliveryMethodPage() {
  const methods = useForm<DeliveryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      base_price: 0,
      min_order_amount: undefined,
      region: "",
      speed: "",
      is_active: true,
      is_default: false,
    },
  });

  const router = useRouter();

  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add delivery method");
      alert("Delivery method added successfully!");
      router.push("/admin/delivery-methods");
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thêm phương thức giao hàng mới</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
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
                {...methods.register("base_price", { required: "Giá cơ bản là bắt buộc", min: 0 })}
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
                {...methods.register("min_order_amount")}
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
              <input type="checkbox" {...methods.register("is_active")} className="mr-2" />
              Kích hoạt
            </FormLabel>
          </FormItem>

          <FormItem>
            <FormLabel>
              <input type="checkbox" {...methods.register("is_default")} className="mr-2" />
              Mặc định
            </FormLabel>
          </FormItem>

          <button type="submit" className="btn btn-primary mt-4 w-full">
            Thêm phương thức giao hàng
          </button>
        </form>
      </FormProvider>
    </div>
  );
}