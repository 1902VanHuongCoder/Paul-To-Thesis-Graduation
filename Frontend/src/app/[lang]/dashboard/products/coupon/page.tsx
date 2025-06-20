"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Pencil, Trash2, Plus } from "lucide-react";
import { baseUrl } from "@/lib/base-url";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Discount = {
  discountID: string;
  discountDescription: string;
  discountPercent: number;
  expireDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortUsageLimit, setSortUsageLimit] = useState<"asc" | "desc" | "none">("none");

    const methods = useForm<Discount>();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = methods;

  useEffect(() => {
    fetch(`${baseUrl}/api/discount`)
      .then(res => res.json())
      .then((data: Discount[]) => setDiscounts(data));
  }, []);

  const handleOpenAdd = () => {
    reset({
      discountID: "",
      discountDescription: "",
      discountPercent: 0,
      expireDate: "",
      isActive: true,
      usageLimit: 0,
      usedCount: 0,
      minOrderValue: 0,
      maxDiscountAmount: 0,
    });
    setEditDiscount(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (discount: Discount) => {
    reset({
      discountID: discount.discountID,
      discountDescription: discount.discountDescription,
      discountPercent: discount.discountPercent,
      expireDate: discount.expireDate ? discount.expireDate.slice(0, 10) : "",
      isActive: discount.isActive,
      usageLimit: discount.usageLimit || 0,
      usedCount: discount.usedCount || 0,
      minOrderValue: discount.minOrderValue || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
    });
    setEditDiscount(discount);
    setOpenDialog(true);
  };

  const handleDelete = async (discountID: string) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;
    await fetch(`${baseUrl}/api/discount/${discountID}`, { method: "DELETE" });
    setDiscounts(discounts => discounts.filter(d => d.discountID !== discountID));
  };

  const onSubmit = async (data: Discount) => {
    setError("");
    const payload: Discount = {
      ...data,
      discountPercent: Number(data.discountPercent),
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usedCount: data.usedCount ? Number(data.usedCount) : 0,
      minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : undefined,
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
      isActive: !!data.isActive,
    };
    try {
      if (editDiscount) {
        const res = await fetch(`${baseUrl}/api/discount/${data.discountID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        setDiscounts(ds => ds.map(d => d.discountID === data.discountID ? { ...d, ...payload } : d));
      } else {
        const res = await fetch(`${baseUrl}/api/discount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Add failed");
        const resData = await res.json();
        setDiscounts(ds => [...ds, resData.data]);
      }
      setOpenDialog(false);
    } catch (err) {
      setError("Failed to save discount");
    }
  };

  const generateDiscountCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("discountID", code);
  };

  // Filter and sort discounts
  const filteredDiscounts = discounts
    .filter((d) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return d.isActive;
      if (statusFilter === "inactive") return !d.isActive;
      return true;
    })
    .sort((a, b) => {
      if (sortUsageLimit === "none") return 0;
      const aVal = a.usageLimit ?? 0;
      const bVal = b.usageLimit ?? 0;
      return sortUsageLimit === "asc" ? aVal - bVal : bVal - aVal;
    });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Discounts</h1>
        <Button onClick={handleOpenAdd} className="flex gap-2 items-center"><Plus size={18}/> Add Discount</Button>
      </div>
      {/* Filter and sort controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-medium mr-2">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="font-medium mr-2">Sort by Usage Limit:</label>
          <select
            value={sortUsageLimit}
            onChange={e => setSortUsageLimit(e.target.value as "asc" | "desc" | "none")}
            className="border rounded px-2 py-1"
          >
            <option value="none">None</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Percent</TableHead>
              <TableHead>Expire Date</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Usage Limit</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.map((d) => (
              <TableRow key={d.discountID}>
                <TableCell>{d.discountID}</TableCell>
                <TableCell>{d.discountDescription}</TableCell>
                <TableCell>{d.discountPercent}%</TableCell>
                <TableCell>{d.expireDate ? d.expireDate.slice(0,10) : ""}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{d.usageLimit ?? ""}</TableCell>
                <TableCell>{d.usedCount ?? 0}</TableCell>
                <TableCell>{d.minOrderValue ?? ""}</TableCell>
                <TableCell>{d.maxDiscountAmount ?? ""}</TableCell>
                <TableCell>{d.createdAt ? d.createdAt.slice(0,10) : ""}</TableCell>
                <TableCell>{d.updatedAt ? d.updatedAt.slice(0,10) : ""}</TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => handleOpenEdit(d)}>Edit</button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this discount? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(d.discountID)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDiscount ? "Update Discount" : "Add Discount"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
     <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <FormItem>
              <FormLabel>Discount ID</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...register("discountID", { required: true })} disabled={!!editDiscount} />
                  <Button type="button" onClick={generateDiscountCode} variant="outline">Generate</Button>
                </div>
              </FormControl>
              {errors.discountID && <FormMessage>Discount ID is required</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...register("discountDescription", { required: true })} />
              </FormControl>
              {errors.discountDescription && <FormMessage>Description is required</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel>Percent (%)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={100} {...register("discountPercent", { required: true, min: 1, max: 100 })} />
              </FormControl>
              {errors.discountPercent && <FormMessage>Percent must be 1-100</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel>Expire Date</FormLabel>
              <FormControl>
                <Input type="date" {...register("expireDate", { required: true })} />
              </FormControl>
              {errors.expireDate && <FormMessage>Expire date is required</FormMessage>}
            </FormItem>
            <FormItem>
              <FormLabel>Active</FormLabel>
              <FormControl>
                <input type="checkbox" {...register("isActive")} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Usage Limit</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...register("usageLimit")} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Used Count</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...register("usedCount")} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Min Order Value</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...register("minOrderValue")} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Max Discount Amount</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...register("maxDiscountAmount")} />
              </FormControl>
            </FormItem>
            {error && <FormMessage>{error}</FormMessage>}
            <DialogFooter>
              <Button type="submit">{editDiscount ? "Update" : "Add"}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </FormProvider>
     
        </DialogContent>
      </Dialog>
    </div>
  );
}