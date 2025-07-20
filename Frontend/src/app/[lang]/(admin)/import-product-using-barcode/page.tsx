"use client";

import React, { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button/button";
import Image from "next/image";
import { baseUrl } from "@/lib/others/base-url";

// Dynamically import the barcode scanner to avoid SSR issues
const BarcodeScannerComponent = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

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
  // ...add more fields as needed
}

export default function ImportProductUsingBarcodePage() {
  const [barcode, setBarcode] = useState<string>("");
  const [boxBarcode, setBoxbarCode] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Ref for hardware barcode scanner input
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle barcode input from hardware scanner
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      const scanned = inputRef.current.value.trim();
      if (scanned) {
        handleScannedBarcode(scanned);
        inputRef.current.value = "";
      }
    }
  };

  // Unified barcode processing logic
  const handleScannedBarcode = (barcode: string) => {
    console.log("Scanned barcode:", barcode);
    if (barcode && (/^88+\d{11}$/).test(barcode)) {
      setBoxbarCode(barcode);
      const existedInProductsArray = products.find(item => item.boxBarcode === barcode);
      if (existedInProductsArray) {
        const updatedProducts = products.map(item => {
          if (item.boxBarcode === barcode) {
            return { ...item, boxQuantity: item.boxQuantity + 1 }
          } else {
            return item;
          }
        });
        setProducts(updatedProducts);
        setScanning(false);
      } else {
        setScanning(false);
        fetchProduct(barcode);
      }
    } else if (barcode && (/^83+\d{10}$/).test(barcode.slice(0, 12))) {
      setBarcode(barcode);
      const existed = products.find(item => item.barcode === barcode.slice(0, 12));
      if (existed && products.length > 0) {
        const updatedProducts = products.map(item => {
          if (item.barcode === barcode.slice(0, 12)) {
            return { ...item, quantityAvailable: item.quantityAvailable + 1 }
          } else {
            return item;
          }
        });
        setProducts(updatedProducts);
        setScanning(false);
      } else {
        setScanning(false);
        fetchProduct(barcode);
      }
    } else {
      setError("Invalid barcode format. Please scan a valid product or box barcode.");
    }
  };

  // For webcam scanner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = useCallback((err: any, result: any) => {
    if (result && result.text) {
      handleScannedBarcode(result.text);
    }
  }, [products]);

  const fetchProduct = async (barcodeValue: string) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if ((/^88+\d{11}$/).test(barcodeValue)) {
        res = await fetch(
          `${baseUrl}/api/product/box-barcode/${barcodeValue.slice(0, 13)}`
        );
      } else {
        res = await fetch(
          `http://localhost:3001/api/product/barcode/${barcodeValue.slice(0, 12)}`
        );
      }
      if (!res.ok) {
        throw new Error("Product not found");
      }
      const data = await res.json();
      setProducts([...products, data]);
    } catch (err) {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    setBarcode("");
    setError("");
    setScanning(true);
    // Refocus the input for hardware scanner
    inputRef.current?.focus();
  };

  const handleUpdateProductQuantity = async () => {
    if (products.length === 0) {
      setError("No products to update");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/product/update/quantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(products),
      });
      if (!res.ok) {
        throw new Error("Failed to update product quantities");
      }
      setProducts([]);
    } catch (err) {
      setError("Failed to update product quantities");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-8xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Import Product Using Barcode</h1>
      {/* Hidden input for hardware barcode scanner */}
      <input
        ref={inputRef}
        type="text"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        onKeyDown={handleBarcodeInput}
        tabIndex={-1}
        autoFocus
      />
      <Button onClick={() => inputRef.current?.focus()} variant="outline" className="mb-4">
        Focus Barcode Scanner Input
      </Button>
      {scanning ? (
        <div>
          <p className="mb-2">Scan a product barcode using your webcam or barcode scanner:</p>
          <div className="border rounded overflow-hidden w-full max-w-md mx-auto aspect-video bg-black">
            <BarcodeScannerComponent
              width={400}
              height={300}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="mb-2">Scanned Barcode: <span className="font-mono text-lg">{barcode && barcode}</span></p>
          <p className="mb-2">Scanned Box Barcode: <span className="font-mono text-lg">{boxBarcode && boxBarcode}</span></p>
          <Button onClick={handleRescan} variant="outline">Scan Again</Button>
        </div>
      )}
      {loading && <p className="mt-4">Loading product info...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div>{products.length > 0 && products.map(item => (
        <div key={item.barcode} className="flex gap-x-6 items-center mt-6 border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Product Details</h2>
          <div className="mb-2"><b>Name:</b> {item.productName}</div>
          <div className="mb-2"><b>Barcode:</b> {item.barcode}</div>
          <div className="mb-2"><b>Price:</b> {item.productPrice} VND</div>
          <div className="mb-2"><b>Sale Price:</b> {item.productPriceSale} VND</div>
          <div className="mb-2"><b>Quantity:</b> {item.quantityAvailable}</div>
          <div className="mb-2"><b>Box Quantity:</b> {item.boxQuantity}</div>
          {item.images && item.images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {item.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  width={200}
                  height={200}
                  alt="Product image"
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
      ))}</div>
      <Button onClick={handleUpdateProductQuantity} className="mt-4">
        Cập nhật số lượng trong kho
      </Button>
    </div>
  );
}