"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/others/base-url";

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
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

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

  // Delete tag
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    const res = await fetch(`${baseUrl}/api/tag/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage("Tag deleted.");
      fetchTags();
    } else {
      setMessage("Failed to delete tag.");
    }
  };

  // Start editing
  const startEdit = (tag: Tag) => {
    setEditID(tag.tagID);
    setEditName(tag.tagName);
  };

  // Save edit
  const handleEditSave = async (id: number) => {
    const res = await fetch(`${baseUrl}/api/tag/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagName: editName }),
    });
    if (res.ok) {
      setMessage("Tag updated.");
      setEditID(null);
      fetchTags();
    } else {
      setMessage("Failed to update tag.");
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
        <ul className="space-y-2">
          {tags.map(tag => (
            <li key={tag.tagID} className="flex items-center gap-2">
              {editID === tag.tagID ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" onClick={() => handleEditSave(tag.tagID)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditID(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span>{tag.tagName}</span>
                  <Button size="sm" variant="outline" onClick={() => startEdit(tag)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(tag.tagID)}>Delete</Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}