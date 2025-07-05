"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { baseUrl } from "@/lib/base-url";

export default function AddOrderForm({ open, onOpenChange, onOrderAdded }: { open: boolean; onOpenChange: (open: boolean) => void; onOrderAdded: () => void }) {
  const [form, setForm] = useState({
    orderID: "",
    userID: "",
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "cash",
    deliveryID: 1,
    totalPayment: 0,
    totalQuantity: 0,
    note: "",
    discount: 0,
    deliveryCost: 0,
    orderStatus: "pending",
  });
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${baseUrl}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onOrderAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="orderID" placeholder="Order ID" value={form.orderID} onChange={handleChange} required />
          <Input name="userID" placeholder="User ID" value={form.userID} onChange={handleChange} required />
          <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
          <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
          <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
          <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="momo">Momo</SelectItem>
            </SelectContent>
          </Select>
          <Input name="deliveryID" placeholder="Delivery ID" value={form.deliveryID} onChange={handleChange} type="number" required />
          <Input name="totalPayment" placeholder="Total Payment" value={form.totalPayment} onChange={handleChange} type="number" required />
          <Input name="totalQuantity" placeholder="Total Quantity" value={form.totalQuantity} onChange={handleChange} type="number" required />
          <Input name="note" placeholder="Note" value={form.note} onChange={handleChange} />
          <Input name="discount" placeholder="Discount" value={form.discount} onChange={handleChange} type="number" />
          <Input name="deliveryCost" placeholder="Delivery Cost" value={form.deliveryCost} onChange={handleChange} type="number" />
          <Select value={form.orderStatus} onValueChange={v => setForm(f => ({ ...f, orderStatus: v }))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Order Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancled">Cancled</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Order"}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
