"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { baseUrl } from "@/lib/base-url";

interface Category {
  categoryID: number;
  categoryName: string;
  categoryDescription?: string;
  categorySlug: string;
  Products?: Product[];
}

interface Product {
  productID: number;
  productName: string;
  productPrice: number;
  productPriceSale?: number;
  images?: string[];
}

export default function CategoryProductListPage() {
  const params = useParams();
  const { "category-slug": categorySlug } = params as { "category-slug": string };
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/category/slug/${categorySlug}`);
        if (!res.ok) throw new Error("Không tìm thấy danh mục");
        const data = await res.json();
        setCategory(data);
      } catch (error) {
        setCategory(null);
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    if (categorySlug) fetchCategory();
  }, [categorySlug]);

  if (loading) return <div className="p-8">Đang tải sản phẩm...</div>;
  if (!category) return <div className="p-8 text-red-500">Không tìm thấy danh mục.</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">{category.categoryName}</h1>
      {category.categoryDescription && (
        <p className="mb-4 text-gray-600">{category.categoryDescription}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {category.Products && category.Products.length > 0 ? (
          category.Products.map((product) => (
            <Link
              key={product.productID}
              href={`./product-details/${product.productID}`}
              className="block bg-white rounded shadow hover:shadow-lg transition p-4"
            >
              <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded mb-3 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    width={200}
                    height={200}
                    src={product.images[0]}
                    alt={product.productName}
                    className="object-contain h-full"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="font-semibold text-lg mb-1">{product.productName}</div>
              <div>
                {product.productPriceSale && product.productPriceSale < product.productPrice ? (
                  <>
                    <span className="text-gray-500 line-through mr-2">{product.productPrice.toLocaleString()} VND</span>
                    <span className="text-green-700 font-bold">{product.productPriceSale.toLocaleString()} VND</span>
                  </>
                ) : (
                  <span className="text-green-700 font-bold">{product.productPrice.toLocaleString()} VND</span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-gray-500">Không có sản phẩm nào trong danh mục này.</div>
        )}
      </div>
    </div>
  );
}