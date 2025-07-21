"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableCaption } from "@/components/ui/table/table";
import { Pagination } from "@/components/ui/pagination/pagination";
import Image from "next/image";
import { fetchAllDiseases } from "@/lib/disease-apis";

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
  const [nameFilter, setNameFilter] = useState("");
  const [pathogenFilter, setPathogenFilter] = useState("");
  const [currentPage] = useState(1);
  const [diseasesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchDiseases = async () => {
      try {
        const data = await fetchAllDiseases();
        setDiseases(data);
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
      </div>
      <Table className="w-full">
        <TableCaption>Danh sách các bệnh lúa đã nhập</TableCaption>
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">ID</TableCell>
            <TableCell>Tên bệnh</TableCell>
            <TableCell>Tác nhân</TableCell>
            <TableCell>Hình ảnh</TableCell>
            <TableCell>Người nhập</TableCell>
            <TableCell>Ngày tạo</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6}>Đang tải...</TableCell></TableRow>
          ) : paginatedDiseases.length === 0 ? (
            <TableRow><TableCell colSpan={6}>Không có bệnh nào</TableCell></TableRow>
          ) : (
            paginatedDiseases.map((disease) => (
              <TableRow key={disease.diseaseID}>
                <TableCell className="font-semibold">{disease.diseaseID}</TableCell>
                <TableCell className="font-semibold">{disease.diseaseName}</TableCell>
                <TableCell>{disease.ricePathogen}</TableCell>
                
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {disease.images && disease.images.length > 0 ? (
                      disease.images.map((img, idx) => (
                        <div key={idx} className="relative w-12 h-12">
                          <Image src={img} alt="disease" layout="fill" className="rounded border object-cover" />
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">Không có ảnh</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{disease.userID}</TableCell>
                <TableCell>{new Date(disease.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-between items-center">
        <Pagination className="w-full flex justify-start">
          {/* Pagination controls here if needed */}
        </Pagination>
      </div>
    </div>
  );
}
