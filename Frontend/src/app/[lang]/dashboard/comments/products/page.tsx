"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { baseUrl } from "@/lib/base-url";
import { Star, StarOff } from "lucide-react";

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

  useEffect(() => {
    fetch(`${baseUrl}/api/comment`)
      .then(res => res.json())
      .then((data: Comment[]) => setComments(data));
    fetch(`${baseUrl}/api/product`)
      .then(res => res.json())
      .then((data: Product[]) => setProducts(data));
  }, []);

  const filteredComments = comments.filter(comment => {
    if (rating !== "all" && comment.rating !== Number(rating)) return false;
    if (search && !comment.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getProduct = (productID: number) => products.find(p => p.productID === productID);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Product Comments</h1>
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
        <div>
          <label className="block font-medium mb-1">Rating</label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Dislikes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Commented At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComments.map(comment => {
            const product = getProduct(comment.productID);
            return (
              <TableRow key={comment.commentID}>
                <TableCell>{comment.commentID}</TableCell>
                <TableCell>{comment.userID}</TableCell>
                <TableCell>
                  {product ? (
                    <div className="flex items-center gap-2">
                      {product.images && product.images.length > 0 && (
                        <img src={product.images[0]} alt={product.productName} className="w-10 h-10 object-cover rounded" />
                      )}
                      <span>{product.productName}</span>
                    </div>
                  ) : (
                    <span>Product #{comment.productID}</span>
                  )}
                </TableCell>
                <TableCell>{comment.content}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < comment.rating ? (
                        <Star key={i} className="text-yellow-400 w-4 h-4 fill-yellow-400" fill="currentColor" />
                      ) : (
                        <StarOff key={i} className="text-gray-300 w-4 h-4" />
                      )
                    )}
                  </div>
                </TableCell>
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
