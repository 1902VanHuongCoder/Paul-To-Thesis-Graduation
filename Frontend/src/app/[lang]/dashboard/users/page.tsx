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
// import { Button } from "@/components/ui/button/button";
import Link from "next/link";
import { useDictionary } from "@/contexts/dictonary-context";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select/select";

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
  const {lang} = useDictionary();
  const [users, setUsers] = React.useState<User[]>([])
  const [usernameFilter, setUsernameFilter] = React.useState("")
  const [activeOnly, setActiveOnly] = React.useState(false)
  const [roleFilter, setRoleFilter] = React.useState("");
  const [loading, setLoading] = React.useState(true)
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true)
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesUsername = user.username
      .toLowerCase()
      .includes(usernameFilter.toLowerCase())
    const matchesActive = !activeOnly || user.isActive
    const matchesRole = roleFilter === "all" || !roleFilter || user.role === roleFilter
    return matchesUsername && matchesActive && matchesRole
  })

  const handleToggleStatus = async (user: User) => {
    setUpdatingUserId(user.userID);
    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.userID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.userID === user.userID ? { ...u, isActive: !u.isActive } : u
          )
        );
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Filter by username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2">
          <Switch
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
            id="active-switch"
          />
          <span>Active only</span>
        </label>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="cus">Customer</SelectItem>
              <SelectItem value="sta">Staff</SelectItem>
              <SelectItem value="adm">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableCaption>{loading ? "Loading users..." : filteredUsers.length === 0 ? "No users found." : null}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.userID}>
              <TableCell>{user.userID}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${user.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                  disabled={updatingUserId === user.userID}
                  onClick={() => handleToggleStatus(user)}
                  title={user.isActive ? "Disable account" : "Activate account"}
                >
                  {updatingUserId === user.userID ? "..." : user.isActive ? "Active" : "Disabled"}
                </button>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link
        href={`/${lang}/dashboard/users/add-new-user`}
        className="mt-6"
        >Thêm người dùng</Link>
    </div>
  )
}
