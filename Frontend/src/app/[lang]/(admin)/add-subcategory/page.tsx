"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";

type SubCategoryFormValues = {
  subcategoryName: string;
  categoryID: string;
};

type Category = {
  categoryID: string;
  categoryName: string;
};

export default function AddSubCategoryPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubCategoryFormValues>();
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/category")
      .then(res => res.json())
      .then(data => setCategories(data || []));
  }, []);

  const onSubmit = async (data: SubCategoryFormValues) => {
    setMessage("");
    const res = await fetch("http://localhost:3000/api/subcategory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Subcategory added successfully!");
      reset();
    } else {
      setMessage("Failed to add subcategory.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Subcategory</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Subcategory Name</label>
          <Input {...register("subcategoryName", { required: true })} />
          {errors.subcategoryName && (
            <div className="text-red-500 text-sm mt-1">Subcategory name is required</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category</label>
          <select {...register("categoryID", { required: true })} defaultValue="">
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
            ))}
          </select>
          {errors.categoryID && (
            <div className="text-red-500 text-sm mt-1">Category is required</div>
          )}
        </div>
        <Button type="submit" className="mt-4">Add Subcategory</Button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
    </main>
  );
}