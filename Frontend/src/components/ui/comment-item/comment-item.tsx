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
    rating?: number; // Optional rating field
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
    rating = 0, // Default rating to 0 if not provided
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
                        <div className="flex items-center mt-2">
                            {Array.from({ length: 5 }, (_, index) => {
                                if (index < Math.floor(rating)) {
                                    // Full star
                                    return (
                                        <span key={index} className="text-yellow-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>                                 </span>
                                    );
                                } else if (index < rating) {
                                    // Half star
                                    return (
                                        <span key={index} className="text-yellow-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.951 9.67a1 1 0 0 0-.807-.68l-5.699-.828l-2.548-5.164A.978.978 0 0 0 12 2.486v16.28l5.097 2.679a1 1 0 0 0 1.451-1.054l-.973-5.676l4.123-4.02a1 1 0 0 0 .253-1.025z" opacity=".5" /><path fill="currentColor" d="M11.103 2.998L8.555 8.162l-5.699.828a1 1 0 0 0-.554 1.706l4.123 4.019l-.973 5.676a1 1 0 0 0 1.45 1.054L12 18.765V2.503a1.028 1.028 0 0 0-.897.495z" /></svg> </span>
                                    );
                                } else {
                                    // Empty star
                                    return (
                                        <span key={index} className="text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>                                </span>
                                    );
                                }
                            })}
                            <span className="text-gray-500 ml-2 text-sm self-end">({rating}/5)</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-1  px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200"
                        onClick={onLike}
                        aria-label="Like"
                    >
                        <ThumbsUp size={18} />
                        <span>Like</span> 
                        <span className="ml-1 text-xs"> 
                            {likeCount}
                        </span>
                    </button>
                    <button
                        className="flex items-center gap-1  px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200"
                        onClick={onDislike}
                        aria-label="Dislike"
                    >
                        <ThumbsDown size={18} />
                        <span>Dislike</span>
                        <span className="ml-1 text-xs">
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