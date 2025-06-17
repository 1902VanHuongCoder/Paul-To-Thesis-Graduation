"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import Card from "@/components/ui/card/card";

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
  rating?: number;
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
    <div className="px-6 pb-10 pt-2">
      <h1 className="text-xl font-bold mb-2 uppercase">{category.categoryName}</h1>
      {category.categoryDescription && (
        <p className="mb-4 text-gray-600">{category.categoryDescription}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {category.Products && category.Products.length > 0 ? (
          category.Products.map((product) => (
            <Card
              key={product.productID}
              productID={product.productID}
              productName={product.productName}
              image={product.images && product.images.length > 0 ? product.images[0] : "/no-image.png"}
              title={product.productName}
              discountPrice={product.productPriceSale ? String(product.productPriceSale) : ""}
              price={String(product.productPrice)}
              rating={product.rating || 0}
            />
          ))
        ) : (
          <div className="col-span-full text-gray-500">Không có sản phẩm nào trong danh mục này.</div>
        )}
      </div>
    </div>
  );
}