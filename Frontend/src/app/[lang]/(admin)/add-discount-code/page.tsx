"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddDiscountPage() {
  const [form, setForm] = useState({
    discountDescription: "",
    discountPercent: 0,
    discountPriceBase: 0,
    expireDate: "",
    isActive: true,
    code: "",
    usageLimit: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add discount");
      toast.success("Discount added successfully!");
      setForm({
        discountDescription: "",
        discountPercent: 0,
        discountPriceBase: 0,
        expireDate: "",
        isActive: true,
        code: "",
        usageLimit: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
      });
    } catch {
      toast.error("Failed to add discount!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Discount</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block font-medium mb-1">Discount Price Base</label>
          <input
            type="number"
            name="discountPriceBase"
            value={form.discountPriceBase}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
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
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
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
    </div>
  );
}