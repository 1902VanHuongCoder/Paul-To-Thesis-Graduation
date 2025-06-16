"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetails from "@/components/section/product-details/product-details";
import { baseUrl } from "@/lib/base-url";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Gapcursor from '@tiptap/extension-gapcursor'
import { Breadcrumb, Button, CommentItem } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/user-context";

interface Category {
  categoryID: number;
  categoryName: string;
  categoryDescription?: string;
  categorySlug: string;
  count: number;
}
interface SubCategory {
  categoryName: string;
}
interface Origin {
  originID: number;
  originName: string;
}
interface Tag {
  tagID: number;
  tagName: string;
}
interface ProductAttribute {
  attributeID: number;
  attributeName: string;
  attributeValue: string;
}

interface Product {
  Tags?: Tag[];
  category?: Category;
  categoryID: number;
  createdAt?: string;
  description?: string;
  images?: string[];
  origin?: Origin;
  originID?: number;
  productAttributes?: ProductAttribute[];
  productID: number;
  productName: string;
  productPrice: number;
  productPriceSale?: number;
  quantityAvailable: number;
  rating: number;
  subcategory?: SubCategory;
  subcategoryID?: number;
  updatedAt?: string;
}

interface ProductComment {
  commentID: number;
  userID: number;
  productID: number;
  content: string;
  commentAt: string;
  rating: number;
  likeCount: number;
  dislikeCount: number;
  status: string;
  user?: {
    userID: number;
    username: string;
    avatar?: string;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const { productID } = params as { productID: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { dictionary: d } = useDictionary();
  const { user } = useUser();

  const [comments, setComments] = useState<ProductComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      BulletList,
      ListItem,
      Paragraph,
      Text,
      TaskList,
      HorizontalRule,
      TaskItem.configure({ nested: true }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: { class: 'text-gray-900 dark:text-white font-bold' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Gapcursor,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>Loading...</p>', // Initial content while loading
    editable: false,
  }
  );

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !productID) return;
    setSubmitting(true);
    try {
      // Replace with actual userID from auth context if available
      if (!user) {
        toast.error("Bạn cần đăng nhập để bình luận.");
        return;
      }
      const userID = user.userID
      await fetch(`${baseUrl}/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID,
          productID: Number(productID),
          content: newComment,
          rating: newRating,
          status: "active",
        }),
      });
      // Refetch comments
      const res = await fetch(`${baseUrl}/api/comment/product/${productID}`);
      const data = await res.json();
      setComments(data.filter((c: ProductComment) => c.status === "active"));
      setNewComment("");
      setNewRating(5);
      commentInputRef.current?.focus();
    } catch (err) {
      console.error("Error submitting comment:", err);
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  // Like/dislike handlers (optional, implement backend if needed)
  const handleLike = async (commentID: number) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để tương tác với bình luận");
      return;
    }
    try {
      await fetch(`${baseUrl}/api/comment/reaction/${commentID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Lỗi khi thích bình luận.");
    }
    // Refetch comments
    fetchComments();
  };
  const handleDislike = async (commentID: number) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để tương tác với bình luận");
      return;
    }
    try{
       await fetch(`${baseUrl}/api/comment/reaction/${commentID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dislike" }),
    });
    }catch(error){
      console.error("Error disliking comment:", error);
      toast.error("Lỗi khi không thích bình luận.");
    }
    fetchComments();
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/comment/product/${productID}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.filter((c: ProductComment) => c.status === "active"));
      console.log("<----------------->", data);
    } catch (error) {
      setComments([]);
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/product/${productID}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        console.log("<----------------->", data);
        editor?.commands.setContent(JSON.parse(data.description));
      } catch (error) {
        setProduct(null);
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productID) {
      fetchProduct()
      fetchComments();
    };
  }, [productID, editor]);



  if (loading) return <div className="p-8">Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div className="p-8 text-red-500">Không tìm thấy sản phẩm.</div>;
  return (
    <div className="mx-auto py-8">
      <div className="pb-6 px-6"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: product.productName }]} /></div>
      <div className="max-w-4xl mx-auto">
        <ProductDetails
          productID={Number(productID)}
          productName={product.productName}
          rating={product.rating}
          productPrice={product.productPrice}
          productPriceSale={product.productPriceSale}
          quantityAvailable={product.quantityAvailable}
          sku={`SP${product.productID}`}
          category={product.category}
          origin={product.origin}
          Tags={product.Tags}
          images={product.images}
        />
        {/* Content */}
        <div className="prose prose-blue max-w-none tiptap-content mb-8">
          {product?.description && <EditorContent editor={editor} className="tiptap-editor" />}
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Đánh giá & Bình luận</h2>
          <form onSubmit={handleCommentSubmit} className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Đánh giá:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={star <= newRating ? "text-yellow-400" : "text-gray-300"}
                  onClick={() => setNewRating(star)}
                  aria-label={`Đánh giá ${star} sao`}
                >
                  <Star fill={star <= newRating ? "var(--color-yellow-400)" : "var(--color-gray-300)"} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{newRating} sao</span>
            </div>
            <div className="flex gap-2">
              <input
                ref={commentInputRef}
                type="text"
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white "
                placeholder="Viết bình luận về sản phẩm..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <Button
                type="submit"
                size="lg"
                className="pl-8 pr-6 disabled:opacity-50 disabled:cursor-not-allowed"
                variant="normal"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </form>
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.commentID}
                  avatar={comment.user?.avatar || "https://cdn-icons-png.freepik.com/256/11849/11849331.png?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid"}
                  name={comment.user?.username || `User ${comment.userID}`}
                  date={new Date(comment.commentAt).toLocaleDateString()}
                  comment={comment.content}
                  likeCount={comment.likeCount}
                  dislikeCount={comment.dislikeCount}
                  onLike={() => handleLike(comment.commentID)}
                  onDislike={() => handleDislike(comment.commentID)}
                  rating={comment.rating}
                />
              ))
            ) : (
              <div className="text-gray-500">Chưa có bình luận nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}