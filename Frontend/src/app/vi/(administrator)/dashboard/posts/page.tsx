"use client";
import React, { useEffect, useState } from "react";
import { useEditor } from '@tiptap/react'
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
import NoImage from "@public/images/NoImage.jpg";
import { CircleUserRound, Eye, MessageCircle} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import clsx from "clsx";
import NextLink from "next/link";
import toast from "react-hot-toast";
import { deleteNews, fetchNews, fetchNewsById } from "@/lib/news-apis";
import { deleteMultipleImages } from "@/lib/file-apis";
type Comment = {
    commentID: number;
    content: string;
    createdAt: string;
    updatedAt: string;
}
type News = {
    newsID: number;
    title: string;
    subtitle: string | null;
    titleImageUrl?: string | null;
    slug?: string;
    isPublished: boolean;
    isDraft: boolean;
    views: number;
    author: {
        userID: number;
        username: string;
        email: string;
        avatarUrl?: string | null;
    }
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
};

export default function AddNewsPage() {

    const [newsList, setNewsList] = useState<News[]>([]);

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

    // Delete news
    const handleDelete = async (newsID: number) => {
        toast((t) => (
            <span>
                Bạn có chắc muốn xóa bài viết này?
                <div className="mt-2 flex gap-2 justify-end">
                    <button
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                // 1. Fetch news detail to get all image URLs
                                const news = await fetchNewsById(newsID);
                                if (!news) {
                                    toast.error("Không lấy được thông tin bài viết.", { position: "top-center" });
                                    return;
                                }
                                // Collect all related image URLs (titleImageUrl + images array)
                                const allImageUrls = [
                                    news.titleImageUrl,
                                    ...(news.images || [])
                                ].filter(Boolean);

                                // 2. Delete all images from storage
                                if (allImageUrls.length > 0) {
                                    await deleteMultipleImages(allImageUrls);
                                }

                                // 3. Delete news
                                const res = await deleteNews(newsID);
                                if (res) {
                                    toast.success("Đã xóa bài viết thành công!", { position: "top-center" });
                                    fetchNewsList();
                                } else {
                                    toast.error("Không xóa được bài viết.", { position: "top-center" });
                                }
                            } catch (error) {
                                console.error("Error deleting news:", error);
                                toast.error("Xóa bài viết thất bại. Vui lòng thử lại.", { position: "top-center" });
                            }
                        }}
                    >
                        Xóa
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Hủy
                    </button>
                </div>
            </span>
        ), {
            duration: 8000, position: "top-center"
        });
    };

    const fetchNewsList = async () => {
        try {
           const data = await fetchNews();
           console.log("Fetched news data:", data);
           setNewsList(data);
        } catch (err) {
            console.error("Error fetching news list:", err);
        }
    };

    useEffect(() => {
        const fetchTagsOfNews = async () => {
            try {
                await fetchTagsOfNews();
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };
        fetchTagsOfNews();
        fetchNewsList();
    }, []);

    if (!editor) return null

    return (
        <div className="">
            <h2 className="text-xl font-semibold mb-6">Danh Sách Tin Tức Cửa Hàng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsList.map(news => (
                    <div
                        key={news.newsID}
                        className="relative flex flex-col bg-white rounded-lg border p-4 gap-4 items-start sm:items-center"
                    >
                        {/* Date Circle */}
                        <div className="flex flex-col items-center mr-4 absolute top-7 right-3 z-12">
                            <div className="w-18 h-18 rounded-full bg-yellow-400 flex flex-col items-center justify-center text-white font-bold text-lg mb-2">
                                <span className="text-2xl leading-none">{String(new Date(news.createdAt).getDate()).padStart(2, '0')}</span>
                                <span className="text-xs font-medium">{new Date(news.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' })}</span>
                            </div>
                        </div>
                        {/* Image and Content */}
                        <div className="flex-1 flex flex-col gap-4 items-start sm:items-center">
                            {news.titleImageUrl && (
                                <div className="w-full h-60 relative rounded-lg overflow-hidden">
                                    <NextImage
                                        width={400}
                                        height={400}
                                        src={news.titleImageUrl ? news.titleImageUrl : NoImage}
                                        alt={news.title}
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-200 ease-in-out z-10"
                                    />
                                </div>

                            )}
                            <div className="flex-1 flex flex-col gap-1 justify-between">
                                <div className="flex flex-col items-center">
                                    {/* Meta Row */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 mb-1">
                                        <span className="flex items-center text-green-70"><span><CircleUserRound height={16} className="stroke-primary" /></span><span className=" max-w-[100px] truncate">{news.author.username}</span></span>
                                        <span className="flex items-center text-green-70 "><span><Eye height={16} className="stroke-primary" /></span><span>{news.views ? news.views : 0} Lượt xem</span></span>
                                        <span className="flex items-center text-green-70"><span><MessageCircle height={14} className="stroke-primary" /></span> <span>{news.comments.length} Bình luận</span></span>
                                    </div>
                                    {/* Title */}
                                    <span className="font-bold text-green-700 text-lg py-4 text-center">
                                        {news.title.length > 50 ? news.title.slice(0, 50) + '...' : news.title}
                                    </span>
                                    {/* Excerpt */}
                                    <span className="text-gray-700 text-sm mb-2 text-center">{news.subtitle && news.subtitle.length > 80 ? news.subtitle.slice(0, 80) + "..." : news.subtitle}</span>
                                    {/* News Data */}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-2 justify-between">
                                    <span className={clsx("text-xs px-2 py-1 rounded bg-gray-100", news.isPublished ? "bg-green-100 text-green-700" : "")}>{news.isPublished ? "Công khai" : "Nháp"}</span>
                                    <div className="flex gap-2 items-center">
                                        <NextLink href={`/vi/dashboard/posts/edit-post/${news.newsID}`} className="px-2 bg-gray-100 py-1 rounded-md cursor-pointer hover:bg-gray-200">Sửa</NextLink>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(news.newsID)} className="cursor-pointer ">Xóa</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="my-4 flex justify-end mt-8">
                <NextLink className="bg-primary text-white py-2 px-4 rounded-md" href={`/vi/dashboard/posts/add-post`}>Thêm bài viết mới</NextLink>
            </div>
        </div>
    );
}