import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchTopSellingProducts, fetchPoorSellingProducts } from "@/lib/product-apis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs/tabs";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((item) => (
                    <div key={item.productID || item.product?.productID} className="border rounded-lg p-3 flex flex-col items-center bg-gray-50 hover:shadow-lg transition">
                        <div className="w-24 h-24 mb-2 relative">
                            {item.product?.images?.[0] ? (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product.productName}
                                    fill
                                    className="object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-base mb-1 line-clamp-2 max-w-[200px] truncate">{item.product?.productName}</div>
                            <div className="text-primary font-bold text-lg">
                                {item.product?.productPriceSale && item.product.productPriceSale > 0
                                    ? `${item.product.productPriceSale.toLocaleString()}₫`
                                    : `${item.product?.productPrice?.toLocaleString()}₫`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Đã bán: {item.orderCount}
                            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((item) => (
                    <div key={item.productID} className="relative border rounded-lg p-3 flex flex-col items-center bg-gray-50 hover:shadow-lg transition">
                        <div className="w-24 h-24 mb-2 relative">
                            {item.images?.[0] ? (
                                <Image
                                    src={item.images[0]}
                                    alt={item.productName}
                                    fill
                                    className="object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-base mb-1 line-clamp-2 max-w-[200px] truncate">{item.productName}</div>
                            <div className="text-primary font-bold text-lg">
                                {item.productPriceSale && item.productPriceSale > 0
                                    ? `${item.productPriceSale.toLocaleString()}₫`
                                    : `${item.productPrice?.toLocaleString()}₫`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Chưa bán được
                            </div>
                        </div>
                        <Link href={`/vi/dashboard/products/edit-product/${item.productID}`} className="absolute top-5 right-5 rounded-full bg-gray-200 p-2"><PencilIcon className="w-5 h-5" /></Link>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className=" bg-white">
            <Tabs value={tab} onValueChange={setTab} className="mb-4 ">
                <TabsList className="flex justify-center px-1">
                    <TabsTrigger value="top">Top bán chạy</TabsTrigger>
                    <TabsTrigger value="poor">Bán chậm / chưa bán</TabsTrigger>
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
