"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";

type ProductFormValues = {
  productName: string;
  productPrice: string;
  quantityAvailable: string;
  categoryID: string;
  originID: string;
  subcategoryID: string;
  tagIDs: string[];
  images: FileList;
};

type Category = {
  categoryID: string;
  categoryName: string;
};
type Subcategory = {
  subcategoryID: string;
  subcategoryName: string;
};
type Origin = {
  originID: string;
  originName: string;
};

type Tag = {
  tagID: string;
  tagName: string;
};


export default function AddProductPage() {
  const methods = useForm<ProductFormValues>();
  const { register, handleSubmit, reset, watch, formState: { errors } } = methods;
  const [message, setMessage] = useState("");

  // State for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch categories, origins, tags on mount
  useEffect(() => {
    fetch("http://localhost:3000/api/category")
      .then(res => res.json())
      .then(data => setCategories(data || []));
    fetch("http://localhost:3000/api/origin")
      .then(res => res.json())
      .then(data => setOrigins(data || []));
    fetch("http://localhost:3000/api/tag")
      .then(res => res.json())
      .then(data => setTags(data || []));
  }, []);

  // Watch categoryID and fetch subcategories when it changes
  const selectedCategoryID = watch("categoryID");
  useEffect(() => {
    if (selectedCategoryID) {
      fetch(`http://localhost:3000/api/subcategory?categoryID=${selectedCategoryID}`)
        .then(res => res.json())
        .then(data => setSubcategories(data || []));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryID]);

  const onSubmit = async (data: ProductFormValues) => {
    setMessage("");

    // 1. Upload images
    let uploadedImages: string[] = [];
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      Array.from(data.images).forEach((file) => formData.append("files", file));
      const uploadRes = await fetch("http://localhost:3000/api/upload/multiple", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      uploadedImages = (uploadData.files as { url: string }[])?.map((f) => f.url) || [];
    }

    // 2. Submit product
    const res = await fetch("http://localhost:3000/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        productPrice: parseFloat(data.productPrice),
        quantityAvailable: parseInt(data.quantityAvailable, 10),
        tagIDs: data.tagIDs,
        images: uploadedImages,
      }),
    });
    if (res.ok) {
      setMessage("Product added successfully!");
      reset();
    } else {
      setMessage("Failed to add product.");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...register("productName", { required: true })} />
            </FormControl>
            {errors.productName && <FormMessage>Product name is required</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input type="number" {...register("productPrice", { required: true })} />
            </FormControl>
            {errors.productPrice && <FormMessage>Price is required</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input type="number" {...register("quantityAvailable", { required: true })} />
            </FormControl>
            {errors.quantityAvailable && <FormMessage>Quantity is required</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <select {...register("categoryID", { required: true })} defaultValue="">
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
                ))}
              </select>
            </FormControl>
            {errors.categoryID && <FormMessage>Category is required</FormMessage>}
          </FormItem>
          <FormItem>
            <FormLabel>Subcategory</FormLabel>
            <FormControl>
              <select {...register("subcategoryID")} defaultValue="">
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.subcategoryID} value={sub.subcategoryID}>{sub.subcategoryName}</option>
                ))}
              </select>
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Origin</FormLabel>
            <FormControl>
              <select {...register("originID")}>
                <option value="">Select origin</option>
                {origins.map((origin) => (
                  <option key={origin.originID} value={origin.originID}>{origin.originName}</option>
                ))}
              </select>
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <select multiple {...register("tagIDs")}>
                {tags.map((tag) => (
                  <option key={tag.tagID} value={tag.tagID}>{tag.tagName}</option>
                ))}
              </select>
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Images</FormLabel>
            <FormControl>
              <Input type="file" multiple {...register("images")} />
            </FormControl>
          </FormItem>
          <Button type="submit" className="mt-4">Add Product</Button>
          {message && <FormMessage className="mt-2">{message}</FormMessage>}
        </form>
      </FormProvider>
    </main>
  );
}