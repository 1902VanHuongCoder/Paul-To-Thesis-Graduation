"use client";

import { baseUrl } from "@/lib/others/base-url";
import { useState, useEffect } from "react";
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
};

export default function AddDiscountPage() {
  const [form, setForm] = useState<Discount>({
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
  const [loading, setLoading] = useState(false);

  // List state
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editID, setEditID] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Discount | null>(null);

  function generateDiscountCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePart = yy + mm + dd;
    const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
    return `DIR${datePart}${randomChar}`;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : type === "number"
        ? Number(value)
        : value,
    }));
  };

  // Edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editForm) return;
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox"
        ? checked
        : type === "number"
        ? Number(value)
        : value,
    });
  };

  // Fetch all discounts
  const fetchDiscounts = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/discount`);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add discount");
      toast.success("Discount added successfully!");
      setForm({
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
      fetchDiscounts();
    } catch {
      toast.error("Failed to add discount!");
    } finally {
      setLoading(false);
    }
  };

  // Delete discount
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/discount/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Discount deleted.");
        fetchDiscounts();
      } else {
        toast.error("Failed to delete discount.");
      }
    } catch {
      toast.error("Failed to delete discount.");
    }
  };

  // Start editing
  const startEdit = (discount: Discount) => {
    setEditID(discount.discountID);
    setEditForm({ ...discount });
  };

  // Save edit
  const handleEditSave = async (id: string) => {
    if (!editForm) return;
    try {
      const res = await fetch(`${baseUrl}/api/discount/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Discount updated.");
        setEditID(null);
        setEditForm(null);
        fetchDiscounts();
      } else {
        toast.error("Failed to update discount.");
      }
    } catch {
      toast.error("Failed to update discount.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Discount</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ...existing form fields... */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="discountDescription"
            value={form.discountDescription}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Discount Percent (%)</label>
          <input
            type="number"
            name="discountPercent"
            value={form.discountPercent}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
            max={100}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Expire Date</label>
          <input
            type="date"
            name="expireDate"
            value={form.expireDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Discount Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="discountID"
              value={form.discountID}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter or generate code"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded font-semibold"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  discountID: generateDiscountCode(),
                }))
              }
            >
              Generate
            </button>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Usage Limit</label>
          <input
            type="number"
            name="usageLimit"
            value={form.usageLimit}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Min Order Value</label>
          <input
            type="number"
            name="minOrderValue"
            value={form.minOrderValue}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Max Discount Amount</label>
          <input
            type="number"
            name="maxDiscountAmount"
            value={form.maxDiscountAmount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            id="isActive"
          />
          <label htmlFor="isActive" className="font-medium">Active</label>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Discount"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-10 mb-2">Discount List</h2>
      <div className="space-y-2">
        {discounts.map((discount) => (
          <div key={discount.discountID} className="flex items-center gap-2 border-b py-2">
            {editID === discount.discountID && editForm ? (
              <>
                <input
                  className="w-32 border px-2 py-1"
                  name="discountDescription"
                  value={editForm.discountDescription}
                  onChange={handleEditChange}
                />
                <input
                  className="w-16 border px-2 py-1"
                  type="number"
                  name="discountPercent"
                  value={editForm.discountPercent}
                  onChange={handleEditChange}
                />
                <input
                  className="w-28 border px-2 py-1"
                  type="date"
                  name="expireDate"
                  value={editForm.expireDate?.slice(0, 10)}
                  onChange={handleEditChange}
                />
                <input
                  className="w-24 border px-2 py-1"
                  name="discountID"
                  value={editForm.discountID}
                  onChange={handleEditChange}
                  disabled
                />
                <input
                  className="w-16 border px-2 py-1"
                  type="number"
                  name="usageLimit"
                  value={editForm.usageLimit}
                  onChange={handleEditChange}
                />
                <input
                  className="w-16 border px-2 py-1"
                  type="number"
                  name="minOrderValue"
                  value={editForm.minOrderValue}
                  onChange={handleEditChange}
                />
                <input
                  className="w-16 border px-2 py-1"
                  type="number"
                  name="maxDiscountAmount"
                  value={editForm.maxDiscountAmount}
                  onChange={handleEditChange}
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditChange}
                  />
                  Active
                </label>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleEditSave(discount.discountID)}
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
              </>
            ) : (
              <>
                <span className="font-medium">{discount.discountDescription}</span>
                <span className="text-gray-500 text-sm">{discount.discountPercent}%</span>
                <span className="text-gray-500 text-sm">{discount.expireDate?.slice(0, 10)}</span>
                <span className="text-xs text-gray-400">{discount.discountID}</span>
                <span className="text-xs">Limit: {discount.usageLimit}</span>
                <span className="text-xs">Min: {discount.minOrderValue}</span>
                <span className="text-xs">Max: {discount.maxDiscountAmount}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{discount.isActive ? "Active" : "Inactive"}</span>
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => startEdit(discount)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(discount.discountID)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}