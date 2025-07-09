"use client";

import React, { useEffect, useState} from "react";
import Image from "next/image";
import { baseUrl } from "@/lib/base-url";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
    productID: number;
    barcode: string;
    boxBarcode: string;
    boxQuantity: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    description: string;
    images: string[];
}

export default function ImportProductUsingBarcodePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string>("");
    const [isBox, setIsBox] = useState<boolean>(false);

    // Buffer for barcode scanner input
    const [barcodeBuffer, setBarcodeBuffer] = useState("");
    const [barcodeManual, setBarcodeManual] = useState("");
    const barcodeBufferRef = React.useRef(barcodeBuffer);
    const bufferTimeout = React.useRef<NodeJS.Timeout | null>(null);

  

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
            const response = await fetch(`${baseUrl}/api/product/${isBox ? 'box-' : ''}barcode/${barcode}`);
            if (!response.ok) {
                throw new Error("Product not found");
            }
            const product: Product = await response.json();
            console.log("Fetched product:", product);
            setProducts([...products, product]);
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Không tìm thấy sản phẩm với mã vạch này.");
        }
    }
    // Unified barcode processing logic
    const handleScannedBarcode = (bc: string) => {
        // Do not slice, just trim to get the full barcode
        const barcode = bc.trim();
        console.log("Scanned barcode:", barcode, typeof barcode);
        products.forEach(item => {
            console.log("Product barcode:", item.barcode, typeof item.barcode);
        });
        if (isBox) {
            const existedInProductsArray = products.find(item => item.boxBarcode.trim() === barcode);
            if (existedInProductsArray) {
                const updatedProducts = products.map(item => {
                    if (item.boxBarcode.trim() === barcode) {
                        return { ...item, boxQuantity: item.boxQuantity + 1 }
                    } else {
                        return item;
                    }
                });
                setProducts(updatedProducts);
            } else {
                fetchProduct(barcode);
            }
        } else if (!isBox) {
            const existed = products.find(item => item.barcode.trim() === barcode); // Strict match, trimmed
            if (existed && products.length > 0) {
                const updatedProducts = products.map(item => {
                    if (item.barcode.trim() === barcode) {
                        return { ...item, quantityAvailable: item.quantityAvailable + 1 }
                    } else {
                        return item;
                    }
                });
                setProducts(updatedProducts);
            } else {
                fetchProduct(barcode);
            }
        } else {
            setError("Mã vạch lô/thùng không hợp lệ. Hãy thử lại.");
        }
    };



    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-4">Nhập Kho Sản Phẩm Sử Dụng Máy Quét</h1>
            <p className="mb-2 text-gray-600">Sử dụng máy quét mã vạch để quét mã vạch trên sản phẩm. Nhập thủ công nếu mã vạch mờ, lỗi.</p>

            <div className="flex gap-x-2">
                <Input
                    type="text"
                    value={ barcodeManual}
                    onChange={(e) => setBarcodeManual(e.target.value)}
                    placeholder="Quét mã vạch sản phẩm hoặc thùng"
                    className="w-full p-2 border rounded mb-4"
                    autoFocus
                />
                <Button variant="default" className="hover:cursor-pointer" onClick={() => handleScannedBarcode(barcodeManual.slice(0,12))}>Thêm</Button>
            </div>
            <div className="flex gap-x-6 mb-4">
                <div className="flex items-center gap-x-2"><p className="text-gray-600">Quét từng sản phẩm</p><span className={`w-3 h-3 rounded-full ${!isBox ? 'bg-green-500' : 'bg-gray-300'}`}></span></div>
                <div className="flex items-center gap-x-2"><p className="text-gray-600">Quét lô/thùng</p><span className={`w-3 h-3 rounded-full ${isBox ? 'bg-green-500' : 'bg-gray-300'}`}></span></div>
            </div>
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {products.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Mã vạch</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Giá giảm</TableHead>
                            <TableHead className="text-center">Số lượng</TableHead>
                            <TableHead className="text-center">Số lượng thùng/lô</TableHead>
                            <TableHead>Hình ảnh</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(item => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>{item.productPrice} VND</TableCell>
                                <TableCell>{item.productPriceSale} VND</TableCell>
                                <TableCell className="text-center">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={item.quantityAvailable}
                                            initial={{ scale: 1 }}
                                            animate={{ scale: 1.3, transition: { duration: 0.01 } }}
                                            exit={{ scale: 1.6 }}
                                            transition={{ type: "spring", stiffness: 700, damping: 15, duration: 0.01 }}
                                            style={{ display: "inline-block" }}
                                        >
                                            {item.quantityAvailable}
                                        </motion.span>
                                    </AnimatePresence>
                                </TableCell>
                                <TableCell className="text-center">
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
                                </TableCell>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {/* <Button onClick={handleUpdateProductQuantity} className="mt-4">
                Cập nhật số lượng trong kho
            </Button> */}
        </div>
    );
}