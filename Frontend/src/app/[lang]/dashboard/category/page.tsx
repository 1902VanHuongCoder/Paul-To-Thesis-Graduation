"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";

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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>();
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
    setMessage("");
    const res = await fetch(`${baseUrl}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Category added successfully!");
      reset();
      fetchCategories();
    } else {
      setMessage("Failed to add category.");
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await fetch(`${baseUrl}/api/category/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage("Category deleted.");
      fetchCategories();
    } else {
      setMessage("Failed to delete category.");
    }
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
      body: JSON.stringify({ categoryName: editName, categoryDescription: editDescription }),
    });
    if (res.ok) {
      setMessage("Category updated.");
      setEditID(null);
      fetchCategories();
    } else {
      setMessage("Failed to update category.");
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

      <h2 className="text-xl font-semibold mt-10 mb-2">Category List</h2>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.categoryID} className="flex items-center gap-2 border-b py-2">
            {editID === cat.categoryID ? (
              <>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-32"
                />
                <Input
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleEditSave(cat.categoryID)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditID(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="font-medium">{cat.categoryName}</span>
                <span className="text-gray-500 text-sm">{cat.categoryDescription}</span>
                <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.categoryID)}>Delete</Button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}