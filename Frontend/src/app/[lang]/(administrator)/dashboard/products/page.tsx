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
import formatDate from "@/lib/others/format-date";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination/pagination";
import { deleteProduct, fetchProductById, fetchProducts } from "@/lib/product-apis";
import { fetchCategories } from "@/lib/category-apis";
import { fetchOrigins } from "@/lib/origin-apis";
import { deleteMultipleImages } from "@/lib/file-apis";

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
    const [sortOrder,] = useState("asc");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        const fetchProductsData = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        const fetchCategoriesData = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        const fetchOriginsData = async () => {
            try {
                const data = await fetchOrigins();
                setOrigins(data);
            } catch (error) {
                console.error("Error fetching origins:", error);
            }
        }
        Promise.all([fetchProductsData(), fetchCategoriesData(), fetchOriginsData()])
            .catch(error => {
                console.error("Error fetching initial data:", error);
                setLoading(false);
            });
    }, []);

    const filteredProducts = products
        .filter((product) => {
            const matchesName = product.productName.toLowerCase().includes(nameFilter.toLowerCase());
            const matchesCategory = !categoryFilter || categoryFilter === "df" || String(product.categoryID) === categoryFilter;
            const matchesOrigin = !originFilter || originFilter === "df" || String(product.originID) === originFilter;
            const matchesRating = !ratingFilter || ratingFilter === "df" || product.rating === Number(ratingFilter);
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

    // Pagination logic
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Delete product and all related images
    const handleDeleteProduct = async (productID: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setDeletingId(productID);
        // 1. Fetch product detail to get all image URLs
        const product = await fetchProductById(String(productID));
        const allImageUrls = [
            ...(product.images || []),
            ...(product.descriptionImages || [])
        ].filter(Boolean);
        // 2. Delete all images from storage
        if (allImageUrls.length > 0) {
            await deleteMultipleImages(allImageUrls);
        }
        // 3. Delete product
        const res = await deleteProduct(String(productID));
        if (res) {
            setProducts((prev) => prev.filter((p) => p.productID !== productID));
        } else {
            alert("Failed to delete product.");
        }
        setDeletingId(null);
    };

    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-4">Danh Sách Sản Phẩm Tại Cửa Hàng</h1>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <Input
                    type="text"
                    placeholder="Lọc theo tên sản phẩm"
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    className="w-56"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-44" aria-label="Category">
                        <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Tất cả danh mục</SelectLabel>
                            <SelectItem value="df">Tất cả danh mục</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.categoryID} value={String(c.categoryID)}>{c.categoryName}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={originFilter} onValueChange={setOriginFilter}>
                    <SelectTrigger className="w-44" aria-label="Origin">
                        <SelectValue placeholder="Tất cả nhà sản xuất" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Tất cả nhà sản xuất</SelectLabel>
                            <SelectItem value="df">Tất cả nhà sản xuất</SelectItem>
                            {origins.map(o => (
                                <SelectItem key={o.originID} value={String(o.originID)}>{o.originName}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-44" aria-label="Rating">
                        <SelectValue placeholder="Tất cả thứ hạng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Tất cả thứ hạng</SelectLabel>
                            <SelectItem value="df">Tất cả thứ hạng</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger className="w-44" aria-label="Sắp xếp">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sắp xếp</SelectLabel>
                            <SelectItem value="df">Mặc định</SelectItem>
                            <SelectItem value="productPrice">Giá</SelectItem>
                            <SelectItem value="quantityAvailable">Số lượng</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Số sản phẩm/trang:</span>
                        <Select value={String(productsPerPage)} onValueChange={val => { setProductsPerPage(Number(val)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                </div>
            </div>

            <Table className="w">
                <TableCaption>{loading ? "Loading products..." : products.length === 0 ? "No products found." : null}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead className="text-center">Ảnh</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Giá giảm</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>NSX</TableHead>
                        {/* <TableHead>Subcategory ID</TableHead> */}
                        <TableHead>Xếp hạng</TableHead>
                        <TableHead>Ngày sửa</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedProducts.map((product) => (
                        <TableRow key={product.productID}>
                            <TableCell>{product.productID}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{product.productName}</TableCell>
                            <TableCell className="flex justify-center items-center w-16 h-fit">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        width={64}
                                        height={64}
                                        src={product.images[0]}
                                        alt={product.productName}
                                        className="w-16 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-gray-400">No image</span>
                                )}
                            </TableCell>
                            <TableCell>{product.productPrice !== null ? product.productPrice.toLocaleString() : "-"}</TableCell>
                            <TableCell>{product.productPriceSale !== null ? product.productPriceSale.toLocaleString() : "-"}</TableCell>
                            <TableCell>{product.quantityAvailable}</TableCell>
                            <TableCell className="max-w-[100px] truncate">{categories.find(c => c.categoryID === product.categoryID)?.categoryName || product.categoryID}</TableCell>
                            <TableCell>{origins.find(o => o.originID === product.originID)?.originName || product.originID}</TableCell>
                            {/* <TableCell >{product.subcategoryID}</TableCell> */}
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>{formatDate(product.updatedAt)}</TableCell>
                            <TableCell>{formatDate(product.createdAt)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2 w-full justify-center">
                                    <Link
                                        href={`/${lang}/dashboard/products/edit-product/${product.productID}`}
                                        className="p-1 rounded hover:bg-primary/10"
                                        title="Edit product"
                                    >
                                        <Pencil className="w-4 h-4 text-blue-600" />
                                    </Link>
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
                                                    Bạn có chắc chắn muốn xóa sản phẩm {product.productName} không? Thao tác này sẽ xóa thông tin sản phẩm và sẽ xóa toàn bộ hình ảnh liên quan.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer hover:bg-white hover:border-[2px] border-gray-300">Hủy</AlertDialogCancel>
                                                <AlertDialogAction className="cursor-pointer bg-red-500 hover:bg-red-300"
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
            <div className="mt-6 flex justify-between items-center">
                <Pagination className="w-full  flex justify-start">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                aria-disabled={currentPage === 1}
                                tabIndex={currentPage === 1 ? -1 : 0}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={e => { e.preventDefault(); setCurrentPage(page); }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={e => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                aria-disabled={currentPage === totalPages || totalPages === 0}
                                tabIndex={currentPage === totalPages || totalPages === 0 ? -1 : 0}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
                <Link href={`/${lang}/dashboard/products/add-product`} className="px-4 py-2 bg-primary text-white rounded shrink-0">
                    Thêm sản phẩm
                </Link>
            </div>
        </div>
    );
}
