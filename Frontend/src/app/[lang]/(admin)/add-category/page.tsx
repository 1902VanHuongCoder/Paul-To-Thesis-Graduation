"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";

type CategoryFormValues = {
  categoryName: string;
  categoryDescription?: string; // Add this line
};

export default function AddCategoryPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>();
  const [message, setMessage] = useState("");

  const onSubmit = async (data: CategoryFormValues) => {
    console.log("Form data:", data);
    setMessage("");
    const res = await fetch(`${baseUrl}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Category added successfully!");
      reset();
    } else {
      setMessage("Failed to add category.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Category</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category Name</label>
          <Input {...register("categoryName", { required: true })} />
          {errors.categoryName && (
            <div className="text-red-500 text-sm mt-1">Category name is required</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category Description</label>
          <Input {...register("categoryDescription")} />
        </div>
        <Button type="submit" className="mt-4">Add Category</Button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
    </main>
  );
}