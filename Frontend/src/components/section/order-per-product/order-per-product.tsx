import { fetchProductsOrderCount } from "@/lib/product-apis";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Product {
  productID: number;
  productName: string;
  productPrice: number;
  quantityAvailable: number;
  orderCount: number;
  category?: { categoryName: string };
  subcategory?: { subcategoryName: string };
  origin?: { originName: string };
  // Add more fields as needed
}

const OrderPerProductSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetchProductsOrderCount();
        // Accept both res.data and res depending on API client
        const data = Array.isArray(res) ? res : res.data;
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      products.map((p) => ({
        ID: p.productID,
        "Tên sản phẩm": p.productName,
        "Giá": `${p.productPrice?.toLocaleString()}₫`,
        "Tồn kho": p.quantityAvailable,
        "Số đơn hàng": p.orderCount,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "danh-sach-san-pham.xlsx");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        <div>ID</div>
        <div>Tên sản phẩm</div>
        <div>Giá</div>
        <div>Tồn kho</div>
        <div>Số đơn hàng</div>
      </div>
      {products &&
        products.length > 0 &&
        products.map((p) => (
          <div
            key={p.productID}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "4px 0",
            }}
          >
            <div>{p.productID}</div>
            <div>{p.productName}</div>
            <div>{p.productPrice?.toLocaleString()}₫</div>
            <div>{p.quantityAvailable}</div>
            <div>{p.orderCount}</div>
          </div>
        ))}
      <div className="mt-4 flex justify-end">
        <button
          className="bg-primary px-2 py-2 text-white rounded-md mb-2 cursor-pointer"
          onClick={handleExportExcel}
        >
          Xuất Excel danh sách sản phẩm
        </button>
      </div>
    </section>
  );
};

export default OrderPerProductSection;

