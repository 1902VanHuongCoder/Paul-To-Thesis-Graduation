"use client";
import React, { useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";
import { Input } from "@/components/ui/input/input";
import Button from "@/components/ui/button/button-brand";
import generateSlug from "@/lib/generateSlug";
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
import { useRouter } from "next/navigation";
import { useDictionary } from "@/contexts/dictonary-context";

type News = {
    newsID: number;
    title: string;
    subtitle?: string | null;
    titleImageUrl?: string | null;
    slug?: string;
    isPublished: boolean;
    isDraft: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
};

export default function AddNewsPage() {
    const { user } = useUser();
    const router = useRouter();
    const { lang } = useDictionary();
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [slug, setSlug] = useState("");
    const [tags, setTags] = useState<number[]>([]);
    const [tagOptions, setTagOptions] = useState<{ newsTagID: number; tagName: string }[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [titleImage, setTitleImage] = useState<File | null>(null);
    const [titleImageUrl, setTitleImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [editorImages, setEditorImages] = useState<File[]>([]);

    const [newsList, setNewsList] = useState<News[]>([]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);
        if (!user) {
            setErrorMsg("Bạn cần đăng nhập để tạo bài viết.");
            return;
        }
        try {
            // 1. Upload all images (title + editor images) using /multiple
            const filesToUpload = [...editorImages];
            if (titleImage) filesToUpload.unshift(titleImage);

            let uploadedUrls: string[] = [];
            if (filesToUpload.length > 0) {
                const formData = new FormData();
                filesToUpload.forEach(file => formData.append("files", file));
                const res = await fetch(`${baseUrl}/api/upload/multiple`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                uploadedUrls = data.files.map((f: { url: string }) => f.url);
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
            const userID = user.userID || 0; // Use userID from context or default to 0
            console.log({
                userID,
                title,
                titleImageUrl,
                subtitle,
                content: JSON.stringify(content),
                slug,
                images,
                tags,
                isPublished,
                isDraft: isPublished ? false : true, // Always create as published, draft can be handled later
            });
            const res = await fetch(`${baseUrl}/api/news`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID,
                    title,
                    titleImageUrl,
                    subtitle,
                    content: JSON.stringify(content),
                    slug,
                    images,
                    tags,
                    isPublished,
                    isDraft: isPublished ? false : true, // Always create as published, draft can be handled later
                })
            });
            if (!res.ok) {
                const data = await res.json();
                setErrorMsg(data.message || data.error || "Tạo bài viết thất bại.");
            } else {
                setSuccessMsg("Tạo bài viết thành công!");
            }
        } catch (err) {
            setErrorMsg("Có lỗi xảy ra khi tạo bài viết.");
            console.error("Error creating news:", err);
        } finally {
            setLoading(false);
        }
    };

    // Start editing
    const startEdit = (newsID: number) => {
        router.push(`/${lang}/edit-news/${newsID}`);
    };

    // Delete news
    const handleDelete = async (newsID: number) => {
        if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
        try {
            // 1. Fetch news detail to get all image URLs
            const resDetail = await fetch(`${baseUrl}/api/news/${newsID}`);
            if (!resDetail.ok) {
                setErrorMsg("Không lấy được thông tin bài viết.");
                return;
            }
            const news = await resDetail.json();
            // Collect all related image URLs (titleImageUrl + images array)
            const allImageUrls = [
                news.titleImageUrl,
                ...(news.images || [])
            ].filter(Boolean);

            // 2. Delete all images from storage
            if (allImageUrls.length > 0) {
                await fetch(`${baseUrl}/api/upload/multi-delete`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: allImageUrls }),
                });
            }

            // 3. Delete news
            const res = await fetch(`${baseUrl}/api/news/${newsID}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccessMsg("Đã xóa bài viết.");
                fetchNewsList();
            } else {
                setErrorMsg("Xóa bài viết thất bại.");
            }
        } catch {
            setErrorMsg("Có lỗi xảy ra khi xóa.");
        }
    };

    // Fetch tag options from server
    useEffect(() => {
        const fetchTagsOfNews = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/tag-of-news`);
                const data = await response.json();
                setTagOptions(data);
                alert("Fetched tags successfully!");
                console.log("Fetched tags:", data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };
        fetchTagsOfNews();
    }, []);

    const fetchNewsList = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/news`);
            if (res.ok) {
                const data = await res.json();
                setNewsList(data);
                console.log(data);
            }
        } catch (err) {
            console.error("Error fetching news list:", err);
        }
    };

    useEffect(() => {
        fetchNewsList();
    }, []);


    if (!editor) return null

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Tạo bài viết mới</h1>

            <div>
                <label className="font-medium">Tiêu đề *</label>
                <Input
                    type="text"
                    value={title}
                    onChange={e => {
                        const slug = generateSlug(e.target.value);
                        setSlug(slug);
                        setTitle(e.target.value)
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
                    placeholder="https://example.com/news/slug"
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
                    <EditorContent editor={editor} className='tiptap-content' />
                </div>
                <div className="element"></div>
            </div>
            <div className="flex items-center gap-2">
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
                {loading ? "Đang lưu..." : "Tạo bài viết"}
            </Button>
            <button
                type="button"
                onClick={handleSubmit}
                className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
                Sumit mas ow
            </button>
            <h2 className="text-xl font-semibold mt-10 mb-2">Danh sách bài viết</h2>
            <div className="space-y-2">
                {newsList.map(news => (
                    <div key={news.newsID} className="flex items-center gap-2 border-b py-2">
                        <span className="font-medium">{news.title}</span>
                        <span className="text-gray-500 text-sm">{news.subtitle}</span>
                        <span className="text-xs text-gray-400">{new Date(news.createdAt).toLocaleDateString()}</span>
                        {news.titleImageUrl && (
                            <NextImage
                                width={48}
                                height={48}
                                src={news.titleImageUrl}
                                alt={news.title}
                                className="w-12 h-12 object-cover rounded"
                            />
                        )}
                        <span className="text-xs px-2 py-1 rounded bg-gray-100">{news.views ? news.views : 0} views</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100">{news.isPublished ? "Công khai" : "Nháp"}</span>
                        <Button size="sm" variant="outline" onClick={() => startEdit(news.newsID)}>Sửa</Button>
                        <Button size="sm" variant="primary" onClick={() => handleDelete(news.newsID)}>Xóa</Button>

                    </div>
                ))}
            </div>
        </div>
    );
}