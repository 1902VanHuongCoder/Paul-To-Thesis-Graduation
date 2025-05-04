"use client";

import React from "react";
import { PlayCircle, Tag, MessageSquare, Eye, Share2, CircleUser } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/button/button-brand";

interface NewsItemProps {
    image: string;
    date: string;
    author: string;
    category: string;
    comments: number;
    views: number;
    title: string;
    excerpt: string;
    onReadMore: () => void;
    onShare: () => void;
}

export default function NewsItem({
    image,
    // date,
    author,
    category,
    comments,
    views,
    title,
    excerpt,
    onReadMore,
    onShare,
}: NewsItemProps) {
    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg border-1 border-solid border-primary/10 p-4 items-stretch">
            {/* Left Section: Image and Play Button */}
            <div className="relative w-full md:w-1/3">
                <Image
                    src={image}
                    alt="News thumbnail"
                    className="rounded-lg object-cover w-full h-full"
                    width={300}
                    height={100}
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <div className="relative">
                        <div className="absolute z-1 inset-0 bg-white animate-ping rounded-full"></div>
                        <PlayCircle size={48} className="relative z-2 text-black rounded-full p-2 bg-white" />
                    </div>
                </div>
                {/* Date Badge */}
                <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-brown rounded-full w-20 h-20 font-bold flex flex-col items-center justify-center">
                    <span className="text-xl">08</span>
                    <span className="text-sm">Jan 2024</span>
                </div>
            </div>

            {/* Right Section: Article Summary */}
            <div className="flex-1 flex flex-col justify-between">
                {/* Metadata */}
                <div className="flex items-center gap-4 text-gray-600 text-sm flex-wrap border-b-[1px] border-solid border-black/10 pb-4">
                    <div className="flex items-center gap-1">
                        <CircleUser className="text-primary" fill="#278D45" stroke="#ffffff" size={20} />
                        <span>By {author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Tag className="text-primary" fill="#278D45" stroke="#ffffff" size={20} />
                        <span>{category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="text-primary" fill="#278D45" stroke="#ffffff" size={20} />
                        <span>{comments} Comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="text-primary" fill="#278D45" stroke="#ffffff" size={20} />
                        <span>{views} Views</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-gray-800 mt-2">{title}</h2>

                {/* Excerpt */}
                <p className="text-gray-600 mt-2">{excerpt}</p>

                {/* Call-to-Action and Share */}
                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={onReadMore}
                    >
                        Continue Reading
                    </Button>
                    <button
                        className="flex items-center gap-2 text-gray-600 hover:text-primary"
                        onClick={onShare}
                        aria-label="Share this article"
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}