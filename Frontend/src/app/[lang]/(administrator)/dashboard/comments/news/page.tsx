"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { baseUrl } from "@/lib/others/base-url";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination/pagination";
import Image from "next/image";
import { fetchNewsComments } from "@/lib/news-comment-apis";
import { fetchNews } from "@/lib/news-apis";

interface NewsComment {
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
}

interface News {
  newsID: number;
  title: string;
  titleImageUrl: string | null;
}

export default function NewsCommentsPage() {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchNewsCommentsData = async () => {
      try {
        const commentsData = await fetchNewsComments(baseUrl);
        setComments(commentsData);
      }
      catch (error) {
        console.error("Failed to fetch news comments:", error);
      }
    };
    const fetchNewsData = async () => {
      try {
        const newsData = await fetchNews();
        setNewsList(newsData);
      }
      catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };
    Promise.all([fetchNewsCommentsData(), fetchNewsData()]);
  }, []);

  const filteredComments = comments
    .filter(comment => {
      if (search && !comment.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return 0;
    });

  const totalPages = Math.ceil(filteredComments.length / pageSize);
  const paginatedComments = filteredComments.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [search, sort, pageSize]);

  const getNews = (newsID: number) => newsList.find(n => n.newsID === newsID);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bình Luận Tin Tức</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block font-medium mb-1">Tìm kiếm</label>
          <Input
            placeholder="Tìm nội dung bình luận"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Sắp xếp</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Số bình luận/trang</label>
          <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ul className="space-y-6">
        {paginatedComments.map(comment => {
          const news = getNews(comment.newsID);
          return (
            <li key={comment.commentID} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                {news && news.titleImageUrl && (
                  <Image width={400} height={400} src={news.titleImageUrl} alt={news.title} className="w-12 h-12 object-cover rounded" />
                )}
                <div>
                  <div className="font-semibold">{news ? news.title : `Tin tức #${comment.newsID}`}</div>
                  <div className="text-xs text-gray-500">ID: {comment.commentID} | Người dùng: {comment.userID}</div>
                </div>
              </div>
              <div className="text-base whitespace-pre-line break-words">{comment.content}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <span>Thích: {comment.likeCount}</span>
                <span>Không thích: {comment.dislikeCount}</span>
                <span>Bình luận lúc: {comment.commentAt ? comment.commentAt.slice(0, 16).replace('T', ' ') : ""}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div>
        <Pagination className="flex justify-start mt-8">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  href="#"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              aria-disabled={page === totalPages}
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
