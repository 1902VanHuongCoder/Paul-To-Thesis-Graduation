"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from "next/image";
import NextImage from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Bold,
    Columns2,
    Code2,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    ImageIcon,
    Link as LinkIcon,
    List,
    ListChecks,
    ListOrdered,
    Merge,
    Minus,
    QuoteIcon,
    Rows2,
    Split,
    TableIcon,
    Trash2,
    Underline as UnderlineIcon,
    SquareStack,
    TrashIcon
} from "lucide-react";
import { baseUrl } from "@/lib/base-url";
import { useUser } from "@/contexts/user-context";
import toast from "react-hot-toast";

type DiseaseFormValues = {
    diseaseName: string;
    diseaseEnName: string;
    ricePathogen: string;
    symptoms: string;
    images: FileList;
};

export default function AddDiseasePage() {
    const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<DiseaseFormValues>();
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { user } = useUser();

    // Tiptap editor for symptoms
    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Nhập triệu chứng bệnh ở đây...</p>',
    });

    // Preview selected images
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setImagePreviews(Array.from(files).map(file => URL.createObjectURL(file)));
        }
    };

    const onSubmit = async (data: DiseaseFormValues) => {
        setLoading(true);
        setMessage("");
        try {
            // Upload images (if any)
            let uploadedUrls: string[] = [];
            if (data.images && data.images.length > 0) {
                const formData = new FormData();
                Array.from(data.images).forEach(file => formData.append("files", file));
                const res = await fetch(`${baseUrl}/api/upload/multiple`, {
                    method: "POST",
                    body: formData,
                });
                if (res.ok) {
                    const result = await res.json();
                    uploadedUrls = result.files.map((f: { url: string }) => f.url);
                }
            }
            // Submit disease
            const res = await fetch(`${baseUrl}/api/disease`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: user?.userID,
                    diseaseName: data.diseaseName,
                    diseaseEnName: data.diseaseEnName,
                    ricePathogen: data.ricePathogen,
                    symptoms: editor?.getHTML() || "",
                    images: uploadedUrls,
                }),
            });
            if (res.ok) {
                toast.success("Thêm bệnh thành công!");
                reset();
                setImagePreviews([]);
                editor?.commands.setContent('<p>Nhập triệu chứng bệnh ở đây...</p>');
            } else {
                toast.error("Thêm bệnh thất bại!");
            }
        } catch {
            toast.error("Lỗi khi thêm bệnh.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Thêm Mới Bệnh Lúa</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Tên bệnh</label>
                    <input type="text" {...register("diseaseName", { required: true })} className="w-full border px-3 py-2 rounded" />
                    {errors.diseaseName && <span className="text-red-500">Tên bệnh là bắt buộc</span>}
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Tên tiếng Anh</label>
                    <input type="text" {...register("diseaseEnName", { required: true })} className="w-full border px-3 py-2 rounded" />
                    {errors.diseaseEnName && <span className="text-red-500">Tên tiếng Anh là bắt buộc</span>}
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Tác nhân gây bệnh</label>
                    <input type="text" {...register("ricePathogen", { required: true })} className="w-full border px-3 py-2 rounded" />
                    {errors.ricePathogen && <span className="text-red-500">Tác nhân gây bệnh là bắt buộc</span>}
                </div>
                <div className="mb-4 col-span-2">
                    <label className="font-medium mb-1 block text-sm">Triệu chứng</label>
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
                                    <button type="button" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'is-active' : ''}><Bold size={16} /><span>In đậm</span></button>
                                    <button type="button" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'is-active' : ''}><Italic size={16} /> <span>In nghiêng</span></button>
                                    <button type="button" title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'is-active' : ''}><UnderlineIcon size={16} /><span>Gạch chân</span></button>
                                    <button type="button" title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive('blockquote') ? 'is-active' : ''}><QuoteIcon size={16} /><span>Trích</span></button>
                                    <button type="button" title="Code Block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={editor?.isActive('codeBlock') ? 'is-active' : ''}><Code2 size={16} /><span>Khối code</span></button>
                                    <button type="button" title="Link" onClick={() => { const url = prompt('Enter URL'); if (url) editor?.chain().focus().setLink({ href: url }).run(); }} className={editor?.isActive('link') ? 'is-active' : ''}><LinkIcon size={16} /><span>Liên kết</span></button>
                                </div>
                            </TabsContent>
                            <TabsContent value="heading">
                                <div className="flex gap-2 flex-wrap">
                                    <button type="button" title="H1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={18} /></button>
                                    <button type="button" title="H2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 size={18} /></button>
                                    <button type="button" title="H3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 size={18} /></button>
                                    <button type="button" title="H4" onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} className={editor?.isActive('heading', { level: 4 }) ? 'is-active' : ''}><Heading4 size={18} /></button>
                                    <button type="button" title="H5" onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()} className={editor?.isActive('heading', { level: 5 }) ? 'is-active' : ''}><Heading5 size={18} /></button>
                                    <button type="button" title="H6" onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()} className={editor?.isActive('heading', { level: 6 }) ? 'is-active' : ''}><Heading6 size={18} /></button>
                                </div>
                            </TabsContent>
                            <TabsContent value="list">
                                <div className="flex gap-2 flex-wrap">
                                    <button type="button" title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'is-active' : ''}><List size={18} /></button>
                                    <button type="button" title="Ordered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={18} /></button>
                                    <button type="button" title="Task List" onClick={() => editor?.chain().focus().toggleTaskList().run()} className={editor?.isActive('taskList') ? 'is-active' : ''}><ListChecks size={18} /></button>
                                    <button type="button" title="Split List Item" onClick={() => editor?.chain().focus().splitListItem('listItem').run()} disabled={!editor?.can().splitListItem('listItem')}><Split size={16} /></button>
                                    <button type="button" title="Sink List Item" onClick={() => editor?.chain().focus().sinkListItem('listItem').run()} disabled={!editor?.can().sinkListItem('listItem')}><ArrowRight size={16} /></button>
                                    <button type="button" title="Lift List Item" onClick={() => editor?.chain().focus().liftListItem('listItem').run()} disabled={!editor?.can().liftListItem('listItem')}><ArrowLeft size={16} /></button>
                                    {/* <button type="button" title="Split Task Item" onClick={() => editor?.chain().focus().splitListItem('taskItem').run()} disabled={!editor?.can().splitListItem('taskItem')}><Split size={16} /></button>
                  <button type="button" title="Sink Task Item" onClick={() => editor?.chain().focus().sinkListItem('taskItem').run()} disabled={!editor?.can().sinkListItem('taskItem')}><ArrowRight size={16} /></button>
                  <button type="button" title="Lift Task Item" onClick={() => editor?.chain().focus().liftListItem('taskItem').run()} disabled={!editor?.can().liftListItem('taskItem')}><ArrowLeft size={16} /></button> */}
                                </div>
                            </TabsContent>
                            <TabsContent value="table">
                                <div className="flex gap-2 flex-wrap">
                                    <button type="button" title="Insert Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></button>
                                    <button type="button" title="Add Column Before" onClick={() => editor?.chain().focus().addColumnBefore().run()}><Columns2 size={16} /></button>
                                    <button type="button" title="Add Column After" onClick={() => editor?.chain().focus().addColumnAfter().run()}><Columns2 size={16} /></button>
                                    <button type="button" title="Delete Column" onClick={() => editor?.chain().focus().deleteColumn().run()}><Trash2 size={16} /></button>
                                    <button type="button" title="Add Row Before" onClick={() => editor?.chain().focus().addRowBefore().run()}><Rows2 size={16} /></button>
                                    <button type="button" title="Add Row After" onClick={() => editor?.chain().focus().addRowAfter().run()}><Rows2 size={16} /></button>
                                    <button type="button" title="Delete Row" onClick={() => editor?.chain().focus().deleteRow().run()}><Trash2 size={16} /></button>
                                    <button type="button" title="Delete Table" onClick={() => editor?.chain().focus().deleteTable().run()}><Trash2 size={16} /></button>
                                    <button type="button" title="Merge Cells" onClick={() => editor?.chain().focus().mergeCells().run()}><Merge size={16} /></button>
                                    <button type="button" title="Split Cell" onClick={() => editor?.chain().focus().splitCell().run()}><Split size={16} /></button>
                                    <button type="button" title="Toggle Header Column" onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}>1</button>
                                    <button type="button" title="Toggle Header Row" onClick={() => editor?.chain().focus().toggleHeaderRow().run()}>2</button>
                                    <button type="button" title="Toggle Header Cell" onClick={() => editor?.chain().focus().toggleHeaderCell().run()}><SquareStack size={16} /></button>
                                    <button type="button" title="Merge or Split" onClick={() => editor?.chain().focus().mergeOrSplit().run()}><Merge size={16} /></button>
                                    <button type="button" title="Set Cell Attribute" onClick={() => editor?.chain().focus().setCellAttribute('colspan', 2).run()}><Columns2 size={16} /></button>
                                    <button type="button" title="Fix Tables" onClick={() => editor?.chain().focus().fixTables().run()}><TableIcon size={16} /></button>
                                    <button type="button" title="Go to Next Cell" onClick={() => editor?.chain().focus().goToNextCell().run()}><ArrowDown size={16} /></button>
                                    <button type="button" title="Go to Previous Cell" onClick={() => editor?.chain().focus().goToPreviousCell().run()}><ArrowUp size={16} /></button>
                                </div>
                            </TabsContent>
                            <TabsContent value="align">
                                <div className="flex gap-2 flex-wrap">
                                    <button type="button" title="Align Left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={16} /></button>
                                    <button type="button" title="Align Center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={16} /></button>
                                    <button type="button" title="Align Right" onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={16} /></button>
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
                                                const url = URL.createObjectURL(file);
                                                editor?.chain().focus().setImage({ src: url }).run();
                                            }}
                                        />
                                    </label>
                                    <button type="button" title="Horizontal Rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={16} /></button>
                                </div>
                            </TabsContent>
                        </Tabs>
                        <EditorContent
                            editor={editor}
                            className="tiptap-content min-h-[300px] p-3 focus:outline-none rounded-br-md rounded-bl-md focus:border-none"
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
            background-color: #e9e9e9;
            color: #000;
            border-color: #2563eb;
            padding: 0.2rem 0.5rem;
            border-radius: calc(var(--radius) - 2px);
            }
          `}</style>
                </div>
                <div className="mb-4 col-span-2">
                    <label className="block font-medium mb-1">Hình ảnh bệnh</label>
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
                                const currentFiles = Array.from((getValues("images") as FileList | File[] | undefined) || []);
                                const mergedFiles = [...currentFiles, ...newFiles];
                                setValue("images", mergedFiles);
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
                                                const files = Array.from((getValues("images") as FileList | File[] | undefined) || []);
                                                files.splice(idx, 1);
                                                setValue("images", files);
                                            }}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-primary text-white font-semibold">
                    {loading ? "Đang thêm..." : "Thêm bệnh"}
                </button>
                {message && <div className="mt-4 text-center text-green-600">{message}</div>}
            </form>
        </div>
    );
}
