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
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";

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
    expiredAt: string;
    unit: string;
};

export default function EditProductPage() {
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
                
                setOldProductImages(prod.images || []);
                setProductImages(prod.images || []);
                setOldDescImages(prod.descriptionImages || []);
                setDescriptionImages(prod.descriptionImages || []);
                setProductDescription(prod.description || "");
                setEditorLoaded(true);
            });
    }, [productID, setValue]);

    // Fetch subcategories and attributes when category changes
    const selectedCategoryID = watch("categoryID");
    useEffect(() => {
        if (selectedCategoryID) {
            fetch(`${baseUrl}/api/subcategory?categoryID=${selectedCategoryID}`)
                .then(res => res.json())
                .then(setSubcategories);
            fetch(`${baseUrl}/api/attribute?categoryID=${selectedCategoryID}`)
                .then(res => res.json());
        } else {
            setSubcategories([]);
        }
    }, [selectedCategoryID]);

    // Utility to extract all image URLs from TipTap JSON
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

    // Submit handler
    const onSubmit = async (data: ProductFormValues) => {
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
            setMessage("Failed to upload images.");
            return;
        }
        // Replace local URLs in editor content with uploaded URLs
        let content = editor?.getJSON();
        let urlIndex = data.images ? data.images.length : 0;
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
                await fetch(`${baseUrl}/api/upload/multi-delete`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: imagesToDelete }),
                });
            } catch (error) {
                setMessage("Failed to delete old images.");
                return;
            }
        }
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
                    unit: data.unit,
                }),
            });
            if (res.ok) {
                setMessage("Product updated successfully!");
            } else {
                setMessage("Failed to update product.");
            }
        } catch (error) {
            setMessage("Failed to update product.");
        }
    };

    if (!editor || !editorLoaded) return <div>Loading...</div>;

    return (
        <main className="mx-auto p-10 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
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
                            <Input type="number" min={0} step={1} {...register("productPrice", { required: true })} />
                        </FormControl>
                        {errors.productPrice && <FormMessage>Price is required</FormMessage>}
                    </FormItem>
                    <FormItem>
                        <FormLabel>Sale Price</FormLabel>
                        <FormControl>
                            <Input type="number" min={0} step={1} {...register("productPriceSale")} />
                        </FormControl>
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
                            <Select value={watch("categoryID")} onValueChange={val => setValue("categoryID", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        {errors.categoryID && <FormMessage>Category is required</FormMessage>}
                    </FormItem>
                    <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <FormControl>
                            <Select value={watch("subcategoryID")} onValueChange={val => setValue("subcategoryID", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subcategory" />
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
                        <FormLabel>Origin</FormLabel>
                        <FormControl>
                            <Select value={watch("originID")} onValueChange={val => setValue("originID", val)}>
                                <SelectTrigger>
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
                    <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => {
                                    const selected = watch("tagIDs")?.includes(String(tag.tagID));
                                    return (
                                        <button
                                            type="button"
                                            key={tag.tagID}
                                            className={`px-3 py-1 rounded-full border text-sm transition-colors ${selected ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"}`}
                                            onClick={() => {
                                                const current = watch("tagIDs") || [];
                                                if (selected) {
                                                    setValue("tagIDs", current.filter(id => id !== String(tag.tagID)));
                                                } else {
                                                    setValue("tagIDs", [...current, String(tag.tagID)]);
                                                }
                                            }}
                                        >
                                            {tag.tagName}
                                        </button>
                                    );
                                })}
                            </div>
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Show Product</FormLabel>
                        <FormControl>
                            <Checkbox
                                checked={!!watch("isShow")}
                                onCheckedChange={checked => setValue("isShow", !!checked)}
                            />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...register("expiredAt")} />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                            <Input type="text" {...register("unit", { required: true })} />
                        </FormControl>
                        {errors.unit && <FormMessage>Unit is required</FormMessage>}
                    </FormItem>
                    <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                            <Input type="file" multiple {...register("images")} />
                        </FormControl>
                        <div className="flex gap-2 mt-2">
                            {productImages?.map((img, idx) => (
                                <div key={img} className="relative group">
                                    <NextImage src={img} alt="Product" width={60} height={60} className="rounded" />
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 group-hover:scale-110 transition"
                                        onClick={() => handleUpdateProductImage(idx)}
                                        aria-label="Delete image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FormItem>
                    <div>
                        <label className="font-medium mb-1 block">Description</label>
                        <div>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6</button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                                >
                                    Toggle bullet list
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().splitListItem('listItem').run()}
                                    disabled={!editor.can().splitListItem('listItem')}
                                >
                                    Split list item
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                                    disabled={!editor.can().sinkListItem('listItem')}
                                >
                                    Sink list item
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                                    disabled={!editor.can().liftListItem('listItem')}
                                >
                                    Lift list item
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                                    className={editor.isActive('taskList') ? 'is-active' : ''}
                                >
                                    Toggle task list
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
                                    disabled={!editor.can().splitListItem('taskItem')}
                                >
                                    Split list item
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
                                    disabled={!editor.can().sinkListItem('taskItem')}
                                >
                                    Sink list item
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
                                    disabled={!editor.can().liftListItem('taskItem')}
                                >
                                    Lift list item
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
                                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
                                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
                                <button type="button" onClick={() => {
                                    const url = prompt('Enter URL');
                                    if (url) editor.chain().focus().setLink({ href: url }).run();
                                }}>Link</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Blockquote</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>
                                <label>
                                    Image
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
                                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                                    Set horizontal rule
                                </button>
                                <button type="button"
                                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                                >
                                    Insert table
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                                    Add column before
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>Add column after</button>
                                <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
                                <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>Add row before</button>
                                <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>Add row after</button>
                                <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
                                <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
                                <button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>Merge cells</button>
                                <button type="button" onClick={() => editor.chain().focus().splitCell().run()}>Split cell</button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
                                    Toggle header column
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                                    Toggle header row
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
                                    Toggle header cell
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge or split</button>
                                <button type="button" onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}>
                                    Set cell attribute
                                </button>
                                <button type="button" onClick={() => editor.chain().focus().fixTables().run()}>Fix tables</button>
                                <button type="button" onClick={() => editor.chain().focus().goToNextCell().run()}>Go to next cell</button>
                                <button type="button" onClick={() => editor.chain().focus().goToPreviousCell().run()}>
                                    Go to previous cell
                                </button>
                            </div>
                            {watch("productName") && <EditorContent editor={editor} className='tiptap-content' />}
                        </div>
                    </div>
                    {message && <FormMessage className="mt-2">{message}</FormMessage>}
                    <Button variant="default" type="submit" className="mt-4">Update Product</Button>
                </form>
            </FormProvider>
        </main>
    );
}
