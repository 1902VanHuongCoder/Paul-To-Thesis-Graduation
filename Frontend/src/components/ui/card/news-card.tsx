"use client";

import React from "react";
import Image from "next/image";
import { MessageCircle, Tag, User } from "lucide-react";

interface NewsCardProps {
  date: string; // e.g., "08"
  monthYear: string; // e.g., "Jun 24"
  image: string; // Image URL
  author: string; // Author name
  tags: string; // Tags or categories
  comments: number; // Number of comments
  title: string; // News title
  summary: string; // News summary
  onReadMore?: () => void; // Optional callback for "Read More"
}

export default function NewsCard({
  date,
  monthYear,
  image,
  author,
  tags,
  comments,
  title,
  summary,
  onReadMore,
}: NewsCardProps) {
  return (
    <div className="font-sans w-full overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full h-[300px]">
        <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-brown rounded-full w-16 h-16 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{date}</span>
          <span className="text-xs">{monthYear}</span>
        </div>
        <div className="w-full h-[300px] overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt="News Image"
            width={400}
            height={200}
            className="w-full h-full object-cover  hover:scale-110 duration-300 transition-all ease-in-out"
          />
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-primary">
              <User width={20} height={20} />
            </span>
            <span className="text-sm">{author}</span>
          </div>
          <div className="flex items-center gap-1 max-w-full truncate">
            <span className="text-primary">
              <Tag width={20} height={20} />
            </span>
            <span className="text-sm">{tags}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary">
              <MessageCircle width={20} height={20} />
            </span>
            <span className="text-sm">{comments} bình luận</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-green-700">{title}</h2>

        {/* Summary Paragraph */}
        <p className="text-gray-600 text-sm">{summary}</p>
      </div>

      {/* Call to Action */}
      <div className="px-4 pb-4 flex justify-center items-center w-full">
        <button
          onClick={onReadMore}
          className="relative group capitalize px-2 hover:text-primary transition-all cursor-pointer"
        >
          <span>Đọc thêm</span>
          <span className="absolute right-0 -bottom-1 group-hover:w-0 origin-top-left transition-all duration-300 w-full h-[2px] bg-secondary"></span>
        </button>
      </div>
    </div>
  );
}