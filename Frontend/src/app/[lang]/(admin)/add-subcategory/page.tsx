"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/others/base-url";

type SubCategoryFormValues = {
  subcategoryName: string;
  categoryID: string;
  quantityPerBox: number; 
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
  quantityPerBox: number; 
};

export default function AddSubCategoryPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubCategoryFormValues>();
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [editID, setEditID] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryID, setEditCategoryID] = useState("");
  const [editQuantityPerBox, setEditQuantityPerBox] = useState<number | "">("");

  // Fetch categories
  useEffect(() => {
    fetch(`${baseUrl}/api/category`)
      .then(res => res.json())
      .then(data => setCategories(data || []));
  }, []);

  // Fetch subcategories
  const fetchSubCategories = async () => {
    const res = await fetch(`${baseUrl}/api/subcategory`);
    if (res.ok) {
      const data = await res.json();
      setSubCategories(data);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  // Add new subcategory
  const onSubmit = async (data: SubCategoryFormValues) => {
    setMessage("");
    const res = await fetch(`${baseUrl}/api/subcategory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Subcategory added successfully!");
      reset();
      fetchSubCategories();
    } else {
      setMessage("Failed to add subcategory.");
    }
  };

  // Delete subcategory
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    const res = await fetch(`${baseUrl}/api/subcategory/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage("Subcategory deleted.");
      fetchSubCategories();
    } else {
      setMessage("Failed to delete subcategory.");
    }
  };

  // Start editing
  const startEdit = (sub: SubCategory) => {
    setEditID(sub.subcategoryID);
    setEditName(sub.subcategoryName);
    setEditCategoryID(sub.categoryID);
    setEditQuantityPerBox(sub?.quantityPerBox || 0);
  };

  // Save edit
  const handleEditSave = async (id: string) => {
    const res = await fetch(`${baseUrl}/api/subcategory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subcategoryName: editName, categoryID: editCategoryID, quantityPerBox: editQuantityPerBox }),
    });
    if (res.ok) {
      setMessage("Subcategory updated.");
      setEditID(null);
      fetchSubCategories();
    } else {
      setMessage("Failed to update subcategory.");
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
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
        <div className="mb-4">
          <label className="block mb-1 font-medium">Quantity per box</label>
          <Input {...register("quantityPerBox", { required: true })} />
          {errors.quantityPerBox && (
            <div className="text-red-500 text-sm mt-1">Subcategory name is required</div>
          )}
        </div>
        <Button type="submit" className="mt-4">Add Subcategory</Button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>

      <h2 className="text-xl font-semibold mt-10 mb-2">Subcategory List</h2>
      <div className="space-y-2">
        {subCategories.map(sub => (
          <div key={sub.subcategoryID} className="flex items-center gap-2 border-b py-2">
            {editID === sub.subcategoryID ? (
              <>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-32"
                />
                <select
                  value={editCategoryID}
                  onChange={e => setEditCategoryID(e.target.value)}
                  className="w-40"
                >
                  {categories.map((cat) => (
                    <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={editQuantityPerBox}
                  onChange={e => setEditQuantityPerBox(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-32"
                  placeholder="Quantity per box"
                />
                <Button size="sm" onClick={() => handleEditSave(sub.subcategoryID)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditID(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="font-medium">{sub.subcategoryName}</span>
                <span className="text-gray-500 text-sm">
                  {categories.find(cat => cat.categoryID === sub.categoryID)?.categoryName || ""}
                </span>
                <span className="text-gray-700 text-sm">Qty/Box: {sub?.quantityPerBox || 0}</span>
                <Button size="sm" variant="outline" onClick={() => startEdit(sub)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(sub.subcategoryID)}>Delete</Button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}