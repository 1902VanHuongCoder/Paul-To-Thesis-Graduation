"use client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import React from "react";
import Image from "next/image";

interface CommentItemProps {
    avatar: string;
    name: string;
    date: string;
    comment: string;
    likeCount?: number;
    dislikeCount?: number;
    onLike?: () => void;
    onDislike?: () => void;
}

export default function CommentItem({
    avatar,
    name,
    date,
    comment,
    likeCount = 0,
    dislikeCount = 0,
    onLike,
    onDislike,
}: CommentItemProps & { onLike?: () => void; onDislike?: () => void }) {
    return (
        <div className="space-y-4 border-b border-gray-200 pb-4">
            {/* User Info */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Image
                        src={avatar}
                        alt={`${name}'s avatar`}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div>
                        <p className="font-bold text-gray-800">{name}</p>
                        <p className="text-sm text-gray-500">{date}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-1 bg-green-500 px-3 py-2 rounded-full text-white text-sm cursor-pointer hover:bg-green-600"
                        onClick={onLike}
                        aria-label="Like"
                    >
                        <ThumbsUp size={18} />
                        <span>Like</span> 
                        <span className="ml-1 text-xs text-gray-200"> 
                            {likeCount}
                        </span>
                    </button>
                    <button
                        className="flex items-center gap-1 bg-red-500 px-3 py-2 rounded-full text-white text-sm cursor-pointer hover:bg-red-600"
                        onClick={onDislike}
                        aria-label="Dislike"
                    >
                        <ThumbsDown size={18} />
                        <span>Dislike</span>
                        <span className="ml-1 text-xs text-gray-200">
                            {dislikeCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* Comment Body */}
            <p className="text-gray-700 leading-relaxed">{comment}</p>
        </div>
    );
}