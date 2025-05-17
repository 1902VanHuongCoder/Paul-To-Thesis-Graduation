"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";

type OriginFormValues = {
  originName: string;
};

export default function AddOriginPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<OriginFormValues>();
  const [message, setMessage] = useState("");

  const onSubmit = async (data: OriginFormValues) => {
    setMessage("");
    const res = await fetch("http://localhost:3000/api/origin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Origin added successfully!");
      reset();
    } else {
      setMessage("Failed to add origin.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Origin</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Origin Name</label>
          <Input {...register("originName", { required: true })} />
          {errors.originName && (
            <div className="text-red-500 text-sm mt-1">Origin name is required</div>
          )}
        </div>
        <Button type="submit" className="mt-4">Add Origin</Button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
    </main>
  );
}