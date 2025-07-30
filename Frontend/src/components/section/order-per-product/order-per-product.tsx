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
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
        <tr className="bg-gradient-to-r from-green-700 to-green-900 text-white">
          <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">ID</th>
          <th className="py-3 px-4 text-left font-semibold">Tên sản phẩm</th>
          <th className="py-3 px-4 text-left font-semibold">Giá</th>
          <th className="py-3 px-4 text-left font-semibold">Tồn kho</th>
          <th className="py-3 px-4 text-left font-semibold rounded-tr-lg">Số đơn hàng</th>
        </tr>
          </thead>
          <tbody>
        {products && products.length > 0 ? (
          products.map((p) => (
            <tr
          key={p.productID}
          className="hover:bg-green-50 transition"
            >
          <td className="py-2 px-4 font-mono text-gray-700">{p.productID}</td>
          <td className="py-2 px-4 font-semibold text-gray-900">{p.productName}</td>
          <td className="py-2 px-4 text-green-700 font-bold">{p.productPrice?.toLocaleString()}₫</td>
          <td className={`py-2 px-4 ${p.quantityAvailable < 5 ? "bg-red-100 text-red-700 font-bold rounded" : "text-gray-700"}`}>
            {p.quantityAvailable}
          </td>
          <td className={`py-2 px-4 ${p.orderCount > 10 ? "bg-green-100 text-green-800 font-bold rounded" : "text-gray-700"}`}>
            {p.orderCount}
          </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="py-4 px-4 text-center text-gray-400">
          Không có sản phẩm nào.
            </td>
          </tr>
        )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer bg-gradient-to-r from-green-700 to-green-900 text-white rounded-full shadow-lg hover:from-green-800 hover:to-green-950 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleExportExcel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#21A366" />
            <path d="M7 8l2.5 4L7 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 8h4M13 12h4M13 16h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Xuất Excel danh sách sản phẩm
        </button>
      </div>
    </section>
  );
};

export default OrderPerProductSection;

