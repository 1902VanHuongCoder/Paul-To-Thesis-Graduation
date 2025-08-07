"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination/pagination";
import Image from "next/image";
import darkLogo from "@public/images/dark+logo.png";
import toast from "react-hot-toast";
import { fetchAllOrders, updateOrderStatus, bulkUpdateOrderStatus } from "@/lib/order-apis";
import formatDate from "@/lib/others/format-date";

export interface DeliveryMethod {
  deliveryID: number;
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  speed?: string;
  isActive: boolean;
  isDefault: boolean;
}

type OrderProduct = {
  quantity: number;
  price: number;
}

interface Product {
  productID: number;
  productName: string;
  images?: string[];
  OrderProduct?: OrderProduct;
}

interface Order {
  orderID: string;
  userID: string;
  totalPayment: number;
  totalQuantity: number;
  note?: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  deliveryID: number;
  cartID: number;
  discount?: number;
  deliveryCost?: number;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
  delivery: DeliveryMethod;
}

function formatVND(value: number) {
  return value?.toLocaleString("vi-VN");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("createdAt-desc");
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>(""); // new: filter by day
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [refresh] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userName, setUserName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const data = await fetchAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
    fetchOrdersData();
  }, [refresh]);

  const handleStatusChange = async (newStatus: string, orderID: string) => {
    if (newStatus === "pending") {
      toast.error("Không thể đặt trạng thái là 'Chờ xác nhận'.");
      return;
    }
    const order = orders.find(o => o.orderID === orderID);
    if (!order) {
      toast.error("Đơn hàng không tồn tại.");
      return;
    }
    const orderUpdated = orders.map(o => {
      if (o.orderID === orderID) {
        return { ...o, orderStatus: newStatus };
      }
      return o;
    });
    setOrders(orderUpdated);
    const res = await updateOrderStatus(newStatus, order);
    if (res) {
      toast.success("Cập nhật thành công trạng thái đơn hàng");
    } else {
      toast.error("Cập nhật trạng thái đơn hàng thất bại.");
    }
  };

  // Filtering and sorting
  const filteredOrders = orders
    .filter(order => {
      if (status !== "all" && order.orderStatus !== status) return false;
      if (userName && !order.fullName.toLowerCase().includes(userName.toLowerCase())) return false;
      if (userPhone && !order.phone.includes(userPhone)) return false;
      if (day) {
        // Compare only the date part (YYYY-MM-DD)
        const orderDay = new Date(order.createdAt).toISOString().slice(0, 10);
        if (orderDay !== day) return false;
      } else if (month) {
        const orderMonth = new Date(order.createdAt).toISOString().slice(0, 7); // 'YYYY-MM'
        if (orderMonth !== month) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "createdAt-desc") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "createdAt-asc") return a.createdAt.localeCompare(b.createdAt);
      return 0;
    });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Bulk select helpers
  const allFilteredOrderIDs = filteredOrders.map(o => o.orderID);
  const isAllSelected = selectedOrderIDs.length === allFilteredOrderIDs.length && allFilteredOrderIDs.length > 0;
  const isIndeterminate = selectedOrderIDs.length > 0 && selectedOrderIDs.length < allFilteredOrderIDs.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIDs([]);
    } else {
      setSelectedOrderIDs(allFilteredOrderIDs);
    }
  };

  const handleSelectOrder = (orderID: string) => {
    setSelectedOrderIDs(prev => prev.includes(orderID) ? prev.filter(id => id !== orderID) : [...prev, orderID]);
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus) {
      toast.error("Vui lòng chọn trạng thái muốn cập nhật.");
      return;
    }
    if (selectedOrderIDs.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng.");
      return;
    }
    setBulkLoading(true);
    try {
      // const updates = selectedOrderIDs.map(orderID => ({ orderID, status: bulkStatus }));
      console.log("Bulk update data:", selectedOrderIDs);
      await bulkUpdateOrderStatus(selectedOrderIDs, bulkStatus);
      setOrders(prev => prev.map(o => selectedOrderIDs.includes(o.orderID) ? { ...o, orderStatus: bulkStatus } : o));
      toast.success("Cập nhật trạng thái hàng loạt thành công!");
      setSelectedOrderIDs([]);
      setBulkStatus("");
    } catch (err) {
      toast.error("Cập nhật trạng thái hàng loạt thất bại.");
      console.error("Bulk update error:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [status, sort, pageSize, month]);

  // Status color mapping
  const statusColor = {
    pending: 'bg-yellow-500 text-yellow-800 border-yellow-300',
    accepted: 'bg-blue-500 text-blue-800 border-blue-300',
    shipping: 'bg-purple-500 text-purple-800 border-purple-300',
    completed: 'bg-green-500 text-green-800 border-green-300',
    cancelled: 'bg-red-500 text-red-800 border-red-300',
    default: 'bg-gray-500 text-gray-800 border-gray-300',
    boomed: 'bg-orange-500 text-orange-800 border-orange-300',
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng</h1>
      <div className="flex flex-wrap items-end mb-6 gap-4">
      {/* Bulk update status UI */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={el => { if (el) el.indeterminate = isIndeterminate; }}
          onChange={handleSelectAll}
        />
        <span className="font-medium">Chọn tất cả ({filteredOrders.length})</span>
        <Select value={bulkStatus} onValueChange={setBulkStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn trạng thái cập nhật" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="accepted">Đã xác nhận</SelectItem>
            <SelectItem value="shipping">Đang giao</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="default"
          onClick={handleBulkUpdate}
          disabled={bulkLoading || !bulkStatus || selectedOrderIDs.length === 0}
        >
          {bulkLoading ? "Đang cập nhật..." : "Cập nhật trạng thái đã chọn"}
        </Button>
      </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-medium mb-1">Tìm kiếm</label>
            <Input
              type="text"
              placeholder="Tìm theo tên khách hàng"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-64"
            />
          </div>
          {/* Filter by phone number */}
          <div>
            <label className="block font-medium mb-1">Số điện thoại</label>
            <Input
              type="text"
              placeholder="Tìm theo số điện thoại"
              value={userPhone}
              onChange={e => setUserPhone(e.target.value)}
              className="w-64"
            />
          </div>
          {/*  */}
          <div>
            <label className="block font-medium mb-1">Ngày</label>
            <Input
              type="date"
              value={day}
              onChange={e => setDay(e.target.value)}
              className="w-48 inline"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Tháng</label>
            <Input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-48 inline"
              disabled={!!day}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Trạng thái</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="accepted">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">Sắp xếp</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
                <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="block font-medium mb-1">Số dòng/trang</label>
            <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
              <SelectTrigger className="w-28">
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
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map(order => (
            <TableRow key={order.orderID} className={`${order.orderStatus === "boomed" ? "bg-orange-100" : ""}`}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedOrderIDs.includes(order.orderID)}
                  onChange={() => handleSelectOrder(order.orderID)}
                  disabled={order.orderStatus === "cancelled"}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </TableCell>
              <TableCell>{order.orderID}</TableCell>
              <TableCell>{order.fullName}</TableCell>
              <TableCell>{order.phone}</TableCell>
              <TableCell className="max-w-[60px] truncate">{order.address}</TableCell>
              <TableCell>{order.paymentMethod === 'cash' ? 'Tiền mặt' : order.paymentMethod}</TableCell>
              <TableCell className="relative">
                <div className={`absolute w-[10px] h-[10px] top-1/2 left-1 -translate-y-1/2 z-10 shadow-md rounded-full ${statusColor[order.orderStatus as keyof typeof statusColor]} rounded border text-xs font-semibold transition-colors duration-200`}>
                </div>
                <Select
                  value={order.orderStatus}
                  onValueChange={v => handleStatusChange(v, order.orderID)}
                  disabled={order.orderStatus === "cancelled"}
                >
                  <SelectTrigger className="w-30 mt-1 pl-4 focus-visible:ring-0 outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" disabled={order.orderStatus === "completed" || order.orderStatus === "accepted"}>Chờ xác nhận</SelectItem>
                    <SelectItem value="accepted" >Đã xác nhận</SelectItem>
                    <SelectItem value="shipping">Đang giao</SelectItem>
                    <SelectItem value="completed" >Hoàn thành</SelectItem>
                    <SelectItem value="cancelled" disabled={true}>Đã hủy</SelectItem>
                    <SelectItem value="boomed" disabled={order.orderStatus === "boomed"}>Boom hàng</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.totalPayment?.toLocaleString()}</TableCell>
              <TableCell>{order.totalQuantity}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>Xem</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div >
        <Pagination className="flex justify-start mt-6">
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
      {/* Order Detail Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={open => { if (!open) setViewOrder(null); }}>
        {viewOrder && (
          <DialogContent
            className="bg-white min-w-[880px] h-fit max-h-[90vh] overflow-x-hidden overflow-y-srcroll"
          // onInteractOutside={e => e.preventDefault()}
          ><Image
              src={darkLogo}
              alt="Logo"
              width={100}
              height={100}
              className="w-auto h-[50px] print:h-[100px] print:w-auto"
              style={{ printColorAdjust: "exact" }}
            />
            <div id="print-order-area">

              <div className="text-gray-300 bg-primary text-7xl absolute opacity-5 z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] -rotate-25 text-center select-none pointer-events-none">
                NFEAM HOUSE
              </div>
              <p className="py-8 text-center text-3xl font-bold">THÔNG TIN ĐƠN HÀNG</p>
              <div className="space-y-4 text-md w-full">
                <div className="grid grid-cols-2 items-center">
                  <div>
                    <span>Mã đơn hàng: </span>
                    <span className="font-semibold">{viewOrder.orderID}</span>
                  </div>
                  <div>
                    <span>Ngày đặt: </span>
                    <span className="font-semibold">{new Date(viewOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className={`absolute right-5 top-5 flex items-center gap-x-2 z-100 px-4 py-2 shadow-sm rounded-md border bg-white`}>
                  <span
                    className={`w-[10px] h-[10px] rounded-full animate-ping ${viewOrder.orderStatus === 'pending'
                      ? 'bg-yellow-500'
                      : viewOrder.orderStatus === 'accepted'
                        ? 'bg-blue-500'
                        : viewOrder.orderStatus === 'shipping'
                          ? 'bg-purple-500'
                          : viewOrder.orderStatus === 'completed'
                            ? 'bg-green-500'
                            : viewOrder.orderStatus === 'cancelled'
                              ? 'bg-red-500'
                              : viewOrder.orderStatus === 'boomed'
                                ? 'bg-orange-500'
                              : 'bg-gray-400'
                      }`}
                  ></span>
                  <span className="font-semibold text-md">Trạng thái:</span>{" "}
                  <span>
                    {viewOrder.orderStatus === "pending"
                      ? "Đang xử lý"
                      : viewOrder.orderStatus === "accepted"
                        ? "Đã xác nhận"
                        : viewOrder.orderStatus === "shipping"
                          ? "Đang giao hàng"
                          : viewOrder.orderStatus === "completed"
                            ? "Hoàn thành"
                            : viewOrder.orderStatus === "cancelled"
                              ? "Đã hủy"
                              : viewOrder.orderStatus === "boomed"
                                ? "Boom hàng"
                              : "Trạng thái không xác định"}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <div>
                    <span>Khách hàng: </span>
                    <span className="font-semibold">{viewOrder.fullName}</span>
                  </div>
                  <div>
                    <span>Số điện thoại: </span>
                    <span className="font-semibold">{viewOrder.phone}</span>
                  </div>
                </div>
                <div>
                  <span>Địa chỉ:</span>
                  <span className="font-semibold"> {viewOrder.address}</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-2 mt-4">Sản phẩm</h2>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Tên sản phẩm</th>
                    <th className="p-2 text-left">Hình ảnh</th>
                    <th className="p-2 text-left">Đơn giá</th>
                    <th className="p-2 text-left">Số lượng</th>
                    <th className="p-2 text-left">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewOrder.products || []).map((product) => (
                    <tr key={product.productID} className="border-b">
                      <td className="p-2">{product.productName}</td>
                      <td className="p-2">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            width={200}
                            height={200}
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-16 h-16 object-cover rounded print:w-[100px] print:h-[100px]"
                            style={{ printColorAdjust: "exact" }}
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="p-2">{formatVND(product.OrderProduct?.price || 0)} VND</td>
                      <td className="p-2">{product.OrderProduct?.quantity}</td>
                      <td className="p-2">
                        {product && product.OrderProduct
                          ? formatVND(product.OrderProduct.price * product.OrderProduct.quantity)
                          : 0}{" "}
                        VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right font-bold text-md flex flex-col items-start gap-2">
                <div className="space-x-2">
                  <span className="font-normal">Phí vận chuyển:</span>
                  <span> {formatVND(viewOrder.deliveryCost || 0)} VND</span>
                </div>
                <div className="space-x-2">
                  <span className="font-normal">
                    Phương thức vận chuyển - {viewOrder.delivery?.name || ""}:
                  </span>
                  <span>{formatVND(viewOrder.delivery?.basePrice || 0)} VND</span>
                </div>
                <div className="space-x-2">
                  <span className="font-normal">Giảm giá:</span>
                  <span>{formatVND(viewOrder.discount || 0)} VND</span>
                </div>
                <div className="space-x-2 text-2xl">
                  <span className="font-normal">Tổng thanh toán:</span>
                  <span className="text-3xl text-primary">
                    {formatVND(viewOrder.totalPayment)} VND
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <button
                className="px-6 py-2 rounded bg-primary text-white hover:bg-primary/80 font-semibold"
                onClick={() => {
                  const printContent = document.getElementById('print-order-area');
                  if (printContent) {
                    const printWindow = window.open('', '', 'width=900,height=900');
                    printWindow?.document.write(`
                      <html>
                        <head>
                          <title>Order PDF</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 24px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                            th, td { border: 1px solid #ddd; padding: 8px; }
                            th { background: #f3f3f3; }
                            .text-primary { color: #21A366; }
                          </style>
                        </head>
                        <body>${printContent.innerHTML}</body>
                      </html>
                    `);
                    printWindow?.document.close();
                    printWindow?.focus();
                    printWindow?.print();
                  }
                }}
              >
                In hóa đơn (PDF)
              </button>
              <DialogClose asChild>
                <button className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200 font-semibold">Đóng</button>
              </DialogClose>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
