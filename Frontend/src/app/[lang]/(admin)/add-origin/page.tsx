"use client"
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form/form";

type OriginFormValues = {
  originName: string;
  image: FileList;
};

type Origin = {
  originID: number;
  originName: string;
  originImage: string;
};

export default function AddOriginPage() {
  const methods = useForm<OriginFormValues>();
  const { register, handleSubmit, reset, formState: { errors } } = methods;
  const [message, setMessage] = useState("");
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);

  // Fetch all origins
  const fetchOrigins = async () => {
    const res = await fetch(`${baseUrl}/api/origin`);
    if (res.ok) {
      const data = await res.json();
      setOrigins(data);
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

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
      imageUrl = uploadData.url || uploadData.path || "";
    } catch {
      setMessage("Image upload failed.");
      return;
    }

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
      fetchOrigins();
    } else {
      setMessage("Failed to add origin.");
    }
  };

  // Delete origin
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this origin?")) return;
    const res = await fetch(`${baseUrl}/api/origin/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage("Origin deleted.");
      fetchOrigins();
    } else {
      setMessage("Failed to delete origin.");
    }
  };

  // Start editing
  const startEdit = (origin: Origin) => {
    setEditID(origin.originID);
    setEditName(origin.originName);
    setEditImage(null);
  };

  // Save edit
  const handleEditSave = async (originID: number) => {
    let imageUrl = "";
    if (editImage) {
      // Upload new image if selected
      const formData = new FormData();
      formData.append("file", editImage);
      try {
        const uploadRes = await fetch(`${baseUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || uploadData.path || "";
      } catch {
        setMessage("Image upload failed.");
        return;
      }
    }

    try{
        // Delete old image if a new one is uploaded
      if (imageUrl && origins.find(o => o.originID === originID)?.originImage) {
        const oldImage = origins.find(o => o.originID === originID)?.originImage;
        console.log("Old Image URL:", oldImage); // Debugging line
        if (oldImage) {
          await fetch(`${baseUrl}/api/upload/single-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldImage }),
          });
        }
      }
    }catch( error){
      setMessage("Failed to delete old image.");
      console.error("Error deleting old image:", error);
      return;
    }

    const res = await fetch(`${baseUrl}/api/origin/${originID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originName: editName,
        ...(imageUrl ? { originImage: imageUrl } : {}),
      }),
    });
    if (res.ok) {
      setMessage("Origin updated.");
      // Update the local orgins state
      setOrigins(origins.map(o => 
        o.originID === originID ? { ...o, originName: editName, originImage: imageUrl || o.originImage } : o
      ));
      setEditID(null);
      fetchOrigins();
    } else {
      setMessage("Failed to update origin.");
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

      <h2 className="text-xl font-semibold mt-10 mb-2">Origin List</h2>
      <div className="space-y-2">
        {origins.map(origin => (
          <div key={origin.originID} className="flex items-center gap-2 border-b py-2">
            {editID === origin.originID ? (
              <>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-32"
                />
                <input
                  type="file"
                  onChange={e => setEditImage(e.target.files?.[0] || null)}
                  className="w-40"
                />
                <Button size="sm" onClick={() => handleEditSave(origin.originID)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditID(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="font-medium">{origin.originName}</span>
                {origin.originImage && (
                  <img src={origin.originImage} alt={origin.originName} className="w-12 h-12 object-cover rounded" />
                )}
                <Button size="sm" variant="outline" onClick={() => startEdit(origin)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(origin.originID)}>Delete</Button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}