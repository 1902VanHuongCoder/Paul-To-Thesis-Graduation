"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { baseUrl } from "@/lib/base-url";
type ProductFormValues = {
  productName: string;
  productPrice: string;
  quantityAvailable: string;
  categoryID: string;
  originID: string;
  subcategoryID: string;
  tagIDs: string[];
  images: FileList;
  [key: `attribute_${number}`]: number | string | boolean | Date; // Dynamic attributes
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

type Attribute = {
  attributeID: number;
  name: string;
  label: string;
  data_type: string;
  required: boolean;
  default_value: string | null;
  placeholder: string | null;
  unit: string | null;
  options: string[] | null;
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
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Fetch categories, origins, tags on mount
  useEffect(() => {
    fetch(`${baseUrl}/api/category`)
      .then(res => res.json())
      .then(data => setCategories(data || []));
    fetch(`${baseUrl}/api/origin`)
      .then(res => res.json())
      .then(data => setOrigins(data || []));
    fetch(`${baseUrl}/api/tag`)
      .then(res => res.json())
      .then(data => setTags(data || []));
  }, []);

  // Watch categoryID and fetch subcategories when it changes
  const selectedCategoryID = watch(`categoryID`);
  useEffect(() => {
    if (selectedCategoryID) {
      fetch(`${baseUrl}/api/subcategory?categoryID=${selectedCategoryID}`)
        .then(res => res.json())
        .then(data => setSubcategories(data || []));
      // Fetch attributes for this category
      fetch(`${baseUrl}/api/attribute?categoryID=${selectedCategoryID}`)
        .then(res => res.json())
        .then(data => setAttributes(data || []));
    } else {
      setSubcategories([]);
      setAttributes([]);
    }
  }, [selectedCategoryID]);

  // Handle dynamic attribute fields
  const renderAttributeField = (attr: Attribute) => {
    const fieldName = `attribute_${attr.attributeID}`;
    switch (attr.data_type) {
      case "string":
        return (
          <FormItem key={attr.attributeID}>
            <FormLabel>{attr.label}{attr.unit ? ` (${attr.unit})` : ""}</FormLabel>
            <FormControl>
              <Input
                {...register(fieldName as keyof ProductFormValues, { required: attr.required })}
                placeholder={attr.placeholder || ""}
                defaultValue={attr.default_value || ""}
              />
            </FormControl>
            {(errors as Record<string, never>)[fieldName] && <FormMessage>This field is required</FormMessage>}
          </FormItem>
        );
      case "number":
        return (
          <FormItem key={attr.attributeID}>
            <FormLabel>{attr.label}{attr.unit ? ` (${attr.unit})` : ""}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...register(fieldName as keyof ProductFormValues, { required: attr.required, valueAsNumber: true })}
                placeholder={attr.placeholder || ""}
                defaultValue={attr.default_value || ""}
              />
            </FormControl>
            {(errors as Record<string, never>)[fieldName] && <FormMessage>This field is required</FormMessage>}
          </FormItem>
        );
      case "boolean":
        return (
          <FormItem key={attr.attributeID}>
            <FormLabel>{attr.label}</FormLabel>
            <FormControl>
              <input
                type="checkbox"
                {...register(fieldName as keyof ProductFormValues)}
                defaultChecked={attr.default_value === "true"}
              />
            </FormControl>
          </FormItem>
        );
      case "date":
        return (
          <FormItem key={attr.attributeID}>
            <FormLabel>{attr.label}</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...register(fieldName as keyof ProductFormValues, { required: attr.required })}
                defaultValue={attr.default_value || ""}
              />
            </FormControl>
            {(errors as Record<string, never>)[fieldName] && <FormMessage>This field is required</FormMessage>}
          </FormItem>
        );
      case "select":
        return (
          <FormItem key={attr.attributeID}>
            <FormLabel>{attr.label}</FormLabel>
            <FormControl>
              <select
                {...register(fieldName as keyof ProductFormValues, { required: attr.required })}
                defaultValue={attr.default_value || ""}
              >
                <option value="" disabled>Select {attr.label}</option>
                {attr.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </FormControl>
            {(errors as never)[fieldName] && <FormMessage>This field is required</FormMessage>}
          </FormItem>
        );
      default:
        return null;
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setMessage("");

    // 1. Upload images
    let uploadedImages: string[] = [];
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      Array.from(data.images).forEach((file) => formData.append("files", file));
      const uploadRes = await fetch(`${baseUrl}/api/upload/multiple`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      uploadedImages = (uploadData.files as { url: string }[])?.map((f) => f.url) || [];
    }

    // 2. Collect dynamic attribute values
    
    const attributesPayload = attributes.map(attr => (
      {
      attributeID: attr.attributeID,
      value: data["attribute_" + attr.attributeID as keyof ProductFormValues]
    }));

    // 3. Submit product
    const res = await fetch(`${baseUrl}/api/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        productPrice: parseFloat(data.productPrice),
        quantityAvailable: parseInt(data.quantityAvailable, 10),
        tagIDs: data.tagIDs,
        images: uploadedImages,
        attributes: attributesPayload,
      }),
    });

    console.log({
      ...data,
      productPrice: parseFloat(data.productPrice),
      quantityAvailable: parseInt(data.quantityAvailable, 10),
      tagIDs: data.tagIDs,
      images: uploadedImages,
      attributes: attributesPayload,
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
                {tags.length > 0 && tags.map((tag) => (
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

          {message && <FormMessage className="mt-2">{message}</FormMessage>}
          {attributes.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Product Specifics</h2>
              {attributes.map((item) => (
                renderAttributeField(item)
              ))}
            </div>
          )}<Button type="submit" className="mt-4">Add Product</Button>
        </form>
      </FormProvider>
    </main>
  );
}