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
    const router = useRouter();
    const { lang } = useDictionary();


    const [newsList, setNewsList] = useState<News[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);


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

    // Start editing
    const startEdit = (newsID: number) => {
        router.push(`/${lang}/dashboard/posts/edit-post/${newsID}`);
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
                setErrorMsg("Không xóa được bài viết.");
            }
        } catch(error) {
            console.error("Error deleting news:", error);
            setErrorMsg("Đã xảy ra lỗi khi xóa bài viết.");
        }
    };

    // Fetch tag options from server
    useEffect(() => {
        const fetchTagsOfNews = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/tag-of-news`);
                const data = await response.json();
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
            <h2 className="text-xl font-semibold mt-10 mb-2">Danh sách bài viết</h2>
            {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
            {successMsg && <div className="text-green-500 mb-4">{successMsg}</div>}
            <div className="mb-4">
                <Button variant="primary" onClick={() => router.push(`/${lang}/dashboard/posts/add-post`)}>Thêm bài viết mới</Button>
            </div>
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