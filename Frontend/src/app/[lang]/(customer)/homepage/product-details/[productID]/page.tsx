"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetails from "@/components/section/product-details/product-details";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { AddToCartPanel, Breadcrumb, CommentItem, ContentLoading } from "@/components";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/section/carousel/carousel";
import { useDictionary } from "@/contexts/dictonary-context";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/user-context";
import { motion } from "framer-motion";
import Card from "@/components/ui/card/card";
import { dislikeComment, fetchCommentByProductID, likeComment } from "@/lib/product-comment-apis";
import { fetchProductById, fetchProducts } from "@/lib/product-apis";

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

  const [currentTab, setCurrentTab] = useState("description"); // Current tab for product details (description, reviews, etc.)
  // --- Use a triggerRef after product info for AddToCartPanel visibility ---
  const triggerRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);

  // Relative products state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [relativeProducts, setRelativeProducts] = useState<Product[]>([]);

  // Initialize Tiptap editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      // Remove Heading, Gapcursor, HorizontalRule to avoid duplicate extension names (already included in StarterKit)
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>Đang tải...</p>', // Initial content while loading
    editable: false,
    immediatelyRender: false, // Fix SSR hydration warning
  });

  // --- Replace IntersectionObserver with scroll-based logic for inView detection ---
  useEffect(() => {
    const handleScroll = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setShowPanel(rect.top < 0); // Show panel if trigger is above viewport
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Like/dislike handlers 
  const handleLike = async (commentID: number) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để tương tác với bình luận");
      return;
    }
    try {
      await likeComment(commentID);
      // Refetch comments
      fetchComments();
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Lỗi khi thích bình luận.");
    }
  };

  const handleDislike = async (commentID: number) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để tương tác với bình luận");
      return;
    }
    try {
      await dislikeComment(commentID);
      // Refetch comments
      fetchComments();
    } catch (error) {
      console.error("Error disliking comment:", error);
      toast.error("Lỗi khi không thích bình luận.");
    }
  };

  // Fetch comments for the product
  const fetchComments = useCallback(async () => {
    try {
      const data = await fetchCommentByProductID(Number(productID));

      if (!Array.isArray(data)) {
        setComments([]);
      }

      setComments(data);
    } catch (error) {
      setComments([]);
      console.error("Error fetching comments:", error);
    }
  }, [productID]);

  // Fetch product details when productID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetchProductById(productID);
        if (!data) {
          setProduct(null);
          return;
        }
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

  // Fetch all products for relative carousel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProducts();
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  // Filter products with the same subcategory, exclude current product
  useEffect(() => {
    if (!allProducts.length || !product?.subcategoryID) return;
    const relatives = allProducts.filter(
      (item) => item.subcategoryID === product.subcategoryID && item.productID !== product.productID
    );
    setRelativeProducts(relatives);
  }, [allProducts, product?.subcategoryID, product?.productID]);

  if (loading) return <ContentLoading />;
  if (!product) return <div className="p-8 text-red-500">Không tìm thấy sản phẩm.</div>;

  return (
    <>
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
          <div />
          <div ref={triggerRef} />
          {/* Content */}
          <div className="relative w-full min-h-[400px] border-primary/20 border-1 rounded-lg mt-10">
            <div className="absolute -top-[30px] left-0 w-full space-x-2 flex justify-center">
              <button

                onClick={() => setCurrentTab("description")}
                data-currenttab={currentTab === "description" ? "description" : undefined}
                data-iscomments={currentTab === "comments" ? "comments" : undefined}
                className="px-6 py-4 bg-gray-200 rounded-full data-[currenttab=description]:text-white data-[currenttab=description]:bg-primary data-[isComments=comments]:hover:cursor-pointer border-5 border-white">Chi tiết sản phẩm</button>
              <button
                onClick={() => setCurrentTab("comments")}
                data-currenttab={currentTab === "comments" ? "comments" : undefined}
                data-isdiscription={currentTab === "description" ? "description" : undefined}
                className="px-6 py-4 bg-gray-200 rounded-full data-[currenttab=comments]:text-white data-[currenttab=comments]:bg-primary  data-[isDiscription=description]:hover:cursor-pointer border-5 border-white">Bình luận</button>
            </div>
            <div className="w-full h-full mt-[50px] px-6 ">
              {
                currentTab === "description" ? (
                  <div className="prose prose-blue max-w-none tiptap-content mb-8">
                    {product?.description && <EditorContent editor={editor} className="tiptap-editor" />}
                  </div>
                ) : (
                  <div className="mt-12 flex flex-col justify-between">
                    <div>
                      <h2 className="text-4xl font-semibold">Bình luận</h2>
                      <div className="space-y-6 py-6 mb-[150px]">
                        {comments.length > 0 ? (
                          comments.map((comment, index) => (
                            <CommentItem
                              index={index}
                              commentsLength={comments.length}
                              commentID={comment.commentID}
                              userID={comment.userID}
                              key={index}
                              avatar={comment.user?.avatar || ""}
                              name={comment.user?.username || `User ${comment.userID}`}
                              date={new Date(comment.commentAt).toLocaleDateString()}
                              comment={comment.content}
                              likeCount={comment.likeCount}
                              dislikeCount={comment.dislikeCount}
                              onLike={() => handleLike(comment.commentID)}
                              onDislike={() => handleDislike(comment.commentID)}
                              reFetchComments={fetchComments}
                              rating={comment.rating}
                              type="product"
                            />
                          ))
                        ) : (
                          <div className="text-gray-500 py-4">Chưa có bình luận nào.</div>
                        )}
                      </div>
                    </div>
                    {/* <div className="absolute bottom-0 left-0 w-full bg-white p-6 border-t border-gray-200 rounded-bl-lg rounded-br-lg">
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
                    </div> */}

                  </div>)
              }
            </div>

          </div>


        </div>
        <div className="w-full mt-12 border-t-1 border-primary/10 pt-8">
          <div className="max-w-5xl mx-auto"> <h2 className="text-2xl font-semibold mb-4">Sản phẩm liên quan</h2>
            {relativeProducts.length > 0 ? (
              <Carousel className="relative w-full">
                <CarouselContent>
                  {relativeProducts.map((item) => (
                    <CarouselItem key={item.productID} className="max-w-xs">
                      <Card
                        productID={item.productID}
                        productName={item.productName}
                        image={item.images?.[0] || ''}
                        title={item.productName}
                        discountPrice={item.productPriceSale ? item.productPriceSale : 0}
                        price={item.productPrice}
                        rating={item.rating}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious variant="normal" className="flex justify-center items-center" />
                <CarouselNext variant="normal" className="flex justify-center items-center" />
              </Carousel>
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-gray-600">Không có sản phẩm liên quan</div>
            )}</div>
        </div>
      </div>
      <motion.div
        initial={{ y: 120 }}
        animate={showPanel ? { y: 0 } : { y: 120 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 w-full z-90 bg-white rounded-tr-xl rounded-tl-xl shadow-[var(--add-to-cart-panel-shadow)] border-t border-gray-200"
      >
        <AddToCartPanel productImage={product && product.images ? product.images[0] : ""} productName={product.productName} productID={product.productID} />
      </motion.div>
    </>
  );
}