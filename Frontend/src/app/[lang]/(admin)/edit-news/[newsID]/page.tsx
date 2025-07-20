"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { baseUrl } from "@/lib/others/base-url";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
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

type News = {
    newsID: number;
    title: string;
    subtitle?: string | null;
    titleImageUrl?: string | null;
    slug?: string;
    content?: string;
    images?: string[];
    isPublished: boolean;
    isDraft: boolean;
    createdAt: string;
    updatedAt: string;
    hastags?: { newsTagID: number; tagName: string }[];
};

export default function EditNewsPage() {
    const params = useParams();
    const router = useRouter();
    const newsID = params?.newsID as string;

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
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);
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
        fetch(`${baseUrl}/api/tag-of-news`)
            .then((res) => res.json())
            .then(setTagOptions)
            .catch(() => { });
    }, []);

    // Fetch news data
    useEffect(() => {
        if (!newsID) return;
        fetch(`${baseUrl}/api/news/${newsID}`)
            .then((res) => res.json())
            .then((news: News) => {
                setTitle(news.title || "");
                setSubtitle(news.subtitle || "");
                setSlug(news.slug || "");
                setIsPublished(news.isPublished);
                setTitleImageUrl(news.titleImageUrl || "");
                setOldTitleImageUrl(news.titleImageUrl || "");
                setTags(news.hastags?.map((t) => t.newsTagID) || []);
                setOldImages(news.images || []);
                setEditorImageUrls(news.images || []);
                setContent(news.content || "");
            });
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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        try {
            // 1. Upload images if changed
            let uploadedUrls: string[] = [];
            const filesToUpload = [...editorImages];
            if (titleImage) filesToUpload.unshift(titleImage);

            if (filesToUpload.length > 0) {
                const formData = new FormData();
                filesToUpload.forEach((file) => formData.append("files", file));
                const res = await fetch(`${baseUrl}/api/upload/multiple`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                uploadedUrls = data.files.map((f: { url: string }) => f.url);
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

            if(titleImage){
                oldImageUrlsInEditor.push(oldTitleImageUrl);
            }

            if(newTitleImageUrl !== oldTitleImageUrl) { 
                console.log("You have changed the title image URL. Deleting old title image URL:", oldTitleImageUrl);
            }

            console.log("Old images in editor:", oldImageUrlsInEditor);
            // Delete old images that are not in the new list
            if (oldImageUrlsInEditor.length > 0) {
                await fetch(`${baseUrl}/api/upload/multi-delete`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: oldImageUrlsInEditor }),
                });
            }



            const res = await fetch(`${baseUrl}/api/news/${newsID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    subtitle,
                    slug,
                    titleImageUrl: newTitleImageUrl,
                    content: JSON.stringify(content),
                    images: newImages,
                    tags,
                    isPublished,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setErrorMsg(data.message || data.error || "Cập nhật bài viết thất bại.");
            } else {
                setSuccessMsg("Cập nhật bài viết thành công!");
                router.refresh?.();
            }
        } catch (err) {
            console.error("Error updating news:", err);
            setErrorMsg("Có lỗi xảy ra khi cập nhật bài viết.");
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
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Chỉnh sửa bài viết</h1>
            <form onSubmit={handleUpdate}>
                <div>
                    <label className="font-medium">Tiêu đề *</label>
                    <Input
                        type="text"
                        value={title}
                        onChange={e => {
                            const slug = generateSlug(e.target.value);
                            setSlug(slug);
                            setTitle(e.target.value);
                        }}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="font-medium">Phụ đề</label>
                    <Input
                        type="text"
                        value={subtitle}
                        onChange={e => setSubtitle(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="font-medium">Slug (SEO)</label>
                    <Input
                        type="text"
                        value={`https://example.com/news/${slug}`}
                        onChange={e => setSlug(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div className="relative">
                    <button
                        type="button"
                        className="w-full border rounded px-3 py-2 text-left"
                        onClick={() => setShowTagDropdown((v) => !v)}
                    >
                        {tags.length === 0
                            ? "Chọn tag"
                            : tags
                                .map((id) => tagOptions.find((t) => t.newsTagID === id)?.tagName)
                                .filter(Boolean)
                                .join(", ")}
                    </button>
                    {showTagDropdown && (
                        <div className="absolute z-10 bg-white border rounded w-full mt-1 max-h-60 overflow-y-auto shadow">
                            {tagOptions.length > 0 ? (
                                tagOptions.map((tag) => (
                                    <label
                                        key={tag.newsTagID}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={tags.includes(tag.newsTagID)}
                                            onChange={() => {
                                                const tagID = tag.newsTagID;
                                                setTags((prev) =>
                                                    prev.includes(tagID)
                                                        ? prev.filter((id) => id !== tagID)
                                                        : [...prev, tagID]
                                                );
                                            }}
                                        />
                                        {tag.tagName}
                                    </label>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-400">Không có tag nào</div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <label className="font-medium">Ảnh tiêu đề</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleTitleImageChange}
                        className="block mt-1"
                    />
                    {titleImageUrl && (
                        <NextImage width={200} height={200} src={titleImageUrl} alt="Title" className="mt-2 max-h-40 rounded" />
                    )}
                </div>
                <div>
                    <label className="font-medium mb-1 block">Nội dung bài viết *</label>
                    <div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
                            <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
                            <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6</button>
                            <button
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={editor.isActive('bulletList') ? 'is-active' : ''}
                            >
                                Toggle bullet list
                            </button>
                            <button
                                onClick={() => editor.chain().focus().splitListItem('listItem').run()}
                                disabled={!editor.can().splitListItem('listItem')}
                            >
                                Split list item
                            </button>
                            <button
                                onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                                disabled={!editor.can().sinkListItem('listItem')}
                            >
                                Sink list item
                            </button>
                            <button
                                onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                                disabled={!editor.can().liftListItem('listItem')}
                            >
                                Lift list item
                            </button>

                            <div> Hello </div>
                            <button
                                onClick={() => editor.chain().focus().toggleTaskList().run()}
                                className={editor.isActive('taskList') ? 'is-active' : ''}
                            >
                                Toggle task list
                            </button>
                            <button
                                onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
                                disabled={!editor.can().splitListItem('taskItem')}
                            >
                                Split list item
                            </button>
                            <button
                                onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
                                disabled={!editor.can().sinkListItem('taskItem')}
                            >
                                Sink list item
                            </button>
                            <button
                                onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
                                disabled={!editor.can().liftListItem('taskItem')}
                            >
                                Lift list item
                            </button>

                            <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
                            <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
                            <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
                            <button onClick={() => {
                                const url = prompt('Enter URL')
                                if (url) editor.chain().focus().setLink({ href: url }).run()
                            }}>Link</button>
                            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
                            <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>Blockquote</button>
                            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>

                            <label>
                                Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        // Store the file in a state array for later upload
                                        setEditorImages(prev => [...prev, file]);
                                        // Optionally show a preview in the editor using a local URL
                                        const url = URL.createObjectURL(file);
                                        editor.chain().focus().setImage({ src: url }).run();
                                    }}
                                />
                            </label>

                            <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                                Set horizontal rule
                            </button>
                            <button
                                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                                }
                            >
                                Insert table
                            </button>
                            <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
                                Add column before
                            </button>
                            <button onClick={() => editor.chain().focus().addColumnAfter().run()}>Add column after</button>
                            <button onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
                            <button onClick={() => editor.chain().focus().addRowBefore().run()}>Add row before</button>
                            <button onClick={() => editor.chain().focus().addRowAfter().run()}>Add row after</button>
                            <button onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
                            <button onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
                            <button onClick={() => editor.chain().focus().mergeCells().run()}>Merge cells</button>
                            <button onClick={() => editor.chain().focus().splitCell().run()}>Split cell</button>
                            <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
                                Toggle header column
                            </button>
                            <button onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                                Toggle header row
                            </button>
                            <button onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
                                Toggle header cell
                            </button>
                            <button onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge or split</button>
                            <button onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}>
                                Set cell attribute
                            </button>
                            <button onClick={() => editor.chain().focus().fixTables().run()}>Fix tables</button>
                            <button onClick={() => editor.chain().focus().goToNextCell().run()}>Go to next cell</button>
                            <button onClick={() => editor.chain().focus().goToPreviousCell().run()}>
                                Go to previous cell
                            </button>
                        </div>
                        <EditorContent editor={editor} className="tiptap-content" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={e => setIsPublished(e.target.checked)}
                        id="isPublished"
                    />
                    <label htmlFor="isPublished">Công khai bài viết</label>
                </div>
                {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                {successMsg && <div className="text-green-600">{successMsg}</div>}
                <Button type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : "Cập nhật bài viết"}
                </Button>
            </form>
        </div>
    );
}