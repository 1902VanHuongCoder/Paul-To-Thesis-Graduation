"use client"
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form/form";

type OriginFormValues = {
  originName: string;
  image: FileList;
};

export default function AddOriginPage() {
  const methods = useForm<OriginFormValues>();
  const { register, handleSubmit, reset, formState: { errors } } = methods;
  const [message, setMessage] = useState("");

  const onSubmit = async (data: OriginFormValues) => {
    setMessage("");
    if (!data.image || data.image.length === 0) {
      setMessage("Please select an image.");
      return;
    }
    // Upload image
    const formData = new FormData();
    formData.append("file", data.image[0]);
    let imageUrl = "";
    try {
      const uploadRes = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url || uploadData.path || ""; // adjust according to your API response
    } catch {
      setMessage("Image upload failed.");
      return;
    }

    console.log({
      originName: data.originName,
      image: imageUrl,
    })

    // Save origin with image URL
    const originRes = await fetch(`${baseUrl}/api/origin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: data.originName,
        originImage: imageUrl,
      }),
    });

    if (originRes.ok) {
      setMessage("Origin added successfully!");
      reset();
    } else {
      setMessage("Failed to add origin.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Origin</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Origin Name</label>
            <Input {...register("originName", { required: true })} />
            {errors.originName && (
              <div className="text-red-500 text-sm mt-1">Origin name is required</div>
            )}
          </div>
          <FormItem>
            <FormLabel>Images</FormLabel>
            <FormControl>
              <Input type="file" {...register("image", { required: true })} />
            </FormControl>
            {errors.image && (
              <div className="text-red-500 text-sm mt-1">Image is required</div>
            )}
          </FormItem>
          <Button type="submit" className="mt-4">Add Origin</Button>
          {message && <div className="mt-2 text-green-600">{message}</div>}
        </form>
      </FormProvider>
    </main>
  );
}