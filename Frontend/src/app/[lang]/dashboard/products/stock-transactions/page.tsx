"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup } from "@/components/ui/select/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination/pagination";

interface Product {
  productID: number;
  productName: string;
}

interface InventoryTransaction {
  transactionID: number;
  productID: number;
  quantityChange: number;
  transactionType: string;
  note?: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/inventory-transaction`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(tran => {
    const matchesSearch = search === "" || (tran.product?.productName || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || tran.transactionType === typeFilter;
    return matchesSearch && matchesType;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Lịch sử giao dịch kho</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          type="text"
          placeholder="Tìm theo tên sản phẩm"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-56"
        />
        <Select value={typeFilter} onValueChange={val => { setTypeFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-44" aria-label="Loại giao dịch">
            <SelectValue placeholder="Tất cả loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <option value="">Tất cả</option>
              <option value="import">Nhập kho</option>
              <option value="export">Xuất kho</option>
              <option value="adjustment">Điều chỉnh</option>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm">Số giao dịch/trang:</span>
          <Select value={String(perPage)} onValueChange={val => { setPerPage(Number(val)); setCurrentPage(1); }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Loại giao dịch</TableHead>
            <TableHead>Thay đổi SL</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead>Người thực hiện</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
          ) : paginated.length === 0 ? (
            <TableRow><TableCell colSpan={7}>Không có giao dịch nào.</TableCell></TableRow>
          ) : paginated.map(tran => (
            <TableRow key={tran.transactionID}>
              <TableCell>{tran.transactionID}</TableCell>
              <TableCell>{tran.product?.productName || tran.productID}</TableCell>
              <TableCell>{tran.transactionType}</TableCell>
              <TableCell className={tran.quantityChange > 0 ? "text-green-600" : tran.quantityChange < 0 ? "text-red-600" : ""}>{tran.quantityChange > 0 ? "+" : ""}{tran.quantityChange}</TableCell>
              <TableCell>{tran.note || ""}</TableCell>
              <TableCell>{tran.performedBy}</TableCell>
              <TableCell>{new Date(tran.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-between items-center">
        <Pagination className="w-full flex justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} aria-disabled={currentPage === 1} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink isActive={currentPage === idx + 1} onClick={() => setCurrentPage(idx + 1)}>
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} aria-disabled={currentPage === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
