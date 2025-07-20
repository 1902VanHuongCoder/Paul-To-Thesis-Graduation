"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/others/base-url";

type AttributeFormValues = {
  categoryID: string;
  name: string;
  label: string;
  data_type: string;
  required: boolean;
  default_value: string;
  placeholder: string;
  unit: string;
  options: string;
  order: number;
  is_active: boolean;
};

type Category = {
  categoryID: number;
  categoryName: string;
};

type Attribute = {
  attributeID: number;
  categoryID: number;
  name: string;
  label: string;
  data_type: string;
  required: boolean;
  default_value: string;
  placeholder: string;
  unit: string;
  options: string[] | null;
  order: number;
  is_active: boolean;
  Category?: Category;
};

export default function AddAttributePage() {
  const methods = useForm<AttributeFormValues>();
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<(Partial<Omit<Attribute, "options">> & { options?: string }) | null>(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/category`)
      .then((res) => res.json())
      .then((data) => setCategories(data || []));
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/attribute`);
      if (res.ok) {
        const data = await res.json();
        setAttributes(data);
      }
    } catch {
      // ignore
    }
  };

  const onSubmit = async (data: AttributeFormValues) => {
    setMessage("");
    const optionsArr = data.options
      ? data.options.split(",").map((opt) => opt.trim()).filter(Boolean)
      : undefined;

    const res = await fetch(`${baseUrl}/api/attribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        categoryID: Number(data.categoryID),
        order: Number(data.order),
        options: optionsArr,
      }),
    });
    if (res.ok) {
      setMessage("Attribute added successfully!");
      methods.reset();
      fetchAttributes();
    } else {
      setMessage("Failed to add attribute.");
    }
  };

  // Delete attribute
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this attribute?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/attribute/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Attribute deleted.");
        fetchAttributes();
      } else {
        setMessage("Failed to delete attribute.");
      }
    } catch {
      setMessage("Failed to delete attribute.");
    }
  };

  // Start editing
  const startEdit = (attr: Attribute) => {
    setEditID(attr.attributeID);
    setEditForm({
      ...attr,
      options: Array.isArray(attr.options) ? attr.options.join(", ") : "",
    });
  };

  // Save edit
  const handleEditSave = async (id: number) => {
    if (!editForm) return;
    const optionsArr =
      typeof editForm.options === "string"
        ? editForm.options.split(",").map((opt) => opt.trim()).filter(Boolean)
        : editForm.options;
    try {
      const res = await fetch(`${baseUrl}/api/attribute/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          categoryID: Number(editForm.categoryID),
          order: Number(editForm.order),
          options: optionsArr,
        }),
      });
      if (res.ok) {
        setMessage("Attribute updated.");
        setEditID(null);
        setEditForm(null);
        fetchAttributes();
      } else {
        setMessage("Failed to update attribute.");
      }
    } catch {
      setMessage("Failed to update attribute.");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Attribute</h1>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* ...existing form fields... */}
          <FormField
            name="categoryID"
            control={methods.control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select {...field} defaultValue="">
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.categoryID} value={cat.categoryID}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="name"
            control={methods.control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="label"
            control={methods.control}
            rules={{ required: "Label is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="data_type"
            control={methods.control}
            rules={{ required: "Data type is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Type</FormLabel>
                <FormControl>
                  <select {...field} defaultValue="">
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="select">Select (options)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="required"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="default_value"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="placeholder"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="unit"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="options"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Options (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Red,Green,Blue" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="order"
            control={methods.control}
            rules={{ required: "Order is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="is_active"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-4">
            Add Attribute
          </Button>
          {message && <div className="mt-2 text-green-600">{message}</div>}
        </form>
      </Form>

      <h2 className="text-xl font-semibold mt-10 mb-2">Attribute List</h2>
      <div className="space-y-2">
        {attributes.map((attr) =>
          editID === attr.attributeID && editForm ? (
            <div key={attr.attributeID} className="flex flex-wrap gap-2 items-center border-b py-2">
              <select
                className="border px-2 py-1"
                value={editForm.categoryID}
                onChange={e => setEditForm({ ...editForm, categoryID: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <option key={cat.categoryID} value={cat.categoryID}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <input
                className="w-24 border px-2 py-1"
                value={editForm.name || ""}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="w-24 border px-2 py-1"
                value={editForm.label || ""}
                onChange={e => setEditForm({ ...editForm, label: e.target.value })}
              />
              <select
                className="border px-2 py-1"
                value={editForm.data_type}
                onChange={e => setEditForm({ ...editForm, data_type: e.target.value })}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>
              <input
                type="checkbox"
                checked={!!editForm.required}
                onChange={e => setEditForm({ ...editForm, required: e.target.checked })}
              /> Required
              <input
                className="w-20 border px-2 py-1"
                value={editForm.default_value || ""}
                onChange={e => setEditForm({ ...editForm, default_value: e.target.value })}
              />
              <input
                className="w-20 border px-2 py-1"
                value={editForm.placeholder || ""}
                onChange={e => setEditForm({ ...editForm, placeholder: e.target.value })}
              />
              <input
                className="w-12 border px-2 py-1"
                value={editForm.unit || ""}
                onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
              />
              <input
                className="w-32 border px-2 py-1"
                value={typeof editForm.options === "string" ? editForm.options : ""}
                onChange={e => setEditForm({ ...editForm, options: e.target.value })}
                placeholder="Options"
              />
              <input
                className="w-12 border px-2 py-1"
                type="number"
                value={editForm.order || ""}
                onChange={e => setEditForm({ ...editForm, order: Number(e.target.value) })}
              />
              <input
                type="checkbox"
                checked={!!editForm.is_active}
                onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
              /> Active
              <button
                className="px-2 py-1 bg-green-500 text-white rounded"
                onClick={() => handleEditSave(attr.attributeID)}
              >
                Save
              </button>
              <button
                className="px-2 py-1 bg-gray-300 rounded"
                onClick={() => {
                  setEditID(null);
                  setEditForm(null);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div key={attr.attributeID} className="flex flex-wrap gap-2 items-center border-b py-2">
              <span className="font-medium">{attr.name}</span>
              <span className="text-gray-500 text-sm">{attr.label}</span>
              <span className="text-xs">{attr.data_type}</span>
              <span className="text-xs">{attr.required ? "Required" : ""}</span>
              <span className="text-xs">{attr.default_value}</span>
              <span className="text-xs">{attr.placeholder}</span>
              <span className="text-xs">{attr.unit}</span>
              <span className="text-xs">{attr.options?.join(", ")}</span>
              <span className="text-xs">Order: {attr.order}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{attr.is_active ? "Active" : "Inactive"}</span>
              <span className="text-xs">{attr.Category?.categoryName}</span>
              <button
                className="px-2 py-1 bg-yellow-500 text-white rounded"
                onClick={() => startEdit(attr)}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete(attr.attributeID)}
              >
                Delete
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
}