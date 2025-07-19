"use client";

import { Breadcrumb, CommentItem, ContentLoading, ToTopButton } from "@/components";
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
import { Tag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Button } from "@/components/ui/button/button";
import { useUser } from "@/contexts/user-context";
import NoImage from "@public/images/rice-and-leaf.png";

interface Author {
    username: string;
    userID: string;
    email: string;
    avatar: string | null; // Assuming avatar can be a URL or null
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
    dislikeCount: number;
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
    // Get newsID from URL parameters
    const { newsID } = useParams(); // Get newsID from URL parameters
    
    // Router
    const router = useRouter();

    // Contexts 
    const { lang } = useDictionary(); // Language context to get the current language
    const { user } = useUser(); // User context to get the current user

    // State variables
    const [news, setNews] = useState<NewsDetail | null>(null); // Current news detail
    const [otherNews, setOtherNews] = useState<NewsDetail[]>([]); // List of other news items
    const [loading, setLoading] = useState(true); // Loading state to show a loading message while fetching data
    const [newComment, setNewComment] = useState(""); // New comment content
    const [submitting, setSubmitting] = useState(false); // Submitting state to disable form while submitting
    const commentInputRef = useRef<HTMLTextAreaElement>(null); // Reference to the comment input field

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
        if (!newComment.trim() || !news || !user) return; // Ensure there's content and news is loaded
        setSubmitting(true);
        try {
            // Post new comment to the API
            await fetch(`${baseUrl}/api/news-comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: user.userID, // Assuming you have user context
                    newsID: news.newsID,
                    content: newComment,
                }),
            });

            // Refetch comments (or optimistically update)
            const res = await fetch(`${baseUrl}/api/news-comment/news/${news.newsID}`);
            const comments = await res.json();
            setNews((prev) => prev ? { ...prev, comments } : prev);
            setNewComment("");
            commentInputRef.current?.focus(); // Reset input and focus it
        } catch (err) {
            console.error("Failed to submit comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle like and dislike actions for comments
    const handleLikeComment = async (commentID: number) => {
        try {
            await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "like" }),
            })
            // Refetch comments (or optimistically update)
            const res = await fetch(`${baseUrl}/api/news-comment/news/${news?.newsID}`);
            const comments = await res.json();
            setNews((prev) => prev ? { ...prev, comments } : prev);

        } catch (error) {
            console.log(error);
        }
    }

    const handleDislikeComment = async (commentID: number) => {
        try {
            await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "dislike" }),
            });
            // Refetch comments (or optimistically update)
            const res = await fetch(`${baseUrl}/api/news-comment/news/${news?.newsID}`);
            const comments = await res.json();
            setNews((prev) => prev ? { ...prev, comments } : prev);
        } catch (error) {
            console.log(error);
        }
    }

    // Fetch news detail and other news when newsID changes
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

    if (loading) return <ContentLoading />;
    if (!news) return <div>Bài đăng không tồn tại.</div>;

    // Format breadcrumb title
    // const firstWord = news && news.title.split(" ")[0][0].toUpperCase() + news.title.split(" ")[0].slice(1).toLowerCase() || ""; 
    // const breadcrumbTitle = news && firstWord + " " + news.title.split(" ").slice(1).join(" ").toLowerCase() || "Tin tức";
    
    return (
        <div className="py-10 px-6">
            <Breadcrumb
                
                items={[
                    { label: "Trang chủ", href: "/" },
                    { label: "Tin tức", href: `/${lang}/homepage/news` },
                    { label: news.title || "Chi tiết bài đăng" }
                ]}
            />

            <div className="relative grid grid-cols-[1fr_400px] gap-6">
                <div className="flex-1 overflow-y-auto h-screen">
                    {/* Title and Title Image */}
                    <h1 className="text-3xl font-bold mt-6 mb-2">{news.title}</h1>
                    {/* Tags */}
                    {news.hastags && news.hastags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2 ">
                            {news.hastags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-blue-100 text-blue-700 p-2 rounded text-sm flex items-center gap-x-1"
                                >
                                    <span><Tag height={18} /></span><span>{tag.tagName}</span>
                                </span>
                            ))}
                        </div>
                    )}
                    {news.titleImageUrl && (
                        <NextImage
                            width={800}
                            height={400}
                            src={news.titleImageUrl || NoImage}
                            alt={news.title}
                            className="w-full max-h-96 object-cover rounded mb-4"
                        />
                    )}

                    {/* Subtitle */}
                    {news.subtitle && <div className="text-lg text-gray-600 mb-6">{news.subtitle}</div>}
                    {/* Content */}
                    <div className="prose prose-blue max-w-4xl mx-auto tiptap-content mb-8 ">
                        {news?.content && <EditorContent editor={editor} className="tiptap-editor" />}
                    </div>
                </div>
                {/* Other News */}
                <div className="shrink-0 sticky top-0 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Những bài viết khác</h2>
                    <div className="grid gap-4">
                        {otherNews.slice(0, 5).map((item) => (
                            <div
                                key={item.newsID}
                                className="p-4 border rounded hover:bg-gray-100 cursor-pointer flex gap-4"
                            >
                                <div className="flex-shrink-0 w-20 h-20"> 
                                    
                                    <NextImage
                                        width={100}
                                        height={100}
                                        src={item.titleImageUrl || NoImage}
                                        alt={item.title}
                                        className="object-cover rounded w-full h-full"
                                    />
                                </div>
                                <div className="">
                                    <div className="font-bold w-[280px] truncate">{item.title}</div>
                                    <div className="text-sm w-[280px] truncate text-gray-500">{item.subtitle}</div>
                                    <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                                    <Button
                                        variant={"link"}
                                        className="cursor-pointer px-0"
                                        onClick={() => router.push(`/${lang}/homepage/news/${item.newsID}`)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <hr className="my-8"/>
            {/* Comment Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Bình luận về bài viết</h2>
                <form onSubmit={handleCommentSubmit} className="mb-6 flex flex-col gap-2 items-end">
                    <Textarea
                        ref={commentInputRef}
                        className=""
                        placeholder="Nhập bình luận của bạn..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <Button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded w-fit cursor-pointer "
                        disabled={submitting || !newComment.trim()}
                    >
                        {submitting ? "Đang gửi bình luận..." : "Gửi bình luận"}
                    </Button>
                </form>
                <div className="space-y-6">
                    {news?.comments && news.comments.length > 0 ? (
                        news.comments
                            .filter(c => c.status === "active")
                            .map((comment, index) => (
                                <CommentItem
                                    index={index}
                                    commentsLength={news.comments.length}
                                    userID={comment.userID}
                                    key={comment.commentID}
                                    avatar={comment.user_comments?.avatar || NoImage}
                                    name={comment.user_comments?.username || `User ${comment.userID}`}
                                    date={new Date(comment.commentAt).toLocaleDateString()}
                                    comment={comment.content}
                                    likeCount={comment.likeCount}
                                    dislikeCount={comment.dislikeCount}
                                    onLike={() => handleLikeComment(comment.commentID)}
                                    onDislike={() => handleDislikeComment(comment.commentID)}
                                    reFetchComments={() => {}}
                                />
                            ))
                    ) : (
                        <div className="text-gray-500">Chưa có bình luận nào cho bài đăng này.</div>
                    )}
                </div>
            </div>

            <ToTopButton />
        </div>
    );
}