"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination/pagination";
import { Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog/dialog";
import toast from "react-hot-toast";
import { deleteAccount, getAllUsers, updateUserProfileStatus } from "@/lib/user-apis";
import formatDate from "@/lib/others/format-date";

interface User {
  userID: string;
  username: string;
  email: string;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  // const {lang} = useDictionary();
  const [users, setUsers] = React.useState<User[]>([])
  const [usernameFilter, setUsernameFilter] = React.useState("")
  const [userIDFilter, setUserIDFilter] = React.useState("")
  const [activeOnly, setActiveOnly] = React.useState(false)
  const [roleFilter, setRoleFilter] = React.useState("");
  const [loading, setLoading] = React.useState(true)
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [recordsPerPage, setRecordsPerPage] = React.useState(10);

  React.useEffect(() => {
    setLoading(true)
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesUsername = user.username
      .toLowerCase()
      .includes(usernameFilter.toLowerCase())
    const matchesUserID = user.userID
      .toLowerCase()
      .includes(userIDFilter.toLowerCase())
    const matchesActive = !activeOnly || user.isActive
    const matchesRole = roleFilter === "all" || !roleFilter || user.role === roleFilter
    return matchesUsername && matchesUserID && matchesActive && matchesRole
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleToggleStatus = async (user: User) => {
    setUpdatingUserId(user.userID);
    try {
      const res = await updateUserProfileStatus(user.userID, user.isActive);
      if (res) {
        setUsers((prev) =>
          prev.map((u) =>
            u.userID === user.userID ? { ...u, isActive: !u.isActive } : u
          )
        );
        toast.success(`Cập nhật trạng thái tài khoản ${user.username} thành công.`);
      } else {
        toast.error("Cập nhật trạng thái tài khoản thất bại.");
      }
    } catch (err) {
      toast.error("Cập nhật trạng thái tài khoản thất bại.");
      console.error("Error updating user status:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userID: string) => {
    try {
      const {status, message}  = await deleteAccount(userID);
      if (status === 200) {
        setUsers((prev) => prev.filter((u) => u.userID !== userID));
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (err) {
      alert("Xóa tài khoản thất bại.");
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Danh Sách Tài Khoản Người Dùng</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Tìm kiếm bằng username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Tìm kiếm bằng UserID..."
          value={userIDFilter}
          onChange={(e) => setUserIDFilter(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 border-1 px-4 py-1.5 rounded-md">
          <Switch
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
            id="active-switch"
          />
          <span>Chỉ tài khoản còn hoạt động</span>
        </label>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Vai trò</SelectLabel>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="cus">Khách hàng</SelectItem>
              <SelectItem value="sta">Nhân viên</SelectItem>
              <SelectItem value="adm">Quản trị viên</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label htmlFor="records-per-page" className="text-sm">Hiển thị</label>
          <Select value={recordsPerPage.toString()} onValueChange={v => { setRecordsPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger id="records-per-page" className="w-20">
              <SelectValue placeholder="Số dòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">dòng/trang</span>
        </div>
      </div>
      <Table>
        <TableCaption>{loading ? "Loading users..." : filteredUsers.length === 0 ? "No users found." : null}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Mã người dùng</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Địa chỉ email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.userID}>
              <TableCell>{user.userID}</TableCell>
              <TableCell className="max-w-[120px] truncate">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === "adm" ? "Quản trị viên" : user.role === "sta" ? "Nhân viên" : "Khách hàng"}
              </TableCell>
              <TableCell>
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${user.isActive ? "bg-green-700 text-white hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                  disabled={updatingUserId === user.userID}
                  onClick={() => handleToggleStatus(user)}
                  title={user.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                >
                  {updatingUserId === user.userID ? "..." : user.isActive ? "Đang hoạt động" : "Đã khóa"}
                </button>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="flex justify-center items-center">
                <Dialog open={deleteDialogOpen && userToDelete?.userID === user.userID} onOpenChange={open => {
                  setDeleteDialogOpen(open);
                  if (!open) setUserToDelete(null);
                }}>
                  <DialogTrigger asChild>
                    <button
                      className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center justify-center hover:cursor-pointer"
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                      title="Xóa tài khoản"
                      aria-label="Xóa tài khoản"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                      <DialogDescription>
                        Bạn có chắc chắn muốn xóa tài khoản <b>{user.username}</b> không? Xác nhận để tiến hành xóa tài khoản.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer">Hủy</button>
                      </DialogClose>
                      <button
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        onClick={async () => {
                          await handleDeleteUser(user.userID);
                          setDeleteDialogOpen(false);
                          setUserToDelete(null);
                        }}
                      >
                        Xóa
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex">
          <Pagination className="flex justify-start">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === idx + 1}
                    onClick={e => { e.preventDefault(); setCurrentPage(idx + 1); }}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
