"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import AddOrderForm from "./add-order-form";
import { baseUrl } from "@/lib/base-url";

// Toast component for feedback
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
      <button className="ml-4 text-white font-bold" onClick={onClose}>×</button>
    </div>
  );
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
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("createdAt-desc");
  const [, setViewOrder] = useState<Order | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/order`)
      .then(res => res.json())
      .then((data: Order[]) => setOrders(data));
  }, [refresh]);

  const handleStatusChange = async (orderID: string, newStatus: string) => {
    const order = orders.find(o => o.orderID === orderID);
    if (!order) return;
    const res = await fetch(`${baseUrl}/api/order/${orderID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, orderStatus: newStatus }),
    });
    if (res.ok) {
      setToast("Order status updated successfully.");
      setTimeout(() => setToast(null), 2000);
      setRefresh(r => r + 1);
    } else {
      setToast("Failed to update order status.");
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Filtering and sorting
  const filteredOrders = orders
    .filter(order => {
      if (status !== "all" && order.orderStatus !== status) return false;
      if (search && !order.orderID.toLowerCase().includes(search.toLowerCase()) && !order.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "createdAt-desc") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "createdAt-asc") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "totalPayment-desc") return (b.totalPayment || 0) - (a.totalPayment || 0);
      if (sort === "totalPayment-asc") return (a.totalPayment || 0) - (b.totalPayment || 0);
      return 0;
    });

  return (
    <div className="p-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex justify-between items-end mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-medium mb-1">Search</label>
            <Input
              placeholder="Order ID or Customer Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">Sort By</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="createdAt-asc">Oldest</SelectItem>
                <SelectItem value="totalPayment-desc">Total Payment (High-Low)</SelectItem>
                <SelectItem value="totalPayment-asc">Total Payment (Low-High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-9">Add Order</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map(order => (
            <TableRow key={order.orderID}>
              <TableCell>{order.orderID}</TableCell>
              <TableCell>{order.fullName}</TableCell>
              <TableCell>{order.phone}</TableCell>
              <TableCell>{order.address}</TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell>
                <Select value={order.orderStatus} onValueChange={v => handleStatusChange(order.orderID, v)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.totalPayment?.toLocaleString()}</TableCell>
              <TableCell>{order.totalQuantity}</TableCell>
              <TableCell>{order.createdAt ? order.createdAt.slice(0, 10) : ""}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>View</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Order Details</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      <div className="space-y-2 text-left">
                        <div><b>Order ID:</b> {order.orderID}</div>
                        <div><b>Customer:</b> {order.fullName}</div>
                        <div><b>Phone:</b> {order.phone}</div>
                        <div><b>Address:</b> {order.address}</div>
                        <div><b>Payment:</b> {order.paymentMethod}</div>
                        <div><b>Status:</b> {order.orderStatus}</div>
                        <div><b>Total:</b> {order.totalPayment?.toLocaleString()}</div>
                        <div><b>Quantity:</b> {order.totalQuantity}</div>
                        <div><b>Note:</b> {order.note}</div>
                        <div><b>Discount:</b> {order.discount}</div>
                        <div><b>Delivery Cost:</b> {order.deliveryCost}</div>
                        <div><b>Created:</b> {order.createdAt}</div>
                        <div><b>Updated:</b> {order.updatedAt}</div>
                      </div>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AddOrderForm open={addOpen} onOpenChange={setAddOpen} onOrderAdded={() => setRefresh(r => r + 1)} />
    </div>
  );
}
