"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { baseUrl } from "@/lib/base-url";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Gapcursor from '@tiptap/extension-gapcursor'
import NextImage from 'next/image';
import formatVND from "@/lib/format-vnd";
import JsBarcode from 'jsbarcode';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { TrashIcon } from "lucide-react";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, ListChecks, Code2, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Minus, Table as TableIcon, Columns2, Rows2, Trash2, Merge, Split, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, SquareStack, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { Quote as QuoteIcon } from 'lucide-react';
import clsx from "clsx";
// import toast from "react-hot-toast";

type ProductFormValues = {
  productID: number;
  productName: string;
  productPrice?: number;
  quantityAvailable: number;
  categoryID: number;
  originID: number;
  subcategoryID: number;
  images: FileList;
  productPriceSale?: number;
  rating: number | null;
  createdAt: string;
  tagIDs: number[];
  isShow: boolean;
  expiredAt: Date | null;
  unit: string;
  barcode: string;
  boxBarcode: string;
};

type Category = {
  categoryID: string;
  categoryName: string;
};

type Subcategory = {
  subcategoryID: number;
  subcategoryName: string;
  quantityPerBox: number;
};
type Origin = {
  originID: string;
  originName: string;
};

type Tag = {
  tagID: string;
  tagName: string;
};

// Generate a EAN 13 valid barcode for a product 
function generateBarcode() {
  const countryCode = '893';
  const businessCode = '8386';
  let productCode = '';
  for (let i = 0; i < 4; i++) {
    productCode += Math.floor(Math.random() * 10).toString();
  }
  const barcode = countryCode + businessCode + productCode + '0'; 
  return barcode;
}

// Generate a barcode for a box of product
function generateBoxBarcode() {
  const countryCode = '893';
  const businessCode = '8386';
  let productCode = '';
  for (let i = 0; i < 4; i++) {
    productCode += Math.floor(Math.random() * 10).toString();
  }
  const barcode = countryCode + businessCode + productCode + '1';
  return barcode;
}

