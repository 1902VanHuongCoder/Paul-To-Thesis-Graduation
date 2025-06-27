"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import Image from "next/image";
import { baseUrl } from "@/lib/base-url";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = useCallback((err: any, result: any) => {
    if (result && result.text) {
      const barcode = result.text; 
      alert(`Scanned barcode: ${barcode}`);
      if (barcode && (/^88+\d{11}$/).test(barcode)) { // This is box barcode (1 box not 1 product), so we're going to implement related operations
        alert(`> 12`);
        // If it have already showed on the screen, increase value of property boxBarcode (product item from products array)
        setBoxbarCode(barcode);

        // Check if the boxBarcode already exists in the products array
        const existedInProductsArray = products.find(item => item.boxBarcode === barcode);
        // If it have already showed on the screen, increase value of property boxBarcode (product item from products array)
        if (existedInProductsArray) {
          alert(`Box barcode already exists in products array`);
          const updatedProducts = products.map(item => {
            if (item.boxBarcode === barcode) {
              return { ...item, boxQuantity: item.boxQuantity + 1} // Increase the boxBarcode value
            } else {
              return item;
            }
          });
          setProducts(updatedProducts); 
          setScanning(false);
        } else { // If it haven't displayed on UI, fetch it from server using boxBarcode
          setScanning(false);
          alert(`Fetch product with boxBarcode = ${result.text}`);
          fetchProduct(result.text); // ??
        }
        // If it haven't displayed on UI, fetch it from server using barCode (because each product always has an unique barcode) 
      } else if (barcode && (/^83+\d{10}$/).test(barcode.slice(0, 12))) {
        alert(`< 12`);

        setBarcode(barcode); // Set the barcode state 
        // Check if the barcode already exists in the products array
        const existed = products.find(item => item.barcode === barcode.slice(0, 12)); 

        // If it have already showed on the screen, increase value of property uantityAvailable (product item from products array)
        if (existed && products.length > 0) {
          alert(" + 1 quantity"); 
          const updatedProducts = products.map(item => {
            if (item.barcode === barcode.slice(0, 12)) {
              return { ...item, quantityAvailable: item.quantityAvailable + 1 }
            } else {
              return item;
            }
          });
          setProducts(updatedProducts);
          setScanning(false);

        // If it haven't displayed on UI, fetch it from server using barCode scanned 
        } else {
          alert(`Fetch product hihi`);
          setScanning(false);
          fetchProduct(result.text);
        }
      } else {
        alert("Invalid barcode format. Please scan a valid product or box barcode.");
      }
    }
  }, [products]);

  const fetchProduct = async (barcodeValue: string) => {
    console.log("Fetching product with barcode:", barcodeValue);
    setLoading(true);
    setError("");
    try {
      let res;
     
      if ((/^88+\d{11}$/).test(barcode)) { // This is box barcode, so we need to fetch product using boxBarcode (for example, 1 box = 10 products)
        res = await fetch(
          `${baseUrl}/api/product/box-barcode/${barcodeValue.slice(0, 13)}`
        );
      } else { // This is product barcode, so we need to fetch product using barcode
        alert("Fetch product using barcode");
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  console.log("Products:", products);

  const handleRescan = () => {
    setBarcode("");
    // setProducts(null);
    setError("");
    setScanning(true);
  };

  // Update product's quantityAvailable in the stock 
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

      const data = await res.json();
      console.log("Update successful:", data);
      setProducts([]); // Clear products after updating
    } catch (err) {
      console.error(err);
      setError("Failed to update product quantities");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-8xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Import Product Using Barcode</h1>
      {scanning ? (
        <div>
          <p className="mb-2">Scan a product barcode using your webcam:</p>
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
            <p className="mb-2">Scanned Barcode: <span className="font-mono text-lg">{boxBarcode && boxBarcode}</span></p>
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
          <div className="mb-2"><b>Quantity:</b> {item.boxQuantity}</div>
          {/* <div className="mb-2"><b>Description:</b> {item.description}</div> */}
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
      <button onClick={handleUpdateProductQuantity}>Cap nhat so luong trong kho</button>
    </div>
  );
}
