"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";

type TagFormValues = {
  tagName: string;
};

type Tag = {
  tagID: number;
  tagName: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AddTagPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagFormValues>();
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch current tags
  const fetchTags = async () => {
    const res = await fetch(`${baseUrl}/api/tag`);
    if (res.ok) {
      const data = await res.json();
      setTags(data);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const onSubmit = async (data: TagFormValues) => {
    setMessage("");
    const res = await fetch(`${baseUrl}/api/tag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Tag added successfully!");
      reset();
      fetchTags();
    } else {
      setMessage("Failed to add tag.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Tag</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tag Name</label>
          <Input {...register("tagName", { required: true })} />
          {errors.tagName && (
            <div className="text-red-500 text-sm mt-1">Tag name is required</div>
          )}
        </div>
        <Button type="submit" className="mt-4">Add Tag</Button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Current Tags</h2>
        <ul className="list-disc pl-5">
          {tags.map(tag => (
            <li key={tag.tagID}>
              {tag.tagName}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}