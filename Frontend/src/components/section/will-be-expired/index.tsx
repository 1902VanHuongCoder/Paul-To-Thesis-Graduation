import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge/badge";
import formatVND from "@/lib/others/format-vnd";
import { fetchProductsWillBeExpired } from "@/lib/product-apis";

interface Product {
    productID: number;
    productName: string;
    images?: string[];
    productPrice: number;
    productPriceSale?: number;
    expiredAt: string;
    quantityAvailable: number;
}

const WillBeExpiredSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await fetchProductsWillBeExpired();
                setProducts(res || []);
            } catch (error) {
                setProducts([]);
                console.error("Failed to fetch products:", error);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    return (
        <section className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center bg-red-100 rounded-full p-2">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                </svg>
            </span>
            <h2 className="text-3xl font-extrabold text-red-700 tracking-tight">
                Sản phẩm sắp hết hạn trong 30 ngày
            </h2>
            </div>
            {loading ? (
            <div className="flex flex-col items-center py-12">
                <svg className="animate-spin h-8 w-8 text-red-400 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-lg text-gray-500">Đang tải dữ liệu...</span>
            </div>
            ) : products.length === 0 ? (
            <div className="flex flex-col items-center py-12">
                <svg className="h-10 w-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a3 3 0 013-3h0a3 3 0 013 3v6" />
                </svg>
                <span className="text-lg text-gray-500">Không có sản phẩm nào sắp hết hạn.</span>
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                <Card key={product.productID} className="bg-white border-0 shadow-lg rounded-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-200">
                    <CardHeader className="flex flex-row gap-5 items-center pb-0">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                        src={product.images?.[0] || "/default-product.png"}
                        alt={product.productName}
                        fill
                        className="rounded-xl object-cover border-2 border-red-100"
                        />
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow">
                                    HSD: {new Date(product.expiredAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-red-700">{product.productName}</CardTitle>
                        <CardDescription className="text-sm text-gray-400 mt-1">ID: {product.productID}</CardDescription>
                    </div>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-3 items-start pt-3">
                    <div className="flex gap-3 items-center">
                        <Badge variant="destructive" className="text-base px-3 py-1 rounded-lg shadow">
                                    Số lượng: {product.quantityAvailable}
                        </Badge>
                        <Badge variant="outline" className="text-base px-3 py-1 rounded-lg border-red-300">
                        Giá: <span className="font-semibold ml-1">{formatVND(product.productPriceSale || product.productPrice)} VND</span>
                        </Badge>
                    </div>
                    </CardFooter>
                </Card>
                ))}
            </div>
            )}
        </section>
    );
};

export default WillBeExpiredSection;