export default function AddProductPage() {
  const methods = useForm<ProductFormValues>();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = methods;
  const [, setMessage] = useState("");


  // State for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subCateIsChoosen, setSubCateIsChoosen] = useState<Subcategory>();
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editorImages, setEditorImages] = useState<File[]>([]);
  const [, setProducts] = useState<ProductFormValues[]>([]);
  const [barcode, setBarcode] = useState("");
  const [barcodeImage, setBarcodeImage] = useState<string>("");
  const [boxBarcode, setBoxBarcode] = useState<{ boxBarcode: string, boxBarcodeImage: string }>({ boxBarcode: "", boxBarcodeImage: "" })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryID]);

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
    content: '<p>Hello World! 🌎️</p>',
  })

  const onSubmit = async (data: ProductFormValues) => {
    const filesToUpload = [...editorImages]; // Start with editor images 
    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach(file => filesToUpload.unshift(file)); // Add product's images to the front of array (images in text editor will be replaced after)
    }
    let uploadedUrls: string[] = []; // Store uploaded file URLs 
    try {
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(file => formData.append("files", file));
        const uploadRes = await fetch(`${baseUrl}/api/upload/multiple`, {
          method: "POST",
          body: formData,
        })
        const data = await uploadRes.json();
        uploadedUrls = (data.files as { url: string }[]).map(f => f.url) || []; // Extract URLs from response 
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setMessage("Failed to upload images.");
      return;
    }

    // replace local URLs in editor content with uploaded URLs
    let content = editor?.getJSON();
    let urlIndex = data.images ? data.images.length : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function replaceEditorImageUrls(node: any): any {
      if (!node) return node;
      if (Array.isArray(node)) {
        return node.map(replaceEditorImageUrls);
      }
      if (node.type === "image" && node.attrs?.src?.startsWith("blob:")) {
        // Replace with uploaded URL
        const url = uploadedUrls[urlIndex++];
        return { ...node, attrs: { ...node.attrs, src: url } };
      }
      if (node.content) {
        return { ...node, content: replaceEditorImageUrls(node.content) };
      }
      return node;
    }
    try { content = replaceEditorImageUrls(content); } catch (error) { console.error("Error processing editor content:", error); }

    try {
      //  3. Submit product
      console.log("Submitting product with data:", {
        ...data,
        productPrice: data.productPrice ? parseFloat(data.productPrice.toString()) : 0,
        productPriceSale: data.productPriceSale ? parseFloat(data.productPriceSale.toString()) : 0,
        quantityAvailable: data.quantityAvailable,
        tagIDs: data.tagIDs,
        images: uploadedUrls.slice(0, data.images ? data.images.length : 0),
        descriptionImages: uploadedUrls.slice(data.images ? data.images.length : 0),
        description: JSON.stringify(content),
      }
      );
      alert(data.boxBarcode);
      const res = await fetch(`${baseUrl}/api/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          boxQuantity: 0, // Add box quantity if needed
          productPrice: data.productPrice ? data.productPrice : 0,
          productPriceSale: data.productPriceSale ? data.productPriceSale : 0,
          quantityAvailable: data.quantityAvailable,
          tagIDs: data.tagIDs,
          images: uploadedUrls.slice(0, data.images ? data.images.length : 0),
          descriptionImages: uploadedUrls.slice(data.images ? data.images.length : 0),
          description: JSON.stringify(content),
          isShow: data.isShow || false,
          expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
          unit: data.unit || "",
        }),
      });

      if (res.ok) {
        setMessage("Product added successfully!");
        reset();
      } else {
        setMessage("Failed to add product.");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      setMessage("Failed to add product.");
    }

  };

  const fetchProducts = async () => {
    const res = await fetch(`${baseUrl}/api/product`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);



  if (!editor) return null

  // Function to generate barcode image
  const handleGenerateBarcodeImage = () => {
    console.log("Generating barcode image for:", barcode);
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, { format: "EAN13", width: 2, height: 60, displayValue: true });
    setBarcodeImage(canvas.toDataURL("image/png"));
  };

  const handleGenerateBoxBarcodeImage = () => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, boxBarcode.boxBarcode, { format: "EAN13", width: 2, height: 60, displayValue: true });
    setBoxBarcode({ ...boxBarcode, boxBarcodeImage: canvas.toDataURL("image/png") })
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Thêm Sản Phẩm Mới</h1>
      <FormProvider {...methods}>
        <FormItem className="mb-4">
          <FormLabel>Tên sản phẩm</FormLabel>
          <FormControl>
            <Input {...register("productName", { required: true })} />
          </FormControl>
          {errors.productName && <FormMessage>Tên sản phẩm không được phép rỗng.</FormMessage>}
        </FormItem>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel>Giá</FormLabel>
            <FormControl>
              <Input type="text"
                min={0}
                step={1}
                {...register("productPrice", {

                  // min: { value: 0, message: "Giá phải lớn hơn 0." },
                  setValueAs: v => {
                    const num = Number(v);
                    return num < 1000 ? num * 1000 : num;
                  },

                })}
                onBlur={e => {
                  const value = Number(e.target.value);
                  if (value > 0 && value < 1000) {
                    e.target.value = formatVND(value * 1000);
                  } else if (value > 0 && value >= 1000) {
                    e.target.value = formatVND(value);
                  } else {
                    e.target.value = "0";
                  }
                }}
                placeholder="e.g. 100 (sẽ là 100.000)" />
            </FormControl>
            {errors.productPrice && <FormMessage>Giá không được phép rỗng</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel>Giá giảm</FormLabel>
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
                  } else if (value > 0 && value >= 1000) {
                    e.target.value = formatVND(value);
                  } else {
                    e.target.value = "0";
                  }
                }}
                placeholder="e.g. 100 (sẽ là 100.000)"
              />
            </FormControl>
          </FormItem>
          <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">


            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormControl>
                <Select
                  value={String(watch("categoryID") ?? "")}
                  onValueChange={val => {
                    setValue("categoryID", Number(val));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {errors.categoryID && <FormMessage>
                Danh mục không được phép rỗng.  
              </FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Danh mục con</FormLabel>
              <FormControl>
                <Select
                  value={String(watch("subcategoryID") ?? "")}
                  onValueChange={val => {
                    const selectedID = Number(val);
                    const chosen = subcategories.find(sub => sub.subcategoryID === selectedID);
                    setSubCateIsChoosen(chosen);
                    setValue("subcategoryID", selectedID);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục con" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.subcategoryID} value={String(sub.subcategoryID)}>{sub.subcategoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Xuất xứ</FormLabel>
              <FormControl>
                <Select
                  value={String(watch("originID") ?? "")}
                  onValueChange={val => setValue("originID", Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn xuất xứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map((origin) => (
                      <SelectItem key={origin.originID} value={String(origin.originID)}>{origin.originName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          </div>
          <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
            <FormItem>
              <FormLabel>Số lượng</FormLabel>
              <FormControl>
                <Input type="number" {...register("quantityAvailable", { required: true })} />
              </FormControl>
              {errors.quantityAvailable && <FormMessage>Số lượng không được phép rỗng.</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel>Đơn vị sản phẩm</FormLabel>
              <FormControl>
                <Input type="text" {...register("unit", { required: true })} placeholder="e.g. kg, pcs, etc." />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Ngày hết hạn</FormLabel>
              <FormControl>
                <Input type="date" {...register("expiredAt")} className="w-full !block" />
              </FormControl>
            </FormItem>
          </div>
          {/* Barcode Field */}
          <FormItem className="col-span-2">
            <FormLabel>Mã vạch sản phẩm (12 số)</FormLabel>
            <FormControl>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  {...register("barcode", {
                    required: true,
                    pattern: { value: /\d{12}$/, message: "Mã vạch phải dài 12 số" },
                  })}
                  value={barcode}
                  // replace non-numeric characters and limit to 12 digits
                  onChange={e => setBarcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                  placeholder="Nhập hoặc sinh tự động mã vạch"
                />
                <Button type="button" onClick={() => {
                  const newBarcode = generateBarcode();
                  setBarcode(newBarcode);
                  setValue("barcode", newBarcode);
                }}>Tạo mã vạch</Button>
                <Button type="button" onClick={handleGenerateBarcodeImage} disabled={barcode.length !== 12}>
                  Tạo ảnh mã vạch
                </Button>
              </div>

            </FormControl>
            {barcodeImage && (
              <div style={{ marginTop: 8 }}>
                <NextImage width={300} height={200} src={barcodeImage} alt="Barcode" style={{ background: '#fff', padding: 4, border: '1px solid #eee' }} />
              </div>
            )}
            {errors.barcode && <FormMessage>{errors.barcode.message || "Mã vạch không thể để trống."}</FormMessage>}
          </FormItem>
          {subCateIsChoosen && subCateIsChoosen.quantityPerBox > 0 &&
            (<FormItem className="col-span-2">
              <FormLabel>Mã vạch lô/thùng (13 số)</FormLabel>
              <FormControl>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Input
                    {...register("boxBarcode", {
                      required: true,
                      pattern: { value: /\d{12}$/, message: "Mã vạch lô thùng phải dài 12 số." }, 
                    })}
                    value={boxBarcode.boxBarcode}
                    onChange={e => setBarcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    placeholder="Nhập hoặc sinh tự động mã vạch"
                  />
                  <Button type="button" onClick={() => {
                    const newBarcode = generateBoxBarcode();
                    setBoxBarcode({ boxBarcode: newBarcode, boxBarcodeImage: "" });
                    setValue("boxBarcode", newBarcode);
                  }}>Tạo mã vạch</Button>
                  <Button type="button" onClick={handleGenerateBoxBarcodeImage} disabled={boxBarcode.boxBarcode.length !== 12}>
                    Tạo ảnh mã vạch
                  </Button>
                </div>

              </FormControl>
              {boxBarcode.boxBarcodeImage && (
                <div style={{ marginTop: 8 }}>
                  <NextImage width={300} height={200} src={boxBarcode.boxBarcodeImage} alt="Barcode" style={{ background: '#fff', padding: 4, border: '1px solid #eee' }} />
                </div>
              )}
              {errors.boxBarcode && <FormMessage>{errors.boxBarcode.message || "Barcode is required"}</FormMessage>}
            </FormItem>)
          }
          <FormItem className="col-span-2">
            <FormLabel>Thẻ</FormLabel>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <button
                    type="button"
                    key={tag.tagID}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                    onClick={() => {
                      const newTags = selectedTags.filter(t => t.tagID !== tag.tagID);
                      setSelectedTags(newTags);
                      setValue("tagIDs", newTags.map(t => Number(t.tagID)));
                    }}
                  >
                    {tag.tagName} ✕
                  </button>
                ))}
              </div>
            )}
            <FormControl>
              <Select
                value=""
                onValueChange={val => {
                  const tag = tags.find(t => String(t.tagID) === String(val));
                  if (tag && !selectedTags.some(t => t.tagID === tag.tagID)) {
                    const newTags = [...selectedTags, tag];
                    setSelectedTags(newTags);
                    setValue("tagIDs", newTags.map(t => Number(t.tagID)));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.tagID} value={String(tag.tagID)}>
                      {tag.tagName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
          <FormItem className="flex items-center gap-2 col-span-2">
            <FormLabel>Hiển thị sản phẩm</FormLabel>
            <FormControl>
              <Checkbox {...register("isShow")} />
            </FormControl>
          </FormItem>
          <FormItem className="col-span-2">
            <FormLabel>Hình ảnh sản phẩm</FormLabel>
            <FormControl>
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  if (files.length > 0) {
                    const dataTransfer = new DataTransfer();
                    files.forEach(file => dataTransfer.items.add(file));
                    setValue("images", dataTransfer.files);
                    setImagePreviews(files.map(file => URL.createObjectURL(file)));
                  }
                }}
                onClick={() => {
                  document.getElementById("product-image-input")?.click();
                }}
              >
                <input
                  id="product-image-input"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => {
                    const newFiles = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                    // Get current files from react-hook-form
                    const currentFiles = Array.from((methods.getValues("images") as FileList | File[] | undefined) || []);
                    // Merge current and new files
                    const mergedFiles = [...currentFiles, ...newFiles];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setValue("images", mergedFiles as any);
                    setImagePreviews(mergedFiles.map(file => URL.createObjectURL(file)));
                  }}
                />
                <div className="text-gray-500">Kéo và thả ảnh vào đây hoặc bấm để chọn ảnh</div>
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <NextImage
                          width={96}
                          height={96}
                          src={src}
                          alt={`preview-${idx}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 shadow group-hover:opacity-100 opacity-80"
                          onClick={e => {
                            e.stopPropagation();
                            const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                            setImagePreviews(newPreviews);
                            // Remove from react-hook-form as well
                            const files = Array.from((methods.getValues("images") as FileList | File[] | undefined) || []);
                            files.splice(idx, 1);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setValue("images", files as any);
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>

          <div className="col-span-2">
            <label className="font-medium mb-1 block text-sm">Nội dung bài viết</label>
            <div className="border rounded-lg bg-white dark:bg-gray-800">
              <Tabs defaultValue="text" className="mb-2 border-b p-4">
                <TabsList className="flex gap-2 px-1 mb-4">
                  <TabsTrigger value="text">Văn bản</TabsTrigger>
                  <TabsTrigger value="heading">Tiêu đề</TabsTrigger>
                  <TabsTrigger value="list">Danh sách</TabsTrigger>
                  <TabsTrigger value="table">Bảng</TabsTrigger>
                  <TabsTrigger value="align">Căn lề</TabsTrigger>
                  <TabsTrigger value="insert">Chèn</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <div className="flex gap-4 flex-wrap">
                    <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={clsx(editor.isActive('bold') ? 'is-active' : '', 'flex items-center gap-x-1')}><Bold size={16} /><span>In đậm</span></button>
                    <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx(editor.isActive('italic') ? 'is-active' : '', 'flex items-center gap-x-1')}><Italic size={16} /> <span>In nghiêng</span></button>
                    <button type="button" title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={clsx(editor.isActive('underline') ? 'is-active' : '', 'flex items-center gap-x-1')}><UnderlineIcon size={16} /><span>Gạch chân</span></button>
                    <button type="button" title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={clsx(editor.isActive('blockquote') ? 'is-active' : '', 'flex items-center gap-x-1')}><QuoteIcon size={16} /><span>Trích</span></button>
                    <button type="button" title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={clsx(editor.isActive('codeBlock') ? 'is-active' : '', 'flex items-center gap-x-1')}><Code2 size={16} /><span>Khối code</span></button>
                    <button type="button" title="Link" onClick={() => { const url = prompt('Enter URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} className={clsx(editor.isActive('link') ? 'is-active' : '', 'flex items-center gap-x-1')}><LinkIcon size={16} /><span>Liên kết</span></button>
                  </div>
                </TabsContent>
                <TabsContent value="heading">
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" title="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={18} /></button>
                    <button type="button" title="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 size={18} /></button>
                    <button type="button" title="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 size={18} /></button>
                    <button type="button" title="H4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}><Heading4 size={18} /></button>
                    <button type="button" title="H5" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}><Heading5 size={18} /></button>
                    <button type="button" title="H6" onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}><Heading6 size={18} /></button>
                  </div>
                </TabsContent>
                <TabsContent value="list">
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={18} /><span></span></button>
                    <button type="button" title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={18} /></button>
                    <button type="button" title="Task List" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'is-active' : ''}><ListChecks size={18} /></button>
                    <button type="button" title="Split List Item" onClick={() => editor.chain().focus().splitListItem('listItem').run()} disabled={!editor.can().splitListItem('listItem')}><Split size={16} /></button>
                    <button type="button" title="Sink List Item" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')}><ArrowRight size={16} /></button>
                    <button type="button" title="Lift List Item" onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')}><ArrowLeft size={16} /></button>
                    <button type="button" title="Split Task Item" onClick={() => editor.chain().focus().splitListItem('taskItem').run()} disabled={!editor.can().splitListItem('taskItem')}><Split size={16} /></button>
                    <button type="button" title="Sink Task Item" onClick={() => editor.chain().focus().sinkListItem('taskItem').run()} disabled={!editor.can().sinkListItem('taskItem')}><ArrowRight size={16} /></button>
                    <button type="button" title="Lift Task Item" onClick={() => editor.chain().focus().liftListItem('taskItem').run()} disabled={!editor.can().liftListItem('taskItem')}><ArrowLeft size={16} /></button>
                  </div>
                </TabsContent>
                <TabsContent value="table">
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></button>
                    <button type="button" title="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()}><Columns2 size={16} /></button>
                    <button type="button" title="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns2 size={16} /></button>
                    <button type="button" title="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()}><Trash2 size={16} /></button>
                    <button type="button" title="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()}><Rows2 size={16} /></button>
                    <button type="button" title="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows2 size={16} /></button>
                    <button type="button" title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()}><Trash2 size={16} /></button>
                    <button type="button" title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 size={16} /></button>
                    <button type="button" title="Merge Cells" onClick={() => editor.chain().focus().mergeCells().run()}><Merge size={16} /></button>
                    <button type="button" title="Split Cell" onClick={() => editor.chain().focus().splitCell().run()}><Split size={16} /></button>
                    <button type="button" title="Toggle Header Column" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>1</button>
                    <button type="button" title="Toggle Header Row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>2</button>
                    <button type="button" title="Toggle Header Cell" onClick={() => editor.chain().focus().toggleHeaderCell().run()}><SquareStack size={16} /></button>
                    <button type="button" title="Merge or Split" onClick={() => editor.chain().focus().mergeOrSplit().run()}><Merge size={16} /></button>
                    <button type="button" title="Set Cell Attribute" onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}><Columns2 size={16} /></button>
                    <button type="button" title="Fix Tables" onClick={() => editor.chain().focus().fixTables().run()}><TableIcon size={16} /></button>
                    <button type="button" title="Go to Next Cell" onClick={() => editor.chain().focus().goToNextCell().run()}><ArrowDown size={16} /></button>
                    <button type="button" title="Go to Previous Cell" onClick={() => editor.chain().focus().goToPreviousCell().run()}><ArrowUp size={16} /></button>
                  </div>
                </TabsContent>
                <TabsContent value="align">
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={16} /></button>
                    <button type="button" title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={16} /></button>
                    <button type="button" title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={16} /></button>
                  </div>
                </TabsContent>
                <TabsContent value="insert">
                  <div className="flex gap-2 flex-wrap">
                    <label title="Image">
                      <ImageIcon size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setEditorImages(prev => [...prev, file]);
                          const url = URL.createObjectURL(file);
                          editor.chain().focus().setImage({ src: url }).run();
                        }}
                      />
                    </label>
                    <button type="button" title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></button>
                  </div>
                </TabsContent>
              </Tabs>
              <EditorContent
                editor={editor}
                className="tiptap-content min-h-[300px] p-3 focus:outline-none rounded-br-md rounded-bl-md focus:border-none"
              // style={{ minHeight: 300, height: 400 }}
              />
            </div>
            <div className="element"></div>
            <style jsx global>{`
  .tiptap-content:focus, .tiptap-content:focus-visible,
  .tiptap-content *:focus, .tiptap-content *:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .is-active {
    background-color: #e9e9e9; /* Light blue background */
    color: #000; /* Blue text color */
    border-color: #2563eb; /* Blue border color */
    padding: 0.2rem 0.5rem;
    border-radius: calc(var(--radius) /* 0.25rem = 4px */ - 2px);
    }
`}</style>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="default" type="submit" className="mt-4" onClick={handleSubmit(onSubmit)}>Thêm sản phẩm</Button>
        </div>
      </FormProvider >
    </main >
  );
}