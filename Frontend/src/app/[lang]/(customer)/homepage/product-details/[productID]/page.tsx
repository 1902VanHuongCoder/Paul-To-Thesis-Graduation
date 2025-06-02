"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetails from "@/components/section/product-details/product-details";
import { baseUrl } from "@/lib/base-url";

interface Category {
  categoryID: number;
  categoryName: string;
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
  subcategory?: SubCategory[];
  subcategoryID?: number;
  updatedAt?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const { productID } = params as { productID: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/product/${productID}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        console.log("Fetched product:", data);
      } catch (error) {
        setProduct(null);
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (productID) fetchProduct();
  }, [productID]);

  if (loading) return <div className="p-8">Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div className="p-8 text-red-500">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ProductDetails
        productName={product.productName}
        rating={product.rating}
        productPrice={product.productPrice}
        productPriceSale={product.productPriceSale}
        quantityAvailable={product.quantityAvailable}
        sku={`SP${product.productID}`}
        category={product.category}
        subcategory={product.subcategory}
        origin={product.origin}
        Tags={product.Tags}
        productAttributes={product.productAttributes}
        images={product.images}
      />
    </div>
  );
}