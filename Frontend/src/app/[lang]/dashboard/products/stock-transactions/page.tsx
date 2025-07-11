"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination/pagination";
import { baseUrl } from "@/lib/base-url";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { EyeIcon } from "lucide-react";
import vector from '@public/vectors/cart+total+shap+bot.png';
import vectortop from '@public/vectors/cart+total+shap+top.png';
import Image from "next/image";
import { Button } from "@/components/ui/button/button";
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
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="import">Nhập kho</SelectItem>
              <SelectItem value="export">Xuất kho</SelectItem>
              <SelectItem value="update">Điều chỉnh</SelectItem>
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
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
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
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={8}>Đang tải...</TableCell></TableRow>
          ) : paginated.length === 0 ? (
            <TableRow><TableCell colSpan={8}>Không có giao dịch nào.</TableCell></TableRow>
          ) : paginated.map(tran => (
            <TableRow key={tran.transactionID}>
              <TableCell>{tran.transactionID}</TableCell>
              <TableCell>{tran.product?.productName || tran.productID}</TableCell>
              <TableCell>{tran.transactionType}</TableCell>
              <TableCell className={tran.quantityChange > 0 ? "text-green-600" : tran.quantityChange < 0 ? "text-red-600" : ""}>{tran.quantityChange > 0 ? "+" : ""}{tran.quantityChange}</TableCell>
              <TableCell className="w-[200px] truncate">{tran.note || ""}</TableCell>
              <TableCell>{tran.performedBy}</TableCell>
              <TableCell>{new Date(tran.createdAt).toLocaleString()}</TableCell>
              <TableCell className="flex justify-center items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-2 rounded hover:bg-gray-100 hover:cursor-pointer" title="Xem chi tiết">
                      <EyeIcon className="w-5 h-5 text-blue-600" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="overflow-hidden rounded-none bg-white py-8">
                    <Image src={vector} width={400} height={400} alt="Vector" className="absolute w-full h-auto object-cover top-0 left-0" />
                    <Image src={vectortop} width={400} height={400} alt="Vector" className="absolute w-full h-auto object-cover bottom-0 left-0" />
                    <DialogHeader>
                      <DialogTitle>Chi Tiết Giao Dịch #{tran.transactionID}</DialogTitle>
                      <DialogDescription>
                        <div className="flex flex-col gap-2 mt-2 text-base">
                          <div><span className="font-semibold">Mã giao dịch:</span> {tran.transactionID}</div>
                          <div><span className="font-semibold">Mã sản phẩm:</span> {tran.product?.productName || tran.productID}</div>
                          <div><span className="font-semibold">Loại giao dịch:</span> {tran.transactionType === 'import' ? 'Nhập' : tran.transactionType === 'export' ? 'Xuất' : 'Cập nhật'}</div>
                          <div><span className="font-semibold">Thay đổi số lượng:</span> {(tran.quantityChange > 0 ? "+" : "") + tran.quantityChange}</div>
                          <div><span className="font-semibold">Ghi chú:</span> {tran.note || ""}</div>
                          <div><span className="font-semibold">Người thực hiện:</span> {tran.performedBy}</div>
                          <div><span className="font-semibold">Ngày tạo:</span> {new Date(tran.createdAt).toLocaleString()}</div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default" className="px-4 py-2 rounded hover:cursor-pointer">Đóng</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
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
