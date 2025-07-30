"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { baseUrl } from "@/lib/others/base-url";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination/pagination";
import { fetchAllContacts } from "@/lib/contact-apis";

interface Contact {
  contactID: number;
  userID: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refresh] = useState(0);

  useEffect(() => {
    const fetchContactsData = async () => {
      try {
        const data = await fetchAllContacts();
        setContacts(data);
      }
      catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    }
    fetchContactsData();
  }, [refresh]);



  // Sorting
  const sortedContacts = [...contacts].sort((a, b) => {
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    return 0;
  });

  // Filtering
  const filteredContacts = sortedContacts.filter(contact => {
    if (search && !contact.subject.toLowerCase().includes(search.toLowerCase()) && !contact.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const paginatedContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Liên Hệ Người Dùng</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block font-medium mb-1">Tìm kiếm</label>
          <Input
            placeholder="Tìm nội dung liên hệ"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Sắp xếp</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Số liên hệ/trang</label>
          <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
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
      <ul className="space-y-6">
        {paginatedContacts.map(contact => (
          <li key={contact.contactID} className="relative border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
            <div className={`absolute w-3 h-3 ${contact.status === 'open' ? 'bg-green-500' : contact.status === 'in-progress' ? 'bg-blue-500' : 'bg-red-500'}  top-4 right-4 rounded-full`}></div>
            <div className="flex items-center gap-3 mb-2">
              {/* You can add a user avatar or icon here if available */}
              <div>
                <div className="font-semibold text-lg">{contact.subject}</div>
                <div className="text-xs text-gray-500">ID: {contact.contactID} | Người dùng: {contact.userID}</div>
              </div>
            </div>
            <div className="text-sm whitespace-pre-line break-words">{contact.message}</div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2 items-center">
              <span>Trạng thái: </span>
              <Select
                value={contact.status}
                onValueChange={async v => {
                  await fetch(`${baseUrl}/api/contact/${contact.contactID}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: v }),
                  });
                  setContacts(prev => prev.map(c => c.contactID === contact.contactID ? { ...c, status: v } : c));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Mở</SelectItem>
                  <SelectItem value="in-progress">Đang xử lý</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
              <span>Gửi lúc: {contact.createdAt ? contact.createdAt.slice(0, 16).replace('T', ' ') : ""}</span>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Pagination className="flex justify-start mt-8">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  href="#"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              aria-disabled={page === totalPages}
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
