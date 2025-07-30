import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchTopSellingProducts, fetchPoorSellingProducts } from "@/lib/product-apis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import NoImage from '@public/images/NoImage.jpg';

interface Product {
    productID: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    images: string[];
}

interface TopProduct {
    productID: number;
    orderCount: number;
    product: Product;
}

const TopSellingProductSection: React.FC = () => {
    const [tab, setTab] = useState("top");
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [poorProducts, setPoorProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (tab === "top") {
                    const data = await fetchTopSellingProducts();
                    setTopProducts(data);
                } else {
                    const data = await fetchPoorSellingProducts();
                    setPoorProducts(data);
                }
            } catch (err) {
                setError("Không thể tải dữ liệu sản phẩm.");
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tab]);

    // Render for top selling products (TopProduct[])
    const renderTopProductList = (products: TopProduct[]) => {
        if (loading) return <div>Đang tải sản phẩm...</div>;
        if (error) return <div className="text-red-500">{error}</div>;
        if (!products.length) return <div>Không có dữ liệu sản phẩm.</div>;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {products.map((item) => (
                    <div
                        key={item.productID}
                        className="relative border-2 border-[#f8c32c] rounded-2xl p-5 flex flex-col items-center bg-gradient-to-br from-[#f8c32c]/10 via-white to-[#278d45]/10 shadow-lg hover:shadow-2xl transition group hover:scale-[1.03] duration-200"
                    >
                        <div className="w-28 h-28 mb-3 relative rounded-xl overflow-hidden border-2 border-[#278d45]/30 bg-white flex items-center justify-center shadow-inner">
                            {item.product?.images?.[0] ? (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product.productName}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#f8c32c]/20 flex items-center justify-center text-[#278d45] text-base font-bold">
                                    <span role="img" aria-label="no image">🧸</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center w-full">
                            <div className="font-semibold text-base mb-1 line-clamp-2 max-w-[220px] truncate text-[#0d401c] group-hover:text-[#278d45] transition">
                                {item.product?.productName}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                {item.product?.productPriceSale && item.product.productPriceSale > 0 ? (
                                    <>
                                        <span className="text-[#278d45] font-bold text-lg drop-shadow">
                                            {item.product.productPriceSale.toLocaleString()}₫
                                        </span>
                                        <span className="line-through text-gray-400 text-sm">
                                            {item.product.productPrice?.toLocaleString()}₫
                                        </span>
                                        <span className="bg-[#f8c32c]/20 text-[#f8c32c] text-xs px-2 py-0.5 rounded-full font-semibold border border-[#f8c32c]/40 shadow">
                                            -{Math.round(100 - (item.product.productPriceSale / item.product.productPrice) * 100)}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[#278d45] font-bold text-lg drop-shadow">
                                        {item.product?.productPrice?.toLocaleString()}₫
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-[#0d401c] mt-1">
                                <span className="bg-[#f8c32c]/20 text-[#0d401c] px-2 py-0.5 rounded-full font-medium border border-[#f8c32c]/40 shadow">
                                    Đã bán: <span className="font-bold">{item.orderCount}</span>
                                </span>
                                <span className="bg-[#278d45]/10 text-[#278d45] px-2 py-0.5 rounded-full font-medium border border-[#278d45]/30 shadow">
                                    ID: {item.productID}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/vi/dashboard/products/edit-product/${item.productID}`}
                            className="absolute top-4 right-4 rounded-full bg-white border-2 border-[#278d45]/30 p-2 shadow hover:bg-[#278d45] hover:text-white transition"
                            title="Chỉnh sửa sản phẩm"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </Link>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f8c32c] text-[#0d401c] px-3 py-1 rounded-full text-xs font-bold shadow border border-[#f8c32c]/60 animate-bounce">
                            🌟 Best Seller!
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render for poor selling products (Product[])
    const renderPoorProductList = (products: Product[]) => {
        if (loading) return <div>Đang tải sản phẩm...</div>;
        if (error) return <div className="text-red-500">{error}</div>;
        if (!products.length) return <div>Không có dữ liệu sản phẩm.</div>;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {products.map((item) => (
                    <div
                        key={item.productID}
                        className="relative border-2 border-[#f8c32c] rounded-2xl p-5 flex flex-col items-center bg-gradient-to-br from-[#f8c32c]/5 via-white to-[#278d45]/5 shadow-lg hover:shadow-2xl transition group hover:scale-[1.03] duration-200"
                    >
                        <div className="w-28 h-28 mb-3 relative rounded-xl overflow-hidden border-2 border-[#278d45]/30 bg-white flex items-center justify-center shadow-inner">
                            {item.images?.[0] ? (
                                <Image
                                    src={item.images[0]}
                                    alt={item.productName}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <Image
                                    src={NoImage}
                                    alt="No image"
                                    fill
                                    className="object-cover opacity-70"
                                />
                            )}
                        </div>
                        <div className="text-center w-full">
                            <div className="font-semibold text-base mb-1 line-clamp-2 max-w-[220px] truncate text-[#0d401c] group-hover:text-[#278d45] transition">
                                {item.productName}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                {item.productPriceSale && item.productPriceSale > 0 ? (
                                    <>
                                        <span className="text-[#278d45] font-bold text-lg drop-shadow">
                                            {item.productPriceSale.toLocaleString()}₫
                                        </span>
                                        <span className="line-through text-gray-400 text-sm">
                                            {item.productPrice?.toLocaleString()}₫
                                        </span>
                                        <span className="bg-[#f8c32c]/20 text-[#f8c32c] text-xs px-2 py-0.5 rounded-full font-semibold border border-[#f8c32c]/40 shadow">
                                            -{Math.round(100 - (item.productPriceSale / item.productPrice) * 100)}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[#278d45] font-bold text-lg drop-shadow">
                                        {item.productPrice?.toLocaleString()}₫
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-[#b91c1c] mt-1">
                                <span className="bg-[#f8c32c]/10 text-[#b91c1c] px-2 py-0.5 rounded-full font-semibold border border-[#f8c32c]/30 shadow animate-pulse">
                                    Chưa bán được
                                </span>
                                <span className="bg-[#278d45]/10 text-[#278d45] px-2 py-0.5 rounded-full font-medium border border-[#278d45]/30 shadow">
                                    ID: {item.productID}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/vi/dashboard/products/edit-product/${item.productID}`}
                            className="absolute top-4 right-4 rounded-full bg-white border-2 border-[#278d45]/30 p-2 shadow hover:bg-[#278d45] hover:text-white transition"
                            title="Chỉnh sửa sản phẩm"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </Link>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#b91c1c] text-white px-3 py-1 rounded-full text-xs font-bold shadow border border-[#f8c32c]/60 animate-bounce">
                            🚨 Bán chậm!
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className=" bg-white">
            <h2 className="text-2xl font-bold text-primary mt-6 mb-4">Sản Phẩm Bán Chạy - Bán Chậm</h2>
            <Tabs value={tab} onValueChange={setTab} className="mb-4 ">
                <TabsList className="flex justify-center px-1 mb-8">
                    <TabsTrigger value="top" className="hover:cursor-pointer">Top bán chạy</TabsTrigger>
                    <TabsTrigger value="poor" className="hover:cursor-pointer">Bán chậm / chưa bán</TabsTrigger>
                </TabsList>
                <TabsContent value="top" className={tab === "top" ? "block" : "hidden"}>
                    {renderTopProductList(topProducts)}
                </TabsContent>
                <TabsContent value="poor" className={tab === "poor" ? "block" : "hidden"}>
                    {renderPoorProductList(poorProducts)}
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default TopSellingProductSection;
