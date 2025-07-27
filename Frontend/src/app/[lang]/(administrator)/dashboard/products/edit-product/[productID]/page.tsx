"use client";
import { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
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
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, ListChecks, Code2, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Minus, Table as TableIcon, Columns2, Rows2, Trash2, Merge, Split, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, SquareStack, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { Quote as QuoteIcon } from 'lucide-react';
import clsx from "clsx";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/user-context";
import { fetchCategories } from "@/lib/category-apis";
import { fetchSubCategories, fetchSubCategoriesBasedOnCategory } from "@/lib/subcategory-apis";
import { fetchOrigins } from "@/lib/origin-apis";
import { fetchTags } from "@/lib/product-tag-apis";
import { fetchAllDiseases } from "@/lib/disease-apis";
import { fetchProductById, updateProduct } from "@/lib/product-apis";
import { deleteMultipleImages, uploadMultipleImages } from "@/lib/file-apis";

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
type Disease = {
    diseaseID: number;
    diseaseName: string;
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
    barcode: string;
    boxBarcode: string;
    quantityPerBox?: number;
    diseaseIDs: number[];
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
    expiredAt: string;
    unit: string;
    barcode: string;
    boxBarcode: string;
    quantityPerBox?: number;
    diseaseIDs: number[];
};

export default function EditProductPage() {
    const params = useParams();
    const productID = params?.productID as string;

    const { user } = useUser();
    const methods = useForm<ProductFormValues>();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [origins, setOrigins] = useState<Origin[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [productImages, setProductImages] = useState<string[] | null>(null);
    const [oldProductImages, setOldProductImages] = useState<string[]>([]);
    const [editorImages, setEditorImages] = useState<File[]>([]);
    const [oldDescImages, setOldDescImages] = useState<string[]>([]);
    const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
    const [, setMessage] = useState("");
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [productDescription, setProductDescription] = useState<string | null>(null);
    const [selectedDiseases, setSelectedDiseases] = useState<Disease[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);

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
            TaskItem.configure({ nested: true }),
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6], HTMLAttributes: { class: 'text-gray-900 dark:text-white font-bold' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Gapcursor,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: "<p>Loading...</p>",
        onUpdate({ editor }) {
            const newUrls = extractImageUrls(editor.getJSON());
            descriptionImages.forEach((url, idx) => {
                if (!newUrls.includes(url)) {
                    handleUpdateDescriptionImage(idx);
                }
            });
        }
    });

    // Fetch all dropdown data
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const response = await fetchCategories();
                setCategories(response);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        const fetchSubcategoriesData = async () => {
            try {
                const data = await fetchSubCategories();
                setSubcategories(data);
            } catch (error) {
                console.error("Error fetching subcategories:", error);
            }
        }

        const fetchOriginsData = async () => {
            try {
                const data = await fetchOrigins();
                setOrigins(data);
            } catch (error) {
                console.error("Error fetching origins:", error);
            }
        }

        const fetchTagsData = async () => {
            try {
                const data = await fetchTags();
                setTags(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        }

        const fetchDiseasesData = async () => {
            try {
                const data = await fetchAllDiseases();
                setDiseases(data || []);
            } catch (error) {
                console.error("Error fetching diseases:", error);
            }
        }

        // use promise all 
        Promise.all([
            fetchCategoriesData(),
            fetchSubcategoriesData(),
            fetchOriginsData(),
            fetchTagsData(),
            fetchDiseasesData()
        ]).catch(error => {
            console.error("Error fetching dropdown data:", error);
        });
    }, []);

    // Fetch product info
    useEffect(() => {
        if (!productID) return;
        const fetchProduct = async () => {
            const res = await fetchProductById(productID);
            if (!res) {
                toast.error("Không tìm thấy sản phẩm.");
                return;
            }
            const prod: Product = res;
            setValue("productName", prod.productName);
            setValue("productPrice", String(prod.productPrice));
            setValue("productPriceSale", String(prod.productPriceSale || ""));
            setValue("quantityAvailable", String(prod.quantityAvailable));
            setValue("categoryID", String(prod.category?.categoryID || ""));
            setValue("subcategoryID", String(prod.subcategory?.subcategoryID || ""));
            setValue("originID", String(prod.origin?.originID || ""));
            setValue("tagIDs", prod.Tags?.map(t => String(t.tagID)) || []);
            setValue("isShow", prod.isShow || false);
            setValue("expiredAt", prod.expiredAt ? new Date(prod.expiredAt).toISOString().split("T")[0] : "");
            setValue("unit", prod.unit || "");
            setValue("barcode", prod.barcode || "");
            setValue("boxBarcode", prod.boxBarcode || "");
            setValue("quantityPerBox", prod.quantityPerBox || 0);
            setOldProductImages(prod.images || []);
            setProductImages(prod.images || []);
            setOldDescImages(prod.descriptionImages || []);
            setDescriptionImages(prod.descriptionImages || []);
            setProductDescription(prod.description || "");
            setEditorLoaded(true);
        }
        fetchProduct().catch(error => {
            console.error("Error fetching product:", error);
            toast.error("Không thể tải thông tin sản phẩm.");
        });
    }, [productID, setValue]);

    // Prefill selected diseases
    useEffect(() => {
        let parsedDescription: unknown = null;
        try {
            parsedDescription = productDescription ? JSON.parse(productDescription) : null;
        } catch {
            parsedDescription = null;
        }
        if (
            parsedDescription &&
            typeof parsedDescription === "object" &&
            parsedDescription !== null &&
            "diseaseIDs" in parsedDescription &&
            Array.isArray((parsedDescription as { diseaseIDs?: unknown }).diseaseIDs)
        ) {
            const diseaseIDs = (parsedDescription as { diseaseIDs: number[] }).diseaseIDs;
            const initialDiseases = diseases.filter(d => diseaseIDs.includes(d.diseaseID));
            setSelectedDiseases(initialDiseases);
        }
    }, [diseases, productDescription]);

    // Fetch subcategories and attributes when category changes
    const selectedCategoryID = watch("categoryID");
    useEffect(() => {
        if (selectedCategoryID) {
            const fetchSubcategories = async () => {
                const data = await fetchSubCategoriesBasedOnCategory(selectedCategoryID);
                setSubcategories(data);
            }
            fetchSubcategories();
        } else {
            setSubcategories([]);
        }
    }, [selectedCategoryID]);

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
    };

    const handleUpdateDescriptionImage = (index: number) => {
        const imageUrl = oldDescImages[index];
        if (imageUrl) {
            setDescriptionImages(prev => (prev ?? []).filter((_, idx) => idx !== index));
        }
    };

    useEffect(() => {
        if (editor && productDescription !== null) {
            try {
                editor.commands.setContent(JSON.parse(productDescription));
            } catch {
                editor.commands.setContent(productDescription);
            }
        }
    }, [editor, productDescription]);

    // Format VND currency
    function formatVND(value: number) {
        return value.toLocaleString('vi-VN');
    }

    // Submit handler
    const onSubmit = async (data: ProductFormValues) => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
            return;
        }
        setMessage("");
        let uploadedUrls: string[] = [];
        const filesToUpload: File[] = [];
        if (data.images && data.images.length > 0) {
            Array.from(data.images).forEach(file => filesToUpload.push(file));
        }
        if (editorImages.length > 0) {
            editorImages.forEach(file => filesToUpload.push(file));
        }
        try {
            if (filesToUpload.length > 0) {
                uploadedUrls = await uploadMultipleImages(filesToUpload);
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
        const oldImages = oldProductImages.filter(img => !newProductImages?.includes(img));
        const oldDescImagesToDelete = oldDescImages.filter(img => !(Array.isArray(newDescImages) ? newDescImages.includes(img) : false));
        const imagesToDelete = [...oldImages, ...oldDescImagesToDelete];
        if (imagesToDelete.length > 0) {
            try {
                await deleteMultipleImages(imagesToDelete);
            } catch (error) {
                console.error("Failed to delete old images:", error);
                setMessage("Failed to delete old images.");
                return;
            }
        }
        try {
            const res = await updateProduct(productID, {
                productName: data.productName,
                productPrice: Number(data.productPrice),
                productPriceSale: data.productPriceSale ? Number(data.productPriceSale) : null,
                quantityAvailable: Number(data.quantityAvailable),
                categoryID: Number(data.categoryID),
                subcategoryID: Number(data.subcategoryID),
                originID: Number(data.originID),
                tagIDs: data.tagIDs.map(id => Number(id)),
                images: newProductImages,
                descriptionImages: newDescImages,
                description: JSON.stringify(content),
                isShow: data.isShow,
                expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
                unit: data.unit,
                barcode: data.barcode || "",
                boxBarcode: data.boxBarcode || "",
                quantityPerBox: data.quantityPerBox ? Number(data.quantityPerBox) : undefined,
                performedBy: user.userID,
                diseaseIDs: selectedDiseases.map(d => d.diseaseID)
            }
            )
            if (res) {
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                toast.error("Cập nhật sản phẩm thất bại. Kiểm tra kết nối và thử lại.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Cập nhật sản phẩm thất bại. Kiểm tra kết nối và thử lại.");
        }
    };

    if (!editor || !editorLoaded) return <div>Đang tải...</div>;

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
                            <FormLabel>Số lượng trên thùng/lô</FormLabel>
                            <FormControl>
                                <Input type="number" {...register("quantityPerBox", { required: true })} placeholder="Nhập số lượng sản phẩm/lô(thùng) nếu có." />
                            </FormControl>
                        </FormItem>

                        <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
                            <FormItem>
                                <FormLabel className="text-gray-600">Danh mục</FormLabel>
                                <FormControl>
                                    <Select value={watch("categoryID")} onValueChange={val => setValue("categoryID", val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-gray-600">Danh mục con</FormLabel>
                                <FormControl>
                                    <Select value={watch("subcategoryID")} onValueChange={val => setValue("subcategoryID", val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn danh mục con" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategories.map(sub => (
                                                <SelectItem key={sub.subcategoryID} value={String(sub.subcategoryID)}>{sub.subcategoryName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-gray-600">Nhà sản xuất</FormLabel>
                                <FormControl>
                                    <Select value={watch("originID")} onValueChange={val => setValue("originID", val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select origin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {origins.map(origin => (
                                                <SelectItem key={origin.originID} value={String(origin.originID)}>{origin.originName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                        </div>
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
                                    <Input
                                        type="text"
                                        {...register("barcode")}
                                        defaultValue={oldProductImages.length > 0 ? watch("barcode") : ""}
                                    />
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-gray-600">Số mã vạch thùng (lô)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...register("boxBarcode")}
                                        defaultValue={oldProductImages.length > 0 ? watch("boxBarcode") : ""}
                                    />
                                </FormControl>
                            </FormItem>
                        </div>
                        <div className="col-span-2 grid grid-cols-[1fr_1fr_1fr] gap-4">
                            <FormItem className="col-span-2">
                                <FormLabel className="text-gray-600">Ngày hết hạn</FormLabel>
                                <FormControl>
                                    <Input 
                                    defaultValue={watch("expiredAt") || ""}
                                    type="date" {...register("expiredAt")} />
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-gray-600">Hiển thị sản phẩm</FormLabel>
                                <FormControl>
                                    <Checkbox
                                        checked={!!watch("isShow")}
                                        onCheckedChange={checked => setValue("isShow", !!checked)}
                                    />
                                </FormControl>
                            </FormItem>
                        </div>
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
                                                <span><Tag className="w-4" /></span>
                                                <span>{tag.tagName}</span>

                                            </button>
                                        );
                                    })}
                                </div>
                            </FormControl>
                        </FormItem>
                    </div>
                    <FormItem>
                        <FormLabel className="text-gray-600">Ảnh sản phẩm</FormLabel>
                        <FormControl>
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer ${dragActive ? "border-primary bg-primary/10" : "border-gray-300 bg-gray-50"}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                onDrop={e => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    const files = Array.from(e.dataTransfer.files);
                                    if (files.length > 0) {
                                        // Update react-hook-form images field
                                        const dt = new DataTransfer();
                                        files.forEach(f => dt.items.add(f));
                                        fileInputRef.current!.files = dt.files;
                                        setValue("images", dt.files as unknown as FileList);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label="Kéo thả hoặc click để tải ảnh"
                            >
                                <input
                                    type="file"
                                    multiple
                                    {...register("images")}
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={e => {
                                        setValue("images", e.target.files as unknown as FileList);
                                    }}
                                />
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
                                            fileInputRef.current!.files = dt.files;
                                            setValue("images", dt.files as unknown as FileList);
                                        }}
                                        aria-label="Xóa ảnh mới"
                                    >
                                        <Trash2 size={16} />
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
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FormItem>
                    <FormItem className="col-span-2">
                        <FormLabel className="text-gray-600">Bệnh liên quan</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedDiseases.map(disease => (
                                <button
                                    type="button"
                                    key={disease.diseaseID}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                                    onClick={() => {
                                        const newDiseases = selectedDiseases.filter(d => d.diseaseID !== disease.diseaseID);
                                        setSelectedDiseases(newDiseases);
                                        setValue("diseaseIDs", newDiseases.map(d => d.diseaseID));
                                    }}
                                >
                                    {disease.diseaseName} ✕
                                </button>
                            ))}
                        </div>
                        <FormControl>
                            <Select
                                value=""
                                onValueChange={val => {
                                    const disease = diseases.find(d => String(d.diseaseID) === String(val));
                                    if (disease && !selectedDiseases.some(d => d.diseaseID === disease.diseaseID)) {
                                        const newDiseases = [...selectedDiseases, disease];
                                        setSelectedDiseases(newDiseases);
                                        setValue("diseaseIDs", newDiseases.map(d => d.diseaseID));
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn bệnh" />
                                </SelectTrigger>
                                <SelectContent>
                                    {diseases.map((disease) => (
                                        <SelectItem key={disease.diseaseID} value={String(disease.diseaseID)}>
                                            {disease.diseaseName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                    <div>
                        <label className="font-medium mb-1 block text-gray-600">Mô tả chi tiết sản phẩm</label>
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
                            {watch("productName") && (
                                <EditorContent
                                    editor={editor}
                                    className="tiptap-content min-h-[300px] p-3 focus:outline-none rounded-br-md rounded-bl-md focus:border-none"
                                // style={{ minHeight: 300, height: 400 }}
                                />
                            )}
                        </div>
                    </div>
                    {/* {message && <FormMessage className="mt-2">{message}</FormMessage>} */}
                    <div className="flex justify-end"><Button variant="default" type="submit" className="hover:cursor-pointer">Cập nhật sản phẩm</Button></div>
                </form>
            </FormProvider>
            {/* Hidden outline, border, and box-shadow when user focus on tiptap editor */}
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
    );
}
