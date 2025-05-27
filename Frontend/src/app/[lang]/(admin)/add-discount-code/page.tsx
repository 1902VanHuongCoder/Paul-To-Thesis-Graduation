"use client";

import { baseUrl } from "@/lib/base-url";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddDiscountPage() {
  const [form, setForm] = useState({
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

  function generateDiscountCode() {
    // "DIR" + YYMMDD + 1 random uppercase letter or digit (total 8 chars)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePart = yy + mm + dd; // 6 digits
    const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
    return `DIR${datePart}${randomChar}`; // e.g. DIR240527A
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
    </div>
  );
}