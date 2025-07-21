"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/input";
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
import { useUser } from "@/contexts/user-context";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, ListChecks, Code2, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Minus, Table as TableIcon, Columns2, Rows2, Trash2, Merge, Split, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, SquareStack,  } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { Quote as QuoteIcon } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select/select";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import clsx from "clsx";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Button } from "@/components/ui/button/button";
import toast from "react-hot-toast";
import generateSlug from "@/lib/others/generateSlug";
import { uploadMultipleImages } from "@/lib/file-apis";
import { createNews } from "@/lib/news-apis";
import { fetchTagsOfNews } from "@/lib/tag-of-news-apis";


export default function AddNewsPage() {
    const { user } = useUser();
    type FormValues = {
        title: string;
        subtitle: string;
        slug: string;
        tagIDs: number[];
        isPublished: boolean;
    };

    const methods = useForm<FormValues>({
        defaultValues: {
            title: "",
            subtitle: "",
            slug: "",
            tagIDs: [],
            isPublished: false,
        },
    });
    const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;
    const [tagOptions, setTagOptions] = useState<{ newsTagID: number; tagName: string }[]>([]);
    const [titleImage, setTitleImage] = useState<File | null>(null);
    const [titleImageUrl, setTitleImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [editorImages, setEditorImages] = useState<File[]>([]);


    // Handle title image file input change
    const handleTitleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setTitleImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTitleImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setTitleImageUrl("");
        }
    };

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

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        if (!user) {
            toast.error("Bạn cần đăng nhập để tạo bài viết.");
            return;
        }
        try {
            // 1. Upload all images (title + editor images) using /multiple
            const filesToUpload = [...editorImages];
            if (titleImage) filesToUpload.unshift(titleImage);

            let uploadedUrls: string[] = [];
            if (filesToUpload.length > 0) {
               uploadedUrls = await uploadMultipleImages(filesToUpload);
            }

            // 2. Replace local image URLs in editor content with Cloudinary URLs
            let content = editor?.getJSON();
            let urlIndex = titleImage ? 1 : 0; // If titleImage is present, first URL is for title

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function replaceEditorImageUrls(node: any): any {
                if (!node) return node; // Handle null or undefined nodes, return as is 
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
            content = replaceEditorImageUrls(content);

            // 3. Use the first uploaded URL as title image if present
            const titleImageUrl = titleImage ? uploadedUrls[0] : "";
            const images = titleImageUrl ? uploadedUrls.slice(2,) : uploadedUrls; // Skip first two if title image is used
            const userID = user.userID; // Use userID from context or default to 0
            const res = await createNews({
                userID,
                title: data.title,
                titleImageUrl,
                subTitle: data.subtitle,
                content: JSON.stringify(content),
                slug: generateSlug(data.slug || data.title),
                images: images.length > 0 ? images : undefined,
                tags: data.tagIDs.length > 0 ? data.tagIDs : undefined,
                isPublished: data.isPublished,
                isDraft: !data.isPublished, // If not published, it's a draft
            })
            if (!res) {
                toast.error("Tạo bài viết thất bại.");
            } else {
                toast.success("Tạo bài viết thành công!");
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi tạo bài viết.");
            console.error("Error creating news:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch tag options from server
    useEffect(() => {
        const fetchTagsOfNewsData = async () => {
            try {
                const data = await fetchTagsOfNews();
                setTagOptions(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };
        fetchTagsOfNewsData();
    }, []);

    const title = register("title", { required: "Tiêu đề là bắt buộc" })
    const subtitle = register("subtitle")
    const slug = register("slug")
    const isPublished = register("isPublished")

    if (!editor) return null

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="">
                    <h1 className="text-2xl font-bold mb-6">Thêm Bài Viết Mới</h1>
                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel>Tiêu đề bài viết</FormLabel>
                            <FormControl>
                                <Input {...title} maxLength={150} placeholder="Nhập tiêu đề bài viết (tối đa 150 ký tự)" />
                            </FormControl>
                            {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
                        </FormItem>
                        <FormItem>
                            <FormLabel>Tiêu đề phụ</FormLabel>
                            <FormControl>
                                <Input {...subtitle} maxLength={150} placeholder="Nhập tiêu đề phụ (tối đa 150 ký tự)" />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Slug bài viết (SEO)</FormLabel>
                            <FormControl>
                                <Input 
                                value={'https://example.com/news/' + generateSlug(watch("title"))}
                                {...slug} placeholder="https://example.com/news/slug" />
                            </FormControl>
                        </FormItem>
                        <FormItem className="col-span-2">
                            <FormLabel>Thẻ</FormLabel>
                            {watch("tagIDs")?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {watch("tagIDs").map((id: number) => {
                                        const tag = tagOptions.find(t => t.newsTagID === id);
                                        if (!tag) return null;
                                        return (
                                            <button
                                                type="button"
                                                key={tag.newsTagID}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                                onClick={() => {
                                                    const newTags = watch("tagIDs").filter((tid: number) => tid !== tag.newsTagID);
                                                    setValue("tagIDs", newTags);
                                                }}
                                            >
                                                {tag.tagName} ✕
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <FormControl>
                                <Select
                                    value=""
                                    onValueChange={val => {
                                        const tag = tagOptions.find(t => String(t.newsTagID) === String(val));
                                        const current = watch("tagIDs") || [];
                                        if (tag && !current.includes(tag.newsTagID)) {
                                            setValue("tagIDs", [...current, tag.newsTagID]);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tagOptions.map((tag) => (
                                            <SelectItem key={tag.newsTagID} value={String(tag.newsTagID)}>
                                                {tag.tagName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Ảnh tiêu đề</FormLabel>
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
                                        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
                                        if (file) {
                                            setTitleImage(file);
                                            const reader = new FileReader();
                                            reader.onload = () => setTitleImageUrl(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    onClick={() => {
                                        document.getElementById("title-image-input")?.click();
                                    }}
                                >
                                    <input
                                        id="title-image-input"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleTitleImageChange}
                                    />
                                    <div className="text-gray-500">Kéo và thả ảnh vào đây hoặc bấm để chọn ảnh</div>
                                    {titleImageUrl && (
                                        <div className="flex justify-center mt-4">
                                            <NextImage width={200} height={200} src={titleImageUrl} alt="Title" className="max-h-40 rounded" />
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                        </FormItem>
                        <div className="mt-4">
                            <label>Nội dung bài viết</label>
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
                    <div className="flex items-center gap-2 py-4">
                        <Checkbox {...isPublished} id="isPublished" />
                        <label htmlFor="isPublished">Công khai bài viết</label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button variant="default" disabled={loading} className="cursor-pointer">
                            {loading ? "Đang lưu..." : "Tạo bài viết"}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}