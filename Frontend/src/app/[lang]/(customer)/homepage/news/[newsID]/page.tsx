"use client";

import { Breadcrumb, CommentItem } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import NextImage from "next/image";

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
import { baseUrl } from "@/lib/base-url";

interface Author {
    username: string;
    userID: string;
    email: string;
}

interface Tag {
    tagName: string;
    newsTagID: number
}

interface Comment {
    commentID: number;
    userID: string;
    newsID: number;
    content: string;
    commentAt: string;
    likeCount: number;
    dislikeCount:number;
    status: "active" | "deleted";
    user_comments?: Author; // Optional, if you want to include user details
}

interface NewsDetail {
    newsID: number;
    title: string;
    titleImageUrl: string | null;
    subtitle?: string | null;
    content?: string | null;
    slug?: string;
    images?: string[];
    views: number;
    tags?: number[];
    isDraft: boolean;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    userID: number;
    hastags?: Tag[];
    comments: Comment[];
}

export default function NewsDetailPage() {
    const { newsID } = useParams();
    const { lang } = useDictionary();
    const [news, setNews] = useState<NewsDetail | null>(null);
    const [otherNews, setOtherNews] = useState<NewsDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    // Only create the editor when news?.content is available
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
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6],
                HTMLAttributes: { class: 'text-gray-900 dark:text-white font-bold' },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Gapcursor,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: '<p>Loading...</p>', // Initial content while loading
        editable: false,
    }
    );

    // Handle comment submit
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !news) return;
        setSubmitting(true);
        try {
            // Replace with actual userID (e.g., from auth context)
            const userID = 1;
            await fetch(`${baseUrl}/api/news-comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID,
                    newsID: news.newsID,
                    content: newComment,
                }),
            });
            // Refetch comments (or optimistically update)
            const res = await fetch(`${baseUrl}/api/news-comment/news/${news.newsID}`);
            const comments = await res.json();
            setNews((prev) => prev ? { ...prev, comments } : prev);
            setNewComment("");
            commentInputRef.current?.focus();
        } catch (err) {
            console.error("Failed to submit comment:", err);
            // Handle error (show toast, etc.)
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeComment = async (commentID: number) => { 
        try{
            await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
                method:"PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "like" }),
            })
        }catch(error){
            console.log(error);
        }
    }

    const handleDislikeComment = async (commentID: number) => { 
        try{
            await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
                method:"PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "dislike" }),
            })
        }catch(error){
            console.log(error);
        }
    }
    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/news/${newsID}`);
                const data = await res.json();
                setNews(data);
                console.log("Fetched news detail:", data);
                // Fetch other news (excluding current)
                const resOther = await fetch(`${baseUrl}/api/news`);
                const allNews = await resOther.json();
                setOtherNews(allNews.filter((n: NewsDetail) => n.newsID !== Number(newsID)));
                editor?.commands.setContent(JSON.parse(data.content));
            } catch (error) {
                console.error("Failed to fetch news detail:", error);
                setNews(null);
            } finally {
                setLoading(false);
            }
        };
        if (newsID) fetchNewsDetail();
    }, [newsID, editor]);

    if (loading) return <div>Loading...</div>;
    if (!news) return <div>News not found.</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Breadcrumb
                items={[
                    { label: "Homepage", href: "/" },
                    { label: "News", href: `/${lang}/homepage/news` },
                    { label: news.title }
                ]}
            />

            {/* Title and Title Image */}
            <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
            {news.titleImageUrl && (
                <NextImage
                    width={800}
                    height={400}
                    src={news.titleImageUrl}
                    alt={news.title}
                    className="w-full max-h-96 object-cover rounded mb-4"
                />
            )}

            {/* Subtitle */}
            {news.subtitle && <div className="text-lg text-gray-600 mb-2">{news.subtitle}</div>}

            {/* Tags */}
            {news.hastags && news.hastags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {news.hastags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                            {tag.tagName}
                        </span>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="prose prose-blue max-w-none tiptap-content mb-8">
                {news?.content && <EditorContent editor={editor} className="tiptap-editor" />}
            </div>

            {/* Comment Section */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-2">
                    <input
                        ref={commentInputRef}
                        type="text"
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={submitting || !newComment.trim()}
                    >
                        {submitting ? "Posting..." : "Post"}
                    </button>
                </form>
                <div className="space-y-6">
                    {news?.comments && news.comments.length > 0 ? (
                        news.comments
                            .filter(c => c.status === "active")
                            .map((comment) => (
                                <CommentItem
                                    key={comment.commentID}
                                    avatar={"https://cdn-icons-png.freepik.com/256/197/197374.png"}
                                    name={comment.user_comments?.username || `User ${comment.userID}`}
                                    date={new Date(comment.commentAt).toLocaleDateString()}
                                    comment={comment.content}
                                    likeCount={comment.likeCount}
                                    dislikeCount={comment.dislikeCount}
                                    onLike={() => handleLikeComment(comment.commentID)}
                                    onDislike={() => handleDislikeComment(comment.commentID)}
                                />
                            ))
                    ) : (
                        <div className="text-gray-500">No comments yet.</div>
                    )}
                </div>
            </div>

            {/* Other News */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Other News</h2>
                <div className="grid gap-4">
                    {otherNews.slice(0, 4).map((item) => (
                        <div
                            key={item.newsID}
                            className="p-4 border rounded hover:bg-gray-50 cursor-pointer flex gap-4"
                            onClick={() => router.push(`/${lang}/homepage/news/${item.newsID}`)}
                        >
                            <NextImage
                                width={96}
                                height={96}
                                src={item.titleImageUrl || "/placeholder.jpg"}
                                alt={item.title}
                                className="w-24 h-24 object-cover rounded"
                            />
                            <div>
                                <div className="font-bold">{item.title}</div>
                                <div className="text-sm text-gray-500">{item.subtitle}</div>
                                <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}