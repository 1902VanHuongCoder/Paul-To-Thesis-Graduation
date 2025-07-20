"use client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import React from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/others/base-url";
// import { baseUrl } from "@/configs/base-url";
interface CommentItemProps {
    index: number;
    commentsLength: number;
    userID: string;
    avatar: string | StaticImageData;
    name: string;
    date: string;
    comment: string;
    likeCount?: number;
    dislikeCount?: number;
    rating?: number;
    onLike?: () => void;
    onDislike?: () => void;
    commentID?: number;
    currentUserID?: string;
    onDelete?: () => void;
    reFetchComments: () => void;
}

export default function CommentItem({
    index,
    commentsLength,
    commentID,
    userID,
    avatar,
    name,
    date,
    comment,
    likeCount = 0,
    dislikeCount = 0,
    rating = 0,
    onLike,
    onDislike,
    reFetchComments,
}: CommentItemProps & { onLike?: () => void; onDislike?: () => void }) {
    // Contexts 
    const { user } = useUser();

    // State variables 
    const [likeAnim, setLikeAnim] = React.useState(false);
    const [dislikeAnim, setDislikeAnim] = React.useState(false);

    // Handlers for like and dislike actions
    const handleLikeClick = () => {
        setLikeAnim(true);
        if (onLike) onLike();
        setTimeout(() => setLikeAnim(false), 500);
    };
    const handleDislikeClick = () => {
        setDislikeAnim(true);
        if (onDislike) onDislike();
        setTimeout(() => setDislikeAnim(false), 500);
    };

    // Handler for deleting the comment
    const handleDelete = async () => {
        if (!commentID) return;
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await fetch(`${baseUrl}/api/comment/${commentID}`, { method: "DELETE" });

            // Refetch comments or update state in parent component
            reFetchComments();
            alert("Xóa bình luận thành công!");
        } catch (err) {
            alert("Xóa bình luận thất bại!");
            console.error("Error deleting comment:", err);
        }
    };

    return (
        <div className={`space-y-4 ${commentsLength - 1 !== index && 'border-b'} border-gray-200 pb-4`}>
            {/* User Info */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-[50px] h-[50px] flex-shrink-0 border rounded-full overflow-hidden border-gray-300">
                        <Image
                            src={avatar}
                            alt={`${name}'s avatar`}
                            width={40}
                            height={40}
                            className="rounded-full w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{name}</p>
                        <p className="text-sm text-gray-500">{date}</p>
                        <div className={`flex items-center ${rating === 0 ? 'hidden' : ''}`}>
                            {Array.from({ length: 5 }, (_, index) => {
                                if (index < Math.floor(rating)) {
                                    // Full star
                                    return (
                                        <span key={index} className="text-yellow-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>                                 </span>
                                    );
                                } else if (index < rating) {
                                    // Half star
                                    return (
                                        <span key={index} className="text-yellow-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.951 9.67a1 1 0 0 0-.807-.68l-5.699-.828l-2.548-5.164A.978.978 0 0 0 12 2.486v16.28l5.097 2.679a1 1 0 0 0 1.451-1.054l-.973-5.676l4.123-4.02a1 1 0 0 0 .253-1.025z" opacity=".5" /><path fill="currentColor" d="M11.103 2.998L8.555 8.162l-5.699.828a1 1 0 0 0-.554 1.706l4.123 4.019l-.973 5.676a1 1 0 0 0 1.45 1.054L12 18.765V2.503a1.028 1.028 0 0 0-.897.495z" /></svg> </span>
                                    );
                                } else {
                                    // Empty star
                                    return (
                                        <span key={index} className="text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>                                </span>
                                    );
                                }
                            })}
                            <span className="text-gray-500 ml-2 text-sm translate-y-0.5">({rating}/5)</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-1 px-3 py-2 text-sm cursor-pointer relative"
                        onClick={handleLikeClick}
                        aria-label="Like"
                    >
                        <ThumbsUp size={18} />
                        <span>Like</span>
                        <span className="ml-1 text-xs">{likeCount}</span>
                        <AnimatePresence>
                            {likeAnim && (
                                <motion.span
                                    initial={{ opacity: 1, y: 0, scale: 1 }}
                                    animate={{ opacity: 0, y: -40, scale: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                                >
                                    <ThumbsUp size={28} className="text-green-500 drop-shadow-lg " fill="var(--color-green-500)" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        className="flex items-center gap-1 px-3 py-2 text-sm cursor-pointer relative"
                        onClick={handleDislikeClick}
                        aria-label="Dislike"
                    >
                        <ThumbsDown size={18} />
                        <span>Dislike</span>
                        <span className="ml-1 text-xs">{dislikeCount}</span>
                        <AnimatePresence>
                            {dislikeAnim && (
                                <motion.span
                                    initial={{ opacity: 1, y: 0, scale: 1 }}
                                    animate={{ opacity: 0, y: 40, scale: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                                >
                                    <ThumbsDown size={28} className="text-red-500 drop-shadow-lg" fill="var(--color-red-500)" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    
                    {user && user.userID === userID && (
                        <button
                            className="text-red-500 hover:underline hover:cursor-pointer"
                            onClick={handleDelete}
                        >
                            Xóa
                        </button>
                    )}
                </div>
            </div>

            {/* Comment Body */}
            <p className="text-gray-700 leading-relaxed">{comment}</p>
        </div>
    );
}