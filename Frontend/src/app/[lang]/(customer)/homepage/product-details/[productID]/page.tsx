"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { Breadcrumb, Button, CommentItem, ContentLoading } from "@/components";
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
  userID: string;
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
  // Get productID from URL parameters
  const params = useParams();
  const { productID } = params as { productID: string };

  // Contexts 
  const { dictionary: d } = useDictionary();
  const { user } = useUser();

  // State variables
  const [product, setProduct] = useState<Product | null>(null); // Product details
  const [loading, setLoading] = useState(true); // Loading state 
  const [comments, setComments] = useState<ProductComment[]>([]); // Comments for the product
  const [newComment, setNewComment] = useState(""); // New comment input
  const [newRating, setNewRating] = useState(5); // New rating input (default 5 stars)
  const [submitting, setSubmitting] = useState(false); // Submitting state for comment form
  const commentInputRef = useRef<HTMLInputElement>(null); // Reference to comment input field
  const [currentTab, setCurrentTab] = useState("description"); // Current tab for product details (description, reviews, etc.)

  // Initialize Tiptap editor with extensions
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

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !productID) return; // Prevent submission if comment is empty or productID is not available
    setSubmitting(true);
    try {
      // Check if user is logged in
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
      setComments(data.filter((c: ProductComment) => c.status === "active")); // Only set to show active comments
      setNewComment("");
      setNewRating(5);
      commentInputRef.current?.focus();
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Like/dislike handlers 
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
    try {
      await fetch(`${baseUrl}/api/comment/reaction/${commentID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dislike" }),
      });
    } catch (error) {
      console.error("Error disliking comment:", error);
      toast.error("Lỗi khi không thích bình luận.");
    }
    fetchComments();
  };

  // Fetch comments for the product
  const fetchComments = useCallback(async () => { // useCallback to memoize the function to avoid unnecessary re-creations
    try {
      const res = await fetch(`${baseUrl}/api/comment/product/${productID}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.filter((c: ProductComment) => c.status === "active"));
    } catch (error) {
      setComments([]);
      console.error("Error fetching comments:", error);
    }
  }, [productID]);

  // Fetch product details when productID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/product/${productID}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
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
  }, [productID, editor, fetchComments]);

  if (loading) return <ContentLoading />;
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
        <div className="relative w-full min-h-[400px] border-primary/20 border-1 rounded-lg mt-10">
          <div className="absolute -top-[30px] left-0 w-full space-x-2 flex justify-center">
            <button
              onClick={() => setCurrentTab("description")}
              data-currenttab={currentTab === "description" ? "description" : undefined}
              className="px-6 py-4 bg-gray-200 rounded-full data-[currenttab=description]:text-white data-[currenttab=description]:bg-primary hover:opacity-80 hover:cursor-pointer border-5 border-white">Chi tiết sản phẩm</button>
            <button
              onClick={() => setCurrentTab("comments")}
              data-currenttab={currentTab === "comments" ? "comments" : undefined}
              className="px-6 py-4 bg-gray-200 rounded-full data-[currenttab=comments]:text-white data-[currenttab=comments]:bg-primary hover:opacity-80 hover:cursor-pointer border-5 border-white">Bình luận</button>
          </div>
          <div className="w-full h-full mt-[50px] px-6 ">
            {
              currentTab === "description" ? (
                <div className="prose prose-blue max-w-none tiptap-content mb-8">
                  {product?.description && <EditorContent editor={editor} className="tiptap-editor" />}
                </div>
              ) : (
              <div className="mt-12 flex flex-col justify-between ">
                <div>
                  <h2 className="text-4xl font-semibold">Bình luận</h2>
                  <div className="space-y-6 py-6">
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <CommentItem
                          index={index}
                          commentsLength={comments.length}
                          userID={comment.userID}
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
                      <div className="text-gray-500 py-4">Chưa có bình luận nào.</div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-white p-6 border-t border-gray-200 rounded-bl-lg rounded-br-lg">
                  <form onSubmit={handleCommentSubmit} className="flex flex-col gap-y-4">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Đánh giá:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={star <= newRating ? "text-yellow-400" : "text-gray-300"}
                          onClick={() => setNewRating(star)}
                          aria-label={`Đánh giá ${star} sao`}
                        >
                          <Star className="h-[20px]" fill={star <= newRating ? "var(--color-yellow-400)" : "var(--color-gray-300)"} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500 translate-y-0.5">{newRating}/5 sao</span>
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
                        size="md"
                        className="disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        variant="primary"
                        disabled={submitting || !newComment.trim()}
                      >
                        {submitting ? "Đang gửi..." : "Gửi bình luận"}
                      </Button>
                    </div>
                  </form>
                </div>

              </div>)
            }
          </div>
        </div>


      </div>
    </div>
  );
}