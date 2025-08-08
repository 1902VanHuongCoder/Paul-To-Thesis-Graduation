"use client";

import { Breadcrumb, CommentItem, ContentLoading, ToTopButton } from "@/components";
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
import { Tag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Button } from "@/components/ui/button/button";
import { useUser } from "@/contexts/user-context";
import NoImage from "@public/images/rice-and-leaf.png";
import { isToxicComment } from "@/lib/others/prevent-toxic-comment";
import toast from "react-hot-toast";
import { createNewsComment, dislikeNewsComment, fetchNewsCommentsByNewsID, likeNewsComment } from "@/lib/news-comment-apis";
import { fetchNews } from "@/lib/news-apis";


interface Tag {
    tagName: string;
    newsTagID: number
}

interface Comment {
    commentID: number;
    userID: string;
    newsID: number;
    content: string;
    likeCount: number;
    dislikeCount: number;
    commentAt: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user_comments: {
        username: string;
        userID: number;
        email: string;
        avatar?: string;
    };
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
    const { user } = useUser(); // User context to get the current user

    // State variables
    const [news, setNews] = useState<NewsDetail | null>(null); // Current news detail
    const [comments, setComments] = useState<Comment[]>([]); // Comments for the current news
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
        if(!user){
            toast.error("Bạn cần đăng nhập để bình luận!");
            return;
        }
        if (!newComment.trim() || !news || !user) return; // Ensure there's content and news is loade
        const userAlreadyCommented = comments.some(comment => comment.userID === user.userID);
        if (userAlreadyCommented) {
            toast.error("Bạn đã bình luận về bài viết này rồi!");
            return;
        }
        setSubmitting(true);
        try {
            if (isToxicComment(newComment.trim())) {
                toast.error("Bình luận của bạn chứa từ ngữ không phù hợp!");
                return;
            }
            // Post new comment to the API
            const res = await createNewsComment(
                news.newsID,
                user.userID,
                newComment.trim(),
            )
            if (res) {
                toast.success("Bình luận đã được gửi thành công!");
                setNewComment(""); // Clear the comment input
                commentInputRef.current?.focus(); // Focus the comment input again
                setComments((prev) => [
                    res, ...prev
                ]);
            }
        } catch (err) {
            console.error("Failed to submit comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle like and dislike actions for comments
    const handleLikeComment = async (commentID: number) => {
        if (!news) return;
        const existingComment = comments.map(c => {
            if (c.commentID === commentID) {
                return { ...c, likeCount: c.likeCount + 1 };
            }
            return c;
        })
        setComments(existingComment);

        try {
            const res = await likeNewsComment(commentID);
            if (!res) {
                toast.error("Có lỗi khi thích bình luận này! Vui lòng thử lại sau.");
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDislikeComment = async (commentID: number) => {
        if (!news) return;
        const existingComment = comments.map(c => {
            if (c.commentID === commentID) {
                return { ...c, dislikeCount: c.dislikeCount + 1 };
            }
            return c;
        });
        setComments(existingComment);
        try {
            const res = await dislikeNewsComment(commentID);
            if (!res) {
                toast.error("Có lỗi khi không thích bình luận này! Vui lòng thử lại sau.");
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteComment = (commentID: number) => {
        if (!news) return;
        const updatedComments = comments.filter(c => c.commentID !== commentID);
        setComments(updatedComments);
    }

    // Fetch news detail and other news when newsID changes
    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const allNews = await fetchNews();
                const currentNews = allNews.find((n: NewsDetail) => n.newsID === Number(newsID));
                setNews(currentNews || null);
                setOtherNews(allNews.filter((n: NewsDetail) => n.newsID !== Number(newsID)));
                editor?.commands.setContent(JSON.parse(currentNews?.content || "{}"));
            } catch (error) {
                console.error("Failed to fetch news detail:", error);
                setNews(null);
            } finally {
                setLoading(false);
            }
        };
        const fetchComments = async () => {
            if (!newsID) return;
            try {
                const comments = await fetchNewsCommentsByNewsID(Number(newsID));
                setComments(comments);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            }
        }
        if (newsID) {
            fetchNewsDetail();
            fetchComments();
        }
    }, [newsID, editor]);

    if (loading) return <ContentLoading />;
    if (!news) return <div>Bài đăng không tồn tại.</div>;
    return (
        <div className="py-10 px-6">
            <Breadcrumb

                items={[
                    { label: "Trang chủ", href: "/" },
                    { label: "Tin tức", href: `/vi/homepage/news` },
                    { label: news.title || "Chi tiết bài đăng" }
                ]}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 mx-auto">
                {/* Main News Content */}
                <div className="flex-1">
                    {/* Title */}
                    <h1 className="text-4xl font-extrabold mt-4 mb-3 text-primary-gradient bg-clip-text">
                        {news.title}
                    </h1>
                    {/* Tags */}
                    {news.hastags && news.hastags.length > 0 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {news.hastags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-gradient-to-r from-blue-200 to-green-200 text-blue-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-x-1 shadow-sm"
                                >
                                    <Tag height={16} />
                                    {tag.tagName}
                                </span>
                            ))}
                        </div>
                    )}
                    {/* Title Image */}
                    {news.titleImageUrl && (
                        <div className="overflow-hidden rounded-xl shadow-lg mb-6">
                            <NextImage
                                width={800}
                                height={400}
                                src={news.titleImageUrl || NoImage}
                                alt={news.title}
                                className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                    )}
                    {/* Subtitle */}
                    {news.subtitle && (
                        <div className="text-lg text-gray-600 mb-8 italic">{news.subtitle}</div>
                    )}
                    {/* Content */}
                    <div className="prose prose-blue max-w-none mx-auto tiptap-content mb-10 text-lg leading-relaxed border-[1px] border-gray-200 p-2 rounded-md">
                        {news?.content && <EditorContent editor={editor} className="tiptap-editor" />}
                    </div>
                </div>
                {/* Sidebar: Other News */}
                <aside className="shrink-0 sticky top-24 h-fit bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold mb-6 text-primary-gradient bg-clip-text ">
                        Những bài viết khác
                    </h2>
                    <div className="flex flex-col gap-5">
                        {otherNews.slice(0, 5).map((item) => (
                            <div
                                key={item.newsID}
                                className="flex gap-4 items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition cursor-pointer group"
                                onClick={() => router.push(`/vi/homepage/news/${item.newsID}`)}
                            >
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden shadow">
                                    <NextImage
                                        width={64}
                                        height={64}
                                        src={item.titleImageUrl || NoImage}
                                        alt={item.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate mb-1">{item.subtitle}</div>
                                    <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                                </div>
                                <Button
                                    variant="link"
                                    className="px-0 text-blue-500 dark:text-blue-400 font-medium text-sm"
                                >
                                    Xem
                                </Button>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
            <hr className="my-8" />
            {/* Comment Section */}
            <div className="mt-12 max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
                <h2 className="text-4xl font-extrabold mb-6 text-primary-gradient bg-clip-text text-transparent">
                    Bình luận về bài viết
                </h2>
                <form
                    onSubmit={handleCommentSubmit}
                    className="mb-8 flex flex-col gap-4 items-end"
                >
                    <Textarea
                        ref={commentInputRef}
                        className="min-h-[160px] border-2 border-primary/30 focus:border-primary transition rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-lg"
                        placeholder="Hãy chia sẻ cảm nghĩ của bạn..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={submitting}
                        rows={6}
                    />
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold"
                        disabled={submitting || !newComment.trim()}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Đang gửi...
                            </span>
                        ) : "Gửi bình luận"}
                    </Button>
                </form>
                <div className="space-y-8">
                    {news && comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <div
                                key={comment.commentID}
                                className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-xl transition group"
                            >
                                <CommentItem
                                    commentID={comment.commentID}
                                    index={index}
                                    commentsLength={comments.length}
                                    userID={comment.userID}
                                    avatar={comment.user_comments?.avatar || NoImage}
                                    name={comment.user_comments?.username || `Người dùng ${comment.userID}`}
                                    date={new Date(comment.commentAt).toLocaleDateString()}
                                    comment={comment.content}
                                    likeCount={comment.likeCount}
                                    dislikeCount={comment.dislikeCount}
                                    onLike={() => handleLikeComment(comment.commentID)}
                                    onDislike={() => handleDislikeComment(comment.commentID)}
                                    reFetchComments={() => handleDeleteComment(comment.commentID)}
                                    type="news"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-center py-8 text-lg">
                            <span className="inline-flex items-center gap-2">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                                </svg>
                                Chưa có bình luận nào cho bài đăng này.
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <ToTopButton />
        </div>
    );
}