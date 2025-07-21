"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";
import generateSlug from "@/lib/others/generateSlug";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"; import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, ListChecks, Code2, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Minus, Table as TableIcon, Columns2, Rows2, Trash2, Merge, Split, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, SquareStack, } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { Quote as QuoteIcon } from 'lucide-react';
import clsx from "clsx";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button/button";
import { fetchTagsOfNews } from "@/lib/tag-of-news-apis";
import { fetchNewsById, updateNews } from "@/lib/news-apis";
import { deleteMultipleImages, uploadMultipleImages } from "@/lib/file-apis";
import { useUser } from "@/contexts/user-context";

export default function EditNewsPage() {
    const params = useParams();
    const router = useRouter();
    const newsID = params?.newsID as string;
    const {user} = useUser();

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [slug, setSlug] = useState("");
    const [tags, setTags] = useState<number[]>([]);
    const [tagOptions, setTagOptions] = useState<{ newsTagID: number; tagName: string }[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [titleImage, setTitleImage] = useState<File | null>(null);

    const [titleImageUrl, setTitleImageUrl] = useState<string>("");
    const [editorImageUrls, setEditorImageUrls] = useState<string[]>([]);
    const [editorImages, setEditorImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");

    const [oldImages, setOldImages] = useState<string[]>([]);
    const [oldTitleImageUrl, setOldTitleImageUrl] = useState<string>("");

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

    const handleUpdateDescriptionImage = (index: number) => {
        const imageUrl = oldImages[index];
        if (imageUrl) {
            setEditorImageUrls(prev => (prev ?? []).filter((_, idx) => idx !== index));
        }
    }

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
            editorImageUrls.forEach((url, idx) => {
                if (!newUrls.includes(url)) {
                    handleUpdateDescriptionImage(idx);
                }
            });
        }
    });

    // Fetch tag options
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

    // Fetch news data
    useEffect(() => {
        if (!newsID) return;
        const fetchNewsData = async () => {
            try {
                const news = await fetchNewsById(Number(newsID));
                if (!news) throw new Error("Failed to fetch news data");
                setTitle(news.title || "");
                setSubtitle(news.subtitle || "");
                setSlug(news.slug || "");
                setIsPublished(news.isPublished);
                setTitleImageUrl(news.titleImageUrl || "");
                setOldTitleImageUrl(news.titleImageUrl || "");
                setTags(
                    (news.hastags?.map((t: { newsTagID: number; tagName: string }) => t.newsTagID) || [])
                );
                setOldImages(news.images || []);
                setEditorImageUrls(news.images || []);
                setContent(news.content || "");
            } catch (error) {
                console.error("Error fetching news data:", error);
            }
        };
        fetchNewsData();
    }, [newsID, editor]);

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
        }
    };

    const methods = useForm({
        defaultValues: {
            title: title,
            subtitle: subtitle,
            slug: slug,
            tagIDs: tags,
            isPublished: isPublished,
        },
    });
    const { register, setValue, watch, formState: { errors } } = methods;

    useEffect(() => {
        setValue("title", title);
        setValue("subtitle", subtitle);
        setValue("slug", slug);
        setValue("tagIDs", tags);
        setValue("isPublished", isPublished);
    }, [title, subtitle, slug, tags, isPublished, setValue]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if(!user) {
            toast.error("Bạn cần đăng nhập để thực hiện hành động này.");
            setLoading(false);
            return;
        }

        try {
            // 1. Upload images if changed
            let uploadedUrls: string[] = [];
            const filesToUpload = [...editorImages];
            if (titleImage) filesToUpload.unshift(titleImage);

            if (filesToUpload.length > 0) {
                uploadedUrls = await uploadMultipleImages(filesToUpload);
            }

            // 2. Replace local image URLs in editor content with uploaded URLs
            let content = editor?.getJSON();
            let urlIndex = titleImage ? 1 : 0;
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
            content = replaceEditorImageUrls(content);

            // 3. Use the first uploaded URL as title image if present
            const newTitleImageUrl = titleImage ? uploadedUrls[0] : titleImageUrl;

            const newImages = editorImages.length > 0 ? [...editorImageUrls, ...uploadedUrls.slice(titleImage ? 1 : 0)] : editorImageUrls;

            const oldImageUrlsInEditor = oldImages.filter((url) => !newImages.includes(url));

            if (titleImage) {
                oldImageUrlsInEditor.push(oldTitleImageUrl);
            }

            // Delete old images that are not in the new list
            if (oldImageUrlsInEditor.length > 0) {
                await deleteMultipleImages(oldImageUrlsInEditor);
            }

            const res = await updateNews({
                id: Number(newsID),
                userID: "0",
                title: watch("title"),
                titleImageUrl: newTitleImageUrl,
                subTitle: watch("subtitle"),
                content: JSON.stringify(content),
                slug: watch("slug"),
                images: newImages,
                tags: watch("tagIDs") || [],
                isPublished: watch("isPublished"),
            });
            if (!res.ok) {
                // const data = await res.json();
                toast.success("Cập nhật bài viết thất bại. Vui lòng thử lại.");
            } else {
                toast.success("Cập nhật bài viết thành công!");
                router.refresh?.();
            }
        } catch (err) {
            console.error("Error updating news:", err);
            toast.error("Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (editor && content !== null) {
            try {
                editor.commands.setContent(JSON.parse(content));
            } catch {
                editor.commands.setContent(content);
            }
        }
    }, [editor, content]);

    if (!editor) return null;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleUpdate}>
                <div className="">
                    <h1 className="text-2xl font-bold mb-6">Chỉnh Sửa Bài Viết</h1>
                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel>Tiêu đề *</FormLabel>
                            <FormControl>
                                <Input {...register("title", { required: "Tiêu đề là bắt buộc" })} maxLength={150} />
                            </FormControl>
                            {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
                        </FormItem>
                        <FormItem>
                            <FormLabel>Phụ đề</FormLabel>
                            <FormControl>
                                <Input {...register("subtitle")} maxLength={150} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Slug (SEO)</FormLabel>
                            <FormControl>
                                <Input
                                    value={'https://example.com/news/' + generateSlug(title)}
                                    {...register("slug")} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Tag</FormLabel>
                            <FormControl>
                                <>
                                    <div className="flex flex-wrap gap-2">
                                        {(watch("tagIDs") || []).map((id: number) => {
                                            const tag = tagOptions.find(t => t.newsTagID === id);
                                            if (!tag) return null;
                                            return (
                                                <span key={id} className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                                    {tag.tagName}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-blue-500 hover:text-red-500"
                                                        onClick={() => {
                                                            const updated = (watch("tagIDs") || []).filter((tid: number) => tid !== id);
                                                            setValue("tagIDs", updated);
                                                            setTags(updated);
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <Select
                                        value=""
                                        onValueChange={val => {
                                            const tag = tagOptions.find(t => String(t.newsTagID) === String(val));
                                            const current = watch("tagIDs") || [];
                                            if (tag && !current.includes(tag.newsTagID)) {
                                                setValue("tagIDs", [...current, tag.newsTagID]);
                                                setTags([...current, tag.newsTagID]);
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

                                </>
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
                        <div>
                            <label className="font-medium mb-1 block">Nội dung bài viết *</label>
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
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={watch("isPublished")} onChange={e => setValue("isPublished", e.target.checked)} id="isPublished" />
                            <label htmlFor="isPublished">Công khai bài viết</label>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button type="submit" disabled={loading} className="cursor-pointer">
                                {loading ? "Đang lưu..." : "Cập nhật bài viết"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}