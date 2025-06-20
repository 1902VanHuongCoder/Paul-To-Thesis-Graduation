"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";
import { baseUrl } from "@/lib/base-url";

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
  const [status, setStatus] = useState<string>("all");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(`${baseUrl}/api/contact`)
      .then(res => res.json())
      .then((data: Contact[]) => setContacts(data));
  }, [refresh]);

  const handleStatusChange = async (contactID: number, newStatus: string) => {
    await fetch(`${baseUrl}/api/contact/${contactID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setRefresh(r => r + 1);
  };

  const filteredContacts = contacts.filter(contact => {
    if (status !== "all" && contact.status !== status) return false;
    if (search && !contact.subject.toLowerCase().includes(search.toLowerCase()) && !contact.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Contacts</h1>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block font-medium mb-1">Search</label>
          <Input
            placeholder="Search subject or message"
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContacts.map(contact => (
            <TableRow key={contact.contactID}>
              <TableCell>{contact.contactID}</TableCell>
              <TableCell>{contact.userID}</TableCell>
              <TableCell>{contact.subject}</TableCell>
              <TableCell>{contact.message}</TableCell>
              <TableCell>
                <Select value={contact.status} onValueChange={v => handleStatusChange(contact.contactID, v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{contact.createdAt ? contact.createdAt.slice(0, 10) : ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
