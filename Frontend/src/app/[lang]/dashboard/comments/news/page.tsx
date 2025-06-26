"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input";
import { baseUrl } from "@/lib/base-url";

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

  useEffect(() => {
    fetch(`${baseUrl}/api/news-comment`)
      .then(res => res.json())
      .then((data: NewsComment[]) => setComments(data));
    fetch(`${baseUrl}/api/news`)
      .then(res => res.json())
      .then((data: News[]) => setNewsList(data));
  }, []);

  const filteredComments = comments.filter(comment => {
    if (search && !comment.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getNews = (newsID: number) => newsList.find(n => n.newsID === newsID);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">News Comments</h1>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block font-medium mb-1">Search</label>
          <Input
            placeholder="Search content"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>News</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Dislikes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Commented At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComments.map(comment => {
            const news = getNews(comment.newsID);
            return (
              <TableRow key={comment.commentID}>
                <TableCell>{comment.commentID}</TableCell>
                <TableCell>{comment.userID}</TableCell>
                <TableCell>
                  {news ? (
                    <div className="flex items-center gap-2 max-w-[220px]">
                      {news.titleImageUrl && (
                        <img src={news.titleImageUrl} alt={news.title} className="w-10 h-10 object-cover rounded" />
                      )}
                      <span className="truncate block" title={news.title} style={{ maxWidth: 160 }}>
                        {news.title.length > 30 ? news.title.slice(0, 30) + "..." : news.title}
                      </span>
                    </div>
                  ) : (
                    <span>News #{comment.newsID}</span>
                  )}
                </TableCell>
                <TableCell>{comment.content}</TableCell>
                <TableCell>{comment.likeCount}</TableCell>
                <TableCell>{comment.dislikeCount}</TableCell>
                <TableCell>{comment.status}</TableCell>
                <TableCell>{comment.commentAt ? comment.commentAt.slice(0, 10) : ""}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
