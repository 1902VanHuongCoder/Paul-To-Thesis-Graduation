"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { baseUrl } from "@/lib/base-url";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Gapcursor from "@tiptap/extension-gapcursor";
import NextImage from "next/image";
import formatVND from "@/lib/format-vnd";

type Category = {
  categoryID: number;
  categoryName: string;
};
type SubCategory = {
  subcategoryID: number;
  subcategoryName: string;
};
type Origin = {
  originID: number;
  originName: string;
};
type Tag = {
  tagID: number;
  tagName: string;
};


type Product = {
  productID: number;
  category: Category;
  origin: Origin;
  subcategory: SubCategory;
  Tags: Tag[];
  productName: string;
  productPrice: number;
  productPriceSale: number;
  quantityAvailable: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  description: string;
  descriptionImages: string[];
  images: string[];
  isShow: boolean;
  expiredAt: Date | null;
  unit: string;
};

type ProductFormValues = {
  productName: string;
  productPrice: string;
  productPriceSale: string;
  quantityAvailable: string;
  categoryID: string;
  subcategoryID: string;
  originID: string;
  tagIDs: string[];
  images: FileList;
  isShow: boolean;
  expiredAt: Date | null;
  unit: string;
};

export default function EditProductPage() {
  // const router = useRouter();
  const params = useParams();
  const productID = params?.productID as string;

  const methods = useForm<ProductFormValues>();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);

  const [origins, setOrigins] = useState<Origin[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [productImages, setProductImages] = useState<string[] | null>(null);
  const [oldProductImages, setOldProductImages] = useState<string[]>([]);

  const [editorImages, setEditorImages] = useState<File[]>([]);
  console.log("Editor images:", editorImages);

  const [oldDescImages, setOldDescImages] = useState<string[]>([]);
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [productDescription, setProductDescription] = useState<string | null>(null);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      BulletList,
      ListItem,
      Paragraph,
      Text,
      TaskList,
      HorizontalRule,
      TaskItem.configure({
        nested: true,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'text-gray-900 dark:text-white font-bold',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p>Loading...</p>",
    onUpdate({ editor }) {
      const newUrls = extractImageUrls(editor.getJSON());
      // Find deleted images
      descriptionImages.forEach((url, idx) => {
        if (!newUrls.includes(url)) {
          handleUpdateDescriptionImage(idx);
        }
      });
    }
  });

  // Fetch all dropdown data
  useEffect(() => {
    fetch(`${baseUrl}/api/category`).then(res => res.json()).then(setCategories);
    fetch(`${baseUrl}/api/subcategory`).then(res => res.json()).then(setSubcategories);
    fetch(`${baseUrl}/api/origin`).then(res => res.json()).then(setOrigins);
    fetch(`${baseUrl}/api/tag`).then(res => res.json()).then(setTags);
  }, []);

  // Fetch product info
  useEffect(() => {
    if (!productID) return;
    fetch(`${baseUrl}/api/product/${productID}`)
      .then(res => res.json())
      .then((prod: Product) => {
        console.log("Fetched product:", prod);
        // Set form values
        setValue("productName", prod.productName);
        setValue("productPrice", String(prod.productPrice));
        setValue("productPriceSale", String(prod.productPriceSale || ""));
        setValue("quantityAvailable", String(prod.quantityAvailable));
        setValue("categoryID", String(prod.category?.categoryID || ""));
        setValue("subcategoryID", String(prod.subcategory?.subcategoryID || ""));
        setValue("originID", String(prod.origin?.originID || ""));
        setValue("tagIDs", prod.Tags?.map(t => String(t.tagID)) || []);

        setOldProductImages(prod.images || []);
        setProductImages(prod.images || []);

        setOldDescImages(prod.descriptionImages || []);
        console.log("Old description images:", prod.descriptionImages);
        setDescriptionImages(prod.descriptionImages || []);

        setProductDescription(prod.description || "");
        setEditorLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productID]);

  // Fetch subcategories and attributes when category changes
  const selectedCategoryID = watch("categoryID");
  useEffect(() => {
    if (selectedCategoryID) {
      fetch(`${baseUrl}/api/subcategory?categoryID=${selectedCategoryID}`)
        .then(res => res.json())
        .then(setSubcategories);
      fetch(`${baseUrl}/api/attribute?categoryID=${selectedCategoryID}`)
        .then(res => res.json())

    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryID]);

  // Submit handler
  const onSubmit = async (data: ProductFormValues) => {
    setMessage("");
    // Upload new images if any
    let uploadedUrls: string[] = [];
    const filesToUpload: File[] = [];

    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach(file => filesToUpload.push(file));
    }
    if (editorImages.length > 0) {
      editorImages.forEach(file => filesToUpload.push(file));
    }
    console.log("Form data:", filesToUpload);
    try {
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(file => formData.append("files", file));
        const uploadRes = await fetch(`${baseUrl}/api/upload/multiple`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        uploadedUrls = (uploadData.files as { url: string }[]).map(f => f.url) || [];
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setMessage("Failed to upload images.");
      return;
    }

    // Replace local URLs in editor content with uploaded URLs
    let content = editor?.getJSON();
    let urlIndex = data.images ? data.images.length : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function replaceEditorImageUrls(node: any): any {
      if (!node) return node;
      if (Array.isArray(node)) return node.map(replaceEditorImageUrls);
      if (node.type === "image" && node.attrs?.src?.startsWith("blob:")) {
        const url = uploadedUrls[urlIndex++];
        return { ...node, attrs: { ...node.attrs, src: url } };
      }
      if (node.content) return { ...node, content: replaceEditorImageUrls(node.content) };
      return node;
    }
    try { content = replaceEditorImageUrls(content); } catch { }

    const newProductImages = data.images ? [...(productImages ?? []), ...uploadedUrls.slice(0, data.images.length)].filter(Boolean) : productImages ?? [];

    const newDescImages = editorImages.length > 0 ? [...descriptionImages, ...uploadedUrls.slice(data.images ? data.images.length : 0)].filter(Boolean) : descriptionImages;

    console.log("New product images:", newProductImages);
    console.log("New description images:", newDescImages);


    //Delete product images if they are not in the new product images 
    const oldImages = oldProductImages.filter(img => !newProductImages?.includes(img));
    const oldDescImagesToDelete = oldDescImages.filter(img => !(Array.isArray(newDescImages) ? newDescImages.includes(img) : false));

    // Delete old images from server
    const imagesToDelete = [...oldImages, ...oldDescImagesToDelete];

    console.log("Images to delete:", imagesToDelete);

    if (imagesToDelete.length > 0) {
      try {
        await fetch(`${baseUrl}/api/upload/multi-delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: imagesToDelete }),
        });
      } catch (error) {
        console.error("Failed to delete old images:", error);
        setMessage("Failed to delete old images.");
        return;
      }
    }

    console.log("Submitting product data:", {
      productName: data.productName,
      productPrice: data.productPrice ? parseFloat(data.productPrice) : 0,
      productPriceSale: data.productPriceSale ? parseFloat(data.productPriceSale) : null,
      quantityAvailable: parseInt(data.quantityAvailable, 10),
      categoryID: Number(data.categoryID),
      subcategoryID: Number(data.subcategoryID),
      originID: Number(data.originID),
      tagIDs: data.tagIDs.map(Number),
      images: newProductImages,
      descriptionImages: newDescImages,
      description: JSON.stringify(content)
    });

    try {
      const res = await fetch(`${baseUrl}/api/product/${productID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: data.productName,
          productPrice: data.productPrice ? parseFloat(data.productPrice) : 0,
          productPriceSale: data.productPriceSale ? parseFloat(data.productPriceSale) : null,
          quantityAvailable: parseInt(data.quantityAvailable, 10),
          categoryID: Number(data.categoryID),
          subcategoryID: Number(data.subcategoryID),
          originID: Number(data.originID),
          tagIDs: data.tagIDs.map(Number),
          images: newProductImages,
          descriptionImages: newDescImages,
          description: JSON.stringify(content),
          isShow: data.isShow,
          expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
        }),
      });
      if (res.ok) {
        setMessage("Product updated successfully!");
      } else {
        setMessage("Failed to update product.");
      }
    } catch (error) {
      console.error("Update product error:", error);
      setMessage("Failed to update product.");
    }
  };

  // Utility to extract all image URLs from TipTap JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractImageUrls(node: any): string[] {
    if (!node) return [];
    let urls: string[] = [];
    if (Array.isArray(node)) {
      node.forEach(child => { urls = urls.concat(extractImageUrls(child)); });
    } else if (node.type === "image" && node.attrs?.src) {
      urls.push(node.attrs.src);
    }
    if (node.content) {
      urls = urls.concat(extractImageUrls(node.content));
    }
    return urls;
  }

  const handleUpdateProductImage = (index: number) => {
    const imageUrl = oldProductImages[index];
    if (imageUrl) {
      setProductImages(prev => (prev ?? []).filter((_, idx) => idx !== index));
    }
  }

  const handleUpdateDescriptionImage = (index: number) => {
    const imageUrl = oldDescImages[index];
    if (imageUrl) {
      setDescriptionImages(prev => (prev ?? []).filter((_, idx) => idx !== index));
    }
  }

  useEffect(() => {
    if (editor && productDescription !== null) {
      try {
        editor.commands.setContent(JSON.parse(productDescription));
      } catch {
        editor.commands.setContent(productDescription);
      }
    }
  }, [editor, productDescription]);

  if (!editor || !editorLoaded) return <div>Loading...</div>;

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Cập Nhật Thông Tin Sản Phẩm</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormItem>
            <FormLabel className="text-gray-600">Tên sản phẩm</FormLabel>
            <FormControl>
              <Input {...register("productName", { required: true })} />
            </FormControl>
            {errors.productName && <FormMessage>Tên sản phẩm không được phép rỗng.</FormMessage>}
          </FormItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel className="text-gray-600">Giá </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  min={0}
                  step={1}
                  {...register("productPrice", {
                    required: "Giá sản phẩm không được phép rỗng.",
                    min: { value: 1, message: "Giá phải lớn hơn 0" },
                    setValueAs: v => {
                      const num = Number(v);
                      return num < 1000 ? num * 1000 : num;
                    },
                  })}
                  onBlur={e => {
                    const value = Number(e.target.value);
                    if (value > 0 && value < 1000) {
                      e.target.value = formatVND(value * 1000);
                    } else if (value >= 1000) {
                      e.target.value = formatVND(value);
                    } else {
                      e.target.value = "";
                    }
                  }}
                  placeholder="e.g. 100 (will be 100.000)"
                />
              </FormControl>
              {errors.productPrice && <FormMessage>{errors.productPrice.message || "Giá sản phẩm không được phép rỗng."}</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel className="text-gray-600">Giá giảm</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  min={0}
                  step={1}
                  {...register("productPriceSale", {
                    setValueAs: v => {
                      const num = Number(v);
                      return num < 1000 ? num * 1000 : num;
                    },
                  })}
                  onBlur={e => {
                    const value = Number(e.target.value);
                    if (value > 0 && value < 1000) {
                      e.target.value = formatVND(value * 1000);
                    } else if (value >= 1000) {
                      e.target.value = formatVND(value);
                    } else {
                      e.target.value = "";
                    }
                  }}
                  placeholder="e.g. 100 (will be 100.000)"
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel className="text-gray-600">Số lượng</FormLabel>
              <FormControl>
                <Input type="number" {...register("quantityAvailable", { required: true })} min={0} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel className="text-gray-600">Số lượng/thùng(lô)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...register("boxQuantity")}
                  defaultValue={oldProductImages.length > 0 ? watch("boxQuantity") : ""}
                />
              </FormControl>
            </FormItem>
            {/* Category, Subcategory, Origin */}
            <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
              <FormItem>
                <FormLabel className="text-gray-600">Danh mục</FormLabel>
                <FormControl>
                  <select {...register("categoryID", { required: true })} value={watch("categoryID") || ""} onChange={e => setValue("categoryID", e.target.value)}>
                    <option value="" disabled>Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Danh mục con</FormLabel>
                <FormControl>
                  <select {...register("subcategoryID")} value={watch("subcategoryID") || ""} onChange={e => setValue("subcategoryID", e.target.value)}>
                    <option value="" disabled>Chọn danh mục con</option>
                    {subcategories.map(sub => (
                      <option key={sub.subcategoryID} value={sub.subcategoryID}>{sub.subcategoryName}</option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Nhà sản xuất</FormLabel>
                <FormControl>
                  <select {...register("originID")} value={watch("originID") || ""} onChange={e => setValue("originID", e.target.value)}>
                    <option value="" disabled>Chọn nhà sản xuất</option>
                    {origins.map(origin => (
                      <option key={origin.originID} value={origin.originID}>{origin.originName}</option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            </div>
            {/* Unit, barcode, boxBarcode */}
            <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
              <FormItem>
                <FormLabel className="text-gray-600">Đơn vị sản phẩm</FormLabel>
                <FormControl>
                  <Input type="text" {...register("unit", { required: true })} />
                </FormControl>
                {errors.unit && <FormMessage>Đơn vị không được phép rỗng.</FormMessage>}
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Số mã vạch</FormLabel>
                <FormControl>
                  <Input type="text" {...register("barcode")} defaultValue={oldProductImages.length > 0 ? watch("barcode") : ""} />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Số mã vạch thùng (lô)</FormLabel>
                <FormControl>
                  <Input type="text" {...register("boxBarcode")} defaultValue={oldProductImages.length > 0 ? watch("boxBarcode") : ""} />
                </FormControl>
              </FormItem>
            </div>
            {/* Expired date, isShow */}
            <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
              <FormItem className="col-span-2">
                <FormLabel className="text-gray-600">Ngày hết hạn</FormLabel>
                <FormControl>
                  <Input type="date" {...register("expiredAt")} />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-gray-600">Hiển thị sản phẩm</FormLabel>
                <FormControl>
                  <Input type="checkbox" {...register("isShow")} checked={!!watch("isShow")} onChange={e => setValue("isShow", e.target.checked)} />
                </FormControl>
              </FormItem>
            </div>
            {/* Tags */}
            <FormItem>
              <FormLabel className="text-gray-600">Thẻ</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const selected = watch("tagIDs")?.includes(String(tag.tagID));
                    return (
                      <button
                        type="button"
                        key={tag.tagID}
                        className={`flex gap-x-2 items-center px-3 py-1 rounded-full border text-sm transition-colors hover:cursor-pointer ${selected ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"}`}
                        onClick={() => {
                          const current = watch("tagIDs") || [];
                          if (selected) {
                            setValue("tagIDs", current.filter(id => id !== String(tag.tagID)));
                          } else {
                            setValue("tagIDs", [...current, String(tag.tagID)]);
                          }
                        }}
                      >
                        <span>{tag.tagName}</span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
            </FormItem>
          </div>
          {/* Product Images */}
          <FormItem>
            <FormLabel className="text-gray-600">Ảnh sản phẩm</FormLabel>
            <FormControl>
              <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer`}>
                <Input type="file" multiple {...register("images")} />
                <span className="text-gray-500 text-sm mb-2">Kéo thả hoặc click để tải ảnh sản phẩm</span>
                <span className="text-xs text-gray-400">(Chọn nhiều ảnh được)</span>
              </div>
            </FormControl>
            <div className="flex gap-2 mt-2 flex-wrap">
              {/* Preview newly selected images */}
              {watch("images") && Array.from(watch("images")).map((file: File, idx: number) => (
                <div key={file.name + idx} className="relative group">
                  <NextImage
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    width={60}
                    height={60}
                    className="rounded object-cover w-[120px] h-[120px] border-dashed border-[2px]"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 group-hover:scale-110 transition hover:cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      const files = Array.from(watch("images"));
                      files.splice(idx, 1);
                      const dt = new DataTransfer();
                      files.forEach(f => dt.items.add(f));
                      setValue("images", dt.files as unknown as FileList);
                    }}
                    aria-label="Xóa ảnh mới"
                  >
                    X
                  </button>
                </div>
              ))}
              {/* Preview already uploaded images */}
              {productImages?.map((img, idx) => (
                <div key={img} className="relative group">
                  <NextImage src={img} alt="Product" width={60} height={60} className="rounded object-cover w-[120px] h-[120px] border-dashed border-[2px]" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 group-hover:scale-110 transition hover:cursor-pointer"
                    onClick={e => { e.stopPropagation(); handleUpdateProductImage(idx); }}
                    aria-label="Xóa ảnh đã tải lên"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </FormItem>
          {/* Editor */}
          <div>
            <label className="font-medium mb-1 block text-gray-600">Mô tả chi tiết sản phẩm</label>
            <div className="border rounded-lg bg-white dark:bg-gray-800">
              {/* You can add your Tabs and toolbar here as in your design */}
              <EditorContent editor={editor} className="tiptap-content min-h-[300px] p-3 focus:outline-none rounded-br-md rounded-bl-md focus:border-none" />
            </div>
          </div>
          <div className="flex justify-end"><Button variant="default" type="submit" className="">Cập nhật sản phẩm</Button></div>
        </form>
      </FormProvider>
      <style jsx global>{`
        .tiptap-content:focus, .tiptap-content:focus-visible,
        .tiptap-content *:focus, .tiptap-content *:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .is-active {
          background-color: #e9e9e9;
          color: #000;
          border-color: #2563eb;
          padding: 0.2rem 0.5rem;
          border-radius: calc(var(--radius) - 2px);
        }
      `}</style>
    </div>
  );
}