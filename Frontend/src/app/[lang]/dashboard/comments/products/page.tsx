"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { baseUrl } from "@/lib/base-url";
import { Star, StarOff } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination/pagination";
import Image from "next/image";

interface Comment {
  commentID: number;
  userID: string;
  productID: number;
  content: string;
  commentAt: string;
  rating: number;
  likeCount: number;
  dislikeCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  productID: number;
  productName: string;
  images: string[];
}

export default function ProductCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch(`${baseUrl}/api/comment`)
      .then(res => res.json())
      .then((data: Comment[]) => setComments(data));
    fetch(`${baseUrl}/api/product`)
      .then(res => res.json())
      .then((data: Product[]) => setProducts(data));
  }, []);

  const filteredComments = comments
    .filter(comment => {
      if (rating !== "all" && comment.rating !== Number(rating)) return false;
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

  useEffect(() => { setPage(1); }, [search, rating, sort, pageSize]);

  const getProduct = (productID: number) => products.find(p => p.productID === productID);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bình luận sản phẩm</h1>
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
          <label className="block font-medium mb-1">Đánh giá</label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tất cả đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="5">5 Sao</SelectItem>
              <SelectItem value="4">4 Sao</SelectItem>
              <SelectItem value="3">3 Sao</SelectItem>
              <SelectItem value="2">2 Sao</SelectItem>
              <SelectItem value="1">1 Sao</SelectItem>
            </SelectContent>
          </Select>
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
          const product = getProduct(comment.productID);
          return (
            <li key={comment.commentID} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                {product && product.images && product.images.length > 0 && (
                  <Image width={400} height={400} src={product.images[0]} alt={product.productName} className="w-12 h-12 object-cover rounded" />
                )}
                <div>
                  <div className="font-semibold">{product ? product.productName : `Sản phẩm #${comment.productID}`}</div>
                  <div className="text-xs text-gray-500">ID: {comment.commentID} | Người dùng: {comment.userID}</div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < comment.rating ? (
                      <Star key={i} className="text-yellow-400 w-4 h-4 fill-yellow-400" fill="currentColor" />
                    ) : (
                      <StarOff key={i} className="text-gray-300 w-4 h-4" />
                    )
                  )}
                </div>
              </div>
              <div className="text-base whitespace-pre-line break-words">{comment.content}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <span>Thích: {comment.likeCount}</span>
                <span>Không thích: {comment.dislikeCount}</span>
                {/* <span>Trạng thái: {comment.status}</span> */}
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
