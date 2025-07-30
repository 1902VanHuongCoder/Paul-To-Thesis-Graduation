"use client";

import React, { useEffect, useState } from "react";
import NewsItem from "@/components/ui/news-item/news-item";
import { useRouter } from "next/navigation";
import { Breadcrumb, ContentLoading } from "@/components";
import { fetchNews, updateNewsViews } from "@/lib/news-apis";
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
    user_comments?: Author;
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
    // Router
    const router = useRouter();

    // State variables
    const [newsList, setNewsList] = useState<News[]>([]); // List of news items
    const [loading, setLoading] = useState(true); // Loading state to show a loading message while fetching data

    const handleReadMore = async (newsID: number) => {
        router.push(`/vi/homepage/news/${newsID}`);
        try{
            await updateNewsViews(newsID);
        }catch (error) {
            console.error("Error updating news views:", error);
        }
    }
    // Fetch news data from the API when the component mounts
    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const data = await fetchNews();
                setNewsList(data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsData();
    }, []);

    if (loading) return <ContentLoading />;

    return (
        <div className="py-10 px-6 space-y-8">
            <Breadcrumb items={[
                { label: "Trang chủ", href: "/" },
                { label: "Tin tức" }
            ]} />
            <h1 className="text-2xl font-bold mb-6 uppercase mt-6 text-center">Tin tức</h1>
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
                    onReadMore={() => handleReadMore(news.newsID)}
                    onShare={() => navigator.share ? navigator.share({ title: news.title, url: window.location.origin + `/news/${news.newsID}` }) : alert("Share not supported")}
                />
            ))}
        </div>
    );
}