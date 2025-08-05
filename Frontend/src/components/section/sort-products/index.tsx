import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge/badge";
import Image from "next/image";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import SortableItem from "@/components/ui/sortable-item";
import { batchUpdateProductOrder, fetchProducts } from "@/lib/product-apis";
import SortableItem from "@/components/ui/sortable-item";

interface Product {
    productID: number;
    productName: string;
    images?: string[];
    productPrice: number;
    productPriceSale?: number;
    order: number;
}

const SortProductsSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showSort, setShowSort] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProductsData() {
            setLoading(true);
            try {
                const data = await fetchProducts();

                const sorted = (data as Product[]).sort((a, b) => a.order - b.order);
                setProducts(sorted);
            } catch {
                setProducts([]);
            }
            setLoading(false);
        }
        if (showSort) fetchProductsData();
    }, [showSort]);

    // DnD Kit setup
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = products.findIndex(p => p.productID === active.id);
            const newIndex = products.findIndex(p => p.productID === over?.id);
            const newProducts = arrayMove(products, oldIndex, newIndex);
            setProducts(newProducts);
        }
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            // Batch update product order for better performance
            const updates = products.map((p, i) => ({ productID: p.productID, order: i + 1 }));
            await batchUpdateProductOrder(updates);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="my-8 w-full">
            <div className="flex justify-end my-4">
            <button
                className="flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer bg-gradient-to-r from-green-700 to-green-900 text-white rounded-full shadow-lg hover:from-green-800 hover:to-green-950 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={() => setShowSort(!showSort)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="#21A366" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {showSort ? "Ẩn sắp xếp sản phẩm" : "Hiển thị sắp xếp sản phẩm"}
            </button>
            </div>
            {showSort && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 shadow-lg w-full">
                <h2 className="text-xl font-bold text-blue-700 mb-4">Kéo thả để sắp xếp sản phẩm</h2>
                {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải sản phẩm...</div>
                ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={products.map(p => p.productID)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                        <SortableItem key={product.productID} id={product.productID}>
                            <Card className="bg-white border border-blue-200 shadow-md hover:shadow-xl transition-all flex flex-col items-stretch justify-between h-64 w-64 mx-auto">
                            <CardHeader className="flex flex-row gap-4 items-center">
                                <Image
                                src={product.images?.[0] || "/default-product.png"}
                                alt={product.productName}
                                width={80}
                                height={80}
                                className="rounded-lg border border-blue-100 object-cover"
                                />
                                <div>
                                <CardTitle className="text-lg font-semibold text-blue-700">{product.productName}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex flex-col gap-2 items-start mt-auto">
                                <Badge variant="outline">Giá: {product.productPriceSale ? product.productPriceSale : product.productPrice} VND</Badge>
                                <div className="text-xs text-gray-400">ID: {product.productID}</div>
                            </CardFooter>
                            </Card>
                        </SortableItem>
                        ))}
                    </div>
                    </SortableContext>
                </DndContext>
                )}
                <div className="flex justify-end mt-6">
                <button
                    className="flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer bg-gradient-to-r from-green-700 to-green-900 text-white rounded-full shadow-lg hover:from-green-800 hover:to-green-950 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    onClick={handleSaveOrder}
                    disabled={saving}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="#21A366"/>
                    <path d="M7 8l2.5 4L7 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 8h4M13 12h4M13 16h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {saving ? "Đang lưu..." : "Lưu thứ tự"}
                </button>
                </div>
            </div>
            )}
        </section>
    );
};

export default SortProductsSection;
