"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { baseUrl } from "@/lib/others/base-url";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
// Removed framer-motion. Use normal elements and manual CSS for animation.
import { useUser } from "@/contexts/user-context";
import toast from "react-hot-toast";
import { importProducts } from "@/lib/product-apis";

interface Product {
    productID: number;
    barcode: string;
    boxBarcode: string;
    // boxQuantity: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    description: string;
    images: string[];
    quantityPerBox: number;
}

export default function ImportProductUsingBarcodePage() {
    const { user } = useUser();
    const [note, setNote] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string>("");
    const [isBox, setIsBox] = useState<boolean>(false);

    // Buffer for barcode scanner input
    const [barcodeBuffer, setBarcodeBuffer] = useState("");
    const [barcodeManual, setBarcodeManual] = useState("");
    const barcodeBufferRef = useRef(barcodeBuffer);
    const bufferTimeout = useRef<NodeJS.Timeout | null>(null);
    const isBoxRef = useRef(isBox);
    const productsRef = useRef<Product[]>([]);

    // Update refs when state changes
    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    useEffect(() => {
        isBoxRef.current = isBox;
    }, [isBox]);

    useEffect(() => {
        barcodeBufferRef.current = barcodeBuffer;
    }, [barcodeBuffer]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (/^[0-9]$/.test(e.key)) {
                setBarcodeBuffer(prev => prev + e.key);
                if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
                bufferTimeout.current = setTimeout(() => {
                    setBarcodeBuffer("");
                }, 200);
            } else if (e.key === "Enter" && barcodeBufferRef.current.length > 0) {
                setError("");
                handleScannedBarcode(barcodeBufferRef.current);
                setBarcodeBuffer("");
                if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
            } else if (e.key === " ") {
                setIsBox(prev => !prev);
                setBarcodeBuffer("");
                if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []); // Only run once on mount


    // Fetch product details by barcode
    const fetchProduct = async (barcode: string) => {
        try {
            const product = await importProducts(isBoxRef.current, barcode);
            setProducts(prev => [...prev, product]);
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Không tìm thấy sản phẩm với mã vạch này. Thử nhập thủ công hoặc kiểm tra lại mã vạch.");
        }
    }

    // Unified barcode processing logic
    const handleScannedBarcode = (bc: string) => {
        // Always compare only the first 12 digits, trimmed, for both scanned and product barcodes
        const barcode = bc.trim().slice(0, 12);
        if (isBoxRef.current) {
            const existedInProductsArray = productsRef.current.find(item => item.boxBarcode === barcode);
            if (existedInProductsArray) {
                const updatedProducts = productsRef.current.map(item => {
                    if (item.boxBarcode === barcode) {
                        return { ...item, quantityAvailable: item.quantityAvailable + item.quantityPerBox }
                    } else {
                        return item;
                    }
                });
                setProducts(updatedProducts);
            } else {
                fetchProduct(barcode);
            }
        } else {
            const existed = productsRef.current.find(item => item.barcode === barcode);
            if (existed) {
                const updatedProducts = productsRef.current.map(item => {
                    if (item.barcode === barcode) {
                        return { ...item, quantityAvailable: item.quantityAvailable + 1 }
                    } else {
                        return item;
                    }
                });
                setProducts(updatedProducts);
            } else {
                fetchProduct(barcode);
            }
        }
    };

    // Update product quantities in the backend
    const handleUpdateProductQuantity = async () => {
        if (!user) { toast.error("Bạn cần đăng nhập để thực hiện thao tác này."); return; }
        try {
            const res = await fetch(`${baseUrl}/api/product/update/quantity`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(products.map(p => ({
                    productID: p.productID,
                    performedBy: user.userID,
                    note: note,
                    quantityAvailable: p.quantityAvailable,
                })))
            });
            if (res) {
                setProducts([]);
                setBarcodeManual("");
                toast.success("Cập nhật số lượng thành công!");
            } else {
                toast.error("Cập nhật số lượng thất bại!");
            }
        } catch (err) {
            console.error("Error updating product quantity:", err);
            toast.error("Có lỗi xảy ra khi cập nhật số lượng!");
        }
    };

    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-4">Nhập Kho Sản Phẩm Sử Dụng Máy Quét</h1>
            <p className="mb-2 text-gray-600">Sử dụng máy quét mã vạch để quét mã vạch trên sản phẩm. Nhập thủ công nếu mã vạch mờ, lỗi.</p>

            <div className="flex gap-x-2">
                <Input
                    type="text"
                    value={barcodeManual}
                    onChange={(e) => setBarcodeManual(e.target.value)}
                    placeholder="Quét mã vạch sản phẩm hoặc thùng"
                    className="w-full p-2 border rounded mb-4"
                    autoFocus
                />
                <Button variant="default" className="hover:cursor-pointer" onClick={() => handleScannedBarcode(barcodeManual.slice(0, 12))}>Thêm</Button>
            </div>
            <div className="flex gap-x-6 mb-4">
                <div className="flex items-center gap-x-2"><p className="text-gray-600">Quét từng sản phẩm</p><span className={`w-3 h-3 rounded-full ${!isBox ? 'bg-green-500' : 'bg-gray-300'}`}></span></div>
                <div className="flex items-center gap-x-2"><p className="text-gray-600">Quét lô/thùng</p><span className={`w-3 h-3 rounded-full ${isBox ? 'bg-green-500' : 'bg-gray-300'}`}></span></div>
            </div>
            {error && <p className="my-4 text-red-600">{error}</p>}
            {products.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hình ảnh</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Mã vạch</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Giá giảm</TableHead>
                            <TableHead className="text-center">Số lượng</TableHead>
                            {/* <TableHead className="text-center">Số lượng thùng/lô</TableHead> */}

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(item => (
                            <TableRow key={item.barcode}>
                                <TableCell>
                                    {item.images && item.images.length > 0 && (
                                        <div className="flex gap-2">
                                            {item.images.map((img, idx) => (
                                                <Image
                                                    key={idx}
                                                    src={img}
                                                    width={64}
                                                    height={64}
                                                    alt="Product image"
                                                    className="w-16 h-16 object-cover rounded border"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>{item.productPrice} VND</TableCell>
                                <TableCell>{item.productPriceSale} VND</TableCell>
                                <TableCell className="text-center">
                                    <span
                                        className="inline-block animate-bounce-fast"
                                        style={{ transition: 'transform 0.1s', transform: 'scale(1.2)' }}
                                    >
                                        {item.quantityAvailable}
                                    </span>
                                </TableCell>
                                {/* <TableCell className="text-center">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={item.boxQuantity}
                                            initial={{ scale: 1 }}
                                            animate={{ scale: 1.3 }}
                                            exit={{ scale: 1.6 }}
                                            transition={{ type: "spring", stiffness: 700, damping: 15, duration: 0.01 }}
                                            style={{ display: "inline-block" }}
                                        >
                                            {item.boxQuantity}
                                        </motion.span>
                                    </AnimatePresence>
                                </TableCell> */}

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            <div className="flex justify-between items-center gap-x-2">
                <Input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú cho thao tác nhập kho"
                    className="w-full p-2 border rounded"
                    autoFocus
                />
                <Button onClick={handleUpdateProductQuantity}
                    disabled={products.length === 0}
                    variant="default"
                    className="hover:cursor-pointer">
                    Cập nhật số lượng trong kho
                </Button>
            </div>
        </div>
    );
}