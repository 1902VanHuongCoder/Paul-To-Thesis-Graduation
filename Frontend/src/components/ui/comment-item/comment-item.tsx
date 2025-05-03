"use client";

import React from "react";
import Image from "next/image";
import { MessageSquareReply } from "lucide-react";

interface CommentItemProps {
    avatar: string;
    name: string;
    date: string;
    comment: string;
    onReply?: () => void;
}

export default function CommentItem({
    avatar,
    name,
    date,
    comment,
    onReply,
}: CommentItemProps) {
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
                <button
                    className="flex items-center gap-2 flex-row bg-primary px-4 py-2 rounded-full text-white text-sm cursor-pointer hover:bg-primary-hover"
                    onClick={onReply}
                >

                    <span><MessageSquareReply /></span>
                    <span>Reply</span>
                </button>
            </div>


            {/* Comment Body */}
            <p className="text-gray-700 leading-relaxed">{comment}</p>
        </div>
    );
}