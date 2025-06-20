"use client";

import * as React from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
} from "@/components/ui/table/table";
import Image from "next/image";
import formatDate from "@/lib/format-date";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useDictionary } from "@/contexts/dictonary-context";
import { baseUrl } from "@/lib/base-url";
import Link from "next/link";

interface Product {
    productID: number;
    productName: string;
    productPrice: number | null;
    productPriceSale: number | null;
    quantityAvailable: number;
    categoryID: number;
    originID: number;
    subcategoryID: number;
    images: string[];
    rating: number;
    updatedAt: string;
    createdAt: string;
}

interface Category { categoryID: number; categoryName: string; }
interface Origin { originID: number; originName: string; }

export default function ProductsPage() {
    const { lang } = useDictionary();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [origins, setOrigins] = useState<Origin[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [nameFilter, setNameFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [originFilter, setOriginFilter] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        fetch(`${baseUrl}/api/product`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        // Fetch categories
        fetch(`${baseUrl}/api/category`)
            .then((res) => res.json())
            .then((data) => setCategories(data));
        // Fetch origins
        fetch(`${baseUrl}/api/origin`)
            .then((res) => res.json())
            .then((data) => setOrigins(data));
    }, []);

    const filteredProducts = products
        .filter((product) => {
            const matchesName = product.productName.toLowerCase().includes(nameFilter.toLowerCase());
            const matchesCategory = !categoryFilter || String(product.categoryID) === categoryFilter;
            const matchesOrigin = !originFilter || String(product.originID) === originFilter;
            const matchesRating = !ratingFilter || product.rating >= Number(ratingFilter);
            return matchesName && matchesCategory && matchesOrigin && matchesRating;
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            let aValue = a[sortField as keyof Product];
            let bValue = b[sortField as keyof Product];
            if (typeof aValue === "string" && typeof bValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) return 0;
            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Navigate to edit product page using product ID 
    const handleEditProduct = (productID: number) => {
        router.push(`/${lang}/dashboard/products/edit-product/${productID}`);
    };

    // Delete product and all related images
    const handleDeleteProduct = async (productID: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setDeletingId(productID);
        // 1. Fetch product detail to get all image URLs
        const productRes = await fetch(`http://localhost:3001/api/product/${productID}`);
        if (!productRes.ok) {
            alert("Failed to fetch product details.");
            setDeletingId(null);
            return;
        }
        const product = await productRes.json();
        const allImageUrls = [
            ...(product.images || []),
            ...(product.descriptionImages || [])
        ].filter(Boolean);
        // 2. Delete all images from storage
        if (allImageUrls.length > 0) {
            await fetch(`http://localhost:3001/api/upload/multi-delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: allImageUrls }),
            });
        }
        // 3. Delete product
        const res = await fetch(`http://localhost:3001/api/product/${productID}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.productID !== productID));
        } else {
            alert("Failed to delete product.");
        }
        setDeletingId(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Product Management</h1>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <input
                    type="text"
                    placeholder="Filter by product name..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                />
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All categories</option>
                    {categories.map(c => (
                        <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                    ))}
                </select>
                <select
                    value={originFilter}
                    onChange={e => setOriginFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All origins</option>
                    {origins.map(o => (
                        <option key={o.originID} value={o.originID}>{o.originName}</option>
                    ))}
                </select>
                <select
                    value={ratingFilter}
                    onChange={e => setRatingFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All ratings</option>
                    <option value="5">5+</option>
                    <option value="4">4+</option>
                    <option value="3">3+</option>
                    <option value="2">2+</option>
                    <option value="1">1+</option>
                </select>
                <select
                    value={sortField}
                    onChange={e => setSortField(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">Sort by</option>
                    <option value="productPrice">Price</option>
                    <option value="quantityAvailable">Quantity</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
                {/* <Button> */}
                <Link href={`/${lang}/dashboard/products/add-product`} className="px-4 py-2 bg-primary text-white rounded">     
                    Add Product
                </Link>
            </div>
            <Table className="w">
                <TableCaption>{loading ? "Loading products..." : products.length === 0 ? "No products found." : null}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Subcategory ID</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => (
                        <TableRow key={product.productID}>
                            <TableCell>{product.productID}</TableCell>
                            <TableCell className="truncate">{product.productName}</TableCell>
                            <TableCell>
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        width={64}
                                        height={64}
                                        src={product.images[0]}
                                        alt={product.productName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-gray-400">No image</span>
                                )}
                            </TableCell>
                            <TableCell>{product.productPrice !== null ? product.productPrice.toLocaleString() : "-"}</TableCell>
                            <TableCell>{product.productPriceSale !== null ? product.productPriceSale.toLocaleString() : "-"}</TableCell>
                            <TableCell>{product.quantityAvailable}</TableCell>
                            <TableCell>{categories.find(c => c.categoryID === product.categoryID)?.categoryName || product.categoryID}</TableCell>
                            <TableCell>{origins.find(o => o.originID === product.originID)?.originName || product.originID}</TableCell>
                            <TableCell>{product.subcategoryID}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>{formatDate(product.updatedAt)}</TableCell>
                            <TableCell>{formatDate(product.createdAt)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <button
                                        className="p-1 rounded hover:bg-primary/10"
                                        title="Edit product"
                                        onClick={() => handleEditProduct(product.productID)}
                                    >
                                        <Pencil className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                className="p-1 rounded hover:bg-red-100"
                                                title="Delete product"
                                                disabled={deletingId === product.productID}
                                            >
                                                {deletingId === product.productID ? (
                                                    <span className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full inline-block" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                )}
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Bạn có chắc chắn muốn xóa sản phẩm "{product.productName}" không? Thao tác này không thể hoàn tác và sẽ xóa toàn bộ hình ảnh liên quan.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteProduct(product.productID)}
                                                    disabled={deletingId === product.productID}
                                                >
                                                    Xóa
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* </div> */}

        </div>
    );
}
