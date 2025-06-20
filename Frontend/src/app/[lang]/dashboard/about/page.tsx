"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/lib/base-url";

interface About {
  companyPhone: string;
  companyEmail: string;
  copanyAddress: string;
  companyDescription: string;
  companyLogo: string;
  companyName: string;
  companySlogan: string;
  companyFacebook: string;
  companyWorkingTime: string;
  companyImage: string;
}

const emptyAbout: About = {
  companyPhone: "",
  companyEmail: "",
  copanyAddress: "",
  companyDescription: "",
  companyLogo: "",
  companyName: "",
  companySlogan: "",
  companyFacebook: "",
  companyWorkingTime: "",
  companyImage: "",
};

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [form, setForm] = useState<About>(emptyAbout);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch(`${baseUrl}/api/about`)
      .then(res => res.ok ? res.json() : null)
      .then((data: About | null) => {
        if (data) setAbout(data);
      });
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    await fetch(`${baseUrl}/api/about`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAbout(form);
    setForm(emptyAbout);
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    await fetch(`${baseUrl}/api/about`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAbout(form);
    setEditMode(false);
  };

  const handleDelete = async () => {
    await fetch(`${baseUrl}/api/about`, { method: "DELETE" });
    setAbout(null);
    setForm(emptyAbout);
    setEditMode(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Company Info (About)</h1>
      {about ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{about.companyName}</TableCell>
                <TableCell>{about.companyPhone}</TableCell>
                <TableCell>{about.companyEmail}</TableCell>
                <TableCell>{about.copanyAddress}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => { setForm(about); setEditMode(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={handleDelete}>Delete</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {editMode && (
            <form onSubmit={handleUpdate} className="mt-8 space-y-3 bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Edit Company Info</h2>
              <Input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} required />
              <Input name="companyPhone" placeholder="Phone" value={form.companyPhone} onChange={handleChange} required />
              <Input name="companyEmail" placeholder="Email" value={form.companyEmail} onChange={handleChange} required />
              <Input name="copanyAddress" placeholder="Address" value={form.copanyAddress} onChange={handleChange} required />
              <Input name="companyDescription" placeholder="Description" value={form.companyDescription} onChange={handleChange} />
              <Input name="companyLogo" placeholder="Logo URL" value={form.companyLogo} onChange={handleChange} />
              <Input name="companySlogan" placeholder="Slogan" value={form.companySlogan} onChange={handleChange} />
              <Input name="companyFacebook" placeholder="Facebook" value={form.companyFacebook} onChange={handleChange} />
              <Input name="companyWorkingTime" placeholder="Working Time" value={form.companyWorkingTime} onChange={handleChange} />
              <Input name="companyImage" placeholder="Image URL" value={form.companyImage} onChange={handleChange} />
              <div className="flex gap-2">
                <Button type="submit">Update</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 bg-gray-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Add Company Info</h2>
          <Input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} required />
          <Input name="companyPhone" placeholder="Phone" value={form.companyPhone} onChange={handleChange} required />
          <Input name="companyEmail" placeholder="Email" value={form.companyEmail} onChange={handleChange} required />
          <Input name="copanyAddress" placeholder="Address" value={form.copanyAddress} onChange={handleChange} required />
          <Input name="companyDescription" placeholder="Description" value={form.companyDescription} onChange={handleChange} />
          <Input name="companyLogo" placeholder="Logo URL" value={form.companyLogo} onChange={handleChange} />
          <Input name="companySlogan" placeholder="Slogan" value={form.companySlogan} onChange={handleChange} />
          <Input name="companyFacebook" placeholder="Facebook" value={form.companyFacebook} onChange={handleChange} />
          <Input name="companyWorkingTime" placeholder="Working Time" value={form.companyWorkingTime} onChange={handleChange} />
          <Input name="companyImage" placeholder="Image URL" value={form.companyImage} onChange={handleChange} />
          <Button type="submit">Add</Button>
        </form>
      )}
    </div>
  );
}
