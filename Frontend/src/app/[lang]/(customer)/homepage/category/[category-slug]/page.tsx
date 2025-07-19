"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { baseUrl } from "@/lib/base-url";
import Card from "@/components/ui/card/card";
import { Breadcrumb } from "@/components";
import { Spinner } from "@/components/ui/spinner/spinner";

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

  if (loading) return <div className="p-8 flex justify-center items-center flex-col gap-y-2 h-[400px]"><Spinner variant="pinwheel" size={50} className="" stroke="#000" /><p>Đang tải dữ liệu ...</p></div>;
  if (!category) return <div className="p-8 text-red-500">Không tìm thấy danh mục.</div>;

  return (
    <div className="px-6 py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: category.categoryName ? category.categoryName : "Kết quả sản phẩm của danh mục" }]} />
      <h1 className="text-2xl font-bold mb-2 uppercase text-center">{category.categoryName}</h1>
      {category.categoryDescription && (
        <p className="mb-4 text-gray-600 text-center">{category.categoryDescription}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        {category.Products && category.Products.length > 0 ? (
          category.Products.map((product) => (
            <Card
              key={product.productID}
              productID={product.productID}
              productName={product.productName}
              image={product.images && product.images.length > 0 ? product.images[0] : "/no-image.png"}
              title={product.productName}
              discountPrice={product.productPriceSale ? product.productPriceSale : 0}
              price={product.productPrice}
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