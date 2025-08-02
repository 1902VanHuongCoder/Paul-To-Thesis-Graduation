"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteDisease } from "@/lib/disease-apis";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from "@/components/ui/pagination/pagination";
import Image from "next/image";
import { fetchAllDiseases } from "@/lib/disease-apis";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select/select";

interface Disease {
  diseaseID: number;
  diseaseName: string;
  ricePathogen: string;
  symptoms: string;
  images: string[];
  userID: string;
  createdAt: string;
  updatedAt: string;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [pathogenFilter, setPathogenFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [diseasesPerPage, setDiseasesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchDiseases = async () => {
      try {
        const data = await fetchAllDiseases();
        setDiseases(data);
        console.log("Fetched diseases:", data);
      } catch (error) {
        console.error("Error fetching diseases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, []);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesName = disease.diseaseName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesPathogen = !pathogenFilter || disease.ricePathogen.toLowerCase().includes(pathogenFilter.toLowerCase());
    return matchesName && matchesPathogen;
  });

  // Pagination logic
  const totalDiseases = filteredDiseases.length;
  const totalPages = Math.ceil(totalDiseases / diseasesPerPage);
  const paginatedDiseases = filteredDiseases.slice(
    (currentPage - 1) * diseasesPerPage,
    currentPage * diseasesPerPage
  );

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Danh Sách Bệnh Lúa</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          type="text"
          placeholder="Lọc theo tên bệnh"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          className="w-56"
        />
        <Input
          type="text"
          placeholder="Lọc theo tác nhân gây bệnh"
          value={pathogenFilter}
          onChange={e => setPathogenFilter(e.target.value)}
          className="w-56"
        />
        <div className="ml-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Số bệnh/trang:</span>
          <Select
            defaultValue="10"
            value={diseasesPerPage.toString()}
            onValueChange={value => {
              setDiseasesPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="border rounded px-2 py-1">
              {diseasesPerPage}
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
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">ID</TableCell>
            <TableCell>Tên bệnh</TableCell>
            <TableCell>Tác nhân</TableCell>
            <TableCell>Hình ảnh</TableCell>
            <TableCell>Người nhập</TableCell>
            <TableCell>Ngày tạo</TableCell>
            <TableCell className="text-center">Hành động</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
          ) : paginatedDiseases.length === 0 ? (
            <TableRow><TableCell colSpan={7}>Không có bệnh nào</TableCell></TableRow>
          ) : (
            paginatedDiseases.map((disease) => (
              <TableRow key={disease.diseaseID}>
                <TableCell className="font-semibold">{disease.diseaseID}</TableCell>
                <TableCell className="font-semibold">{disease.diseaseName}</TableCell>
                <TableCell>{disease.ricePathogen}</TableCell>

                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative w-12 h-12">
                      <Image src={disease.images[0]} alt="disease" layout="fill" className="rounded border object-cover" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{disease.userID}</TableCell>
                <TableCell>{new Date(disease.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2 w-full justify-center">
                    <Link
                      href={`/vi/dashboard/diseases/edit-disease?diseaseID=${disease.diseaseID}`}
                      className="p-1 rounded hover:bg-primary/10"
                      title="Edit disease"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Link>
                    <button
                      className="p-1 rounded hover:bg-red-100"
                      title="Delete disease"
                      onClick={() => {
                        setDeleteID(disease.diseaseID);
                        setShowConfirm(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bệnh</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa bệnh này không?</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:cursor-pointer hover:bg-gray-200">Hủy</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteID === null) return;
                try {
                  const res = await deleteDisease(deleteID);
                  if (res.status === 200) {
                    toast.success("Đã xóa bệnh thành công!");
                    setDiseases(prev => prev.filter(d => d.diseaseID !== deleteID));
                  } else {
                    toast.error(res.message || "Không xóa được bệnh.");
                  }
                } catch (error) {
                  toast.error("Xóa bệnh thất bại. Vui lòng thử lại.");
                  console.error("Error deleting disease:", error);
                }
                setShowConfirm(false);
                setDeleteID(null);
              }}
              className="hover:cursor-pointer "
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-6 flex justify-between items-center">
        <Pagination className="w-full flex justify-start">
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
      </div>
    </div>
  );
}
