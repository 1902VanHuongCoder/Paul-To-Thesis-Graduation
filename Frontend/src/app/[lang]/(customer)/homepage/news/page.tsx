"use client";

import React, { useEffect, useState } from "react";
import NewsItem from "@/components/ui/news-item/news-item";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import { useDictionary } from "@/contexts/dictonary-context";
import { Breadcrumb } from "@/components";
interface Author {
    username: string;
    userID: string;
    email: string;
}

interface Comment {
    commentID: number;
    userID: string;
    newsID: number;
    content: string;
    commentAt: string;
    status: "active" | "deleted";
    user_comments?: Author; // Optional, if you want to include user details
}
interface News {
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
    hastags?: { tagName: string, newsTagID: number }[];
    author: Author;
    comments?: Comment[];
}

export default function NewsListPage() {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { lang } = useDictionary();
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/news`);
                const data = await res.json();
                setNewsList(data);
                console.log("Fetched news data:", data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <div>Đang tải tin tức...</div>;

    return (
        <div className="py-10 px-6 space-y-8">
            <Breadcrumb items={[
                { label: "Trang chủ", href: "/" },
                { label: "Tin tức" }
            ]} />
            <h1 className="text-4xl font-bold mb-6 uppercase mt-6 text-center">Tin tức</h1>
            {newsList.length === 0 && <div>Hiện tại chưa có bài đăng nào.</div>}
            {newsList.map((news) => (
                <NewsItem
                    key={news.newsID}
                    image={news.titleImageUrl || "/placeholder.jpg"}
                    date={news.createdAt ? new Date(news.createdAt).toLocaleDateString() : ""}
                    author={news.author.username}
                    category={news.hastags?.map(t => t.tagName).join(", ") || "Uncategorized"}
                    comments={news.comments?.length || 0}
                    views={news.views}
                    title={news.title}
                    excerpt={news.subtitle || ""}
                    onReadMore={() => router.push(`/${lang}/homepage/news/${news.newsID}`)}
                    onShare={() => navigator.share ? navigator.share({ title: news.title, url: window.location.origin + `/news/${news.newsID}` }) : alert("Share not supported")}
                />
            ))}
        </div>
    );
}