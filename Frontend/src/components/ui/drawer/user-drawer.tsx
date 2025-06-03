"use client";
import Link from "next/link";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerTrigger } from "./drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";

export default function UserDrawer({ user, open, setOpen, logout }: { user: { username: string; avatar?: string; email?: string }, open: boolean, setOpen: (b: boolean) => void, logout: () => void }) {
    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <button aria-label="Open user drawer">
                    <Avatar>
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.username} />
                        ) : (
                            <AvatarFallback>
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </button>
            </DrawerTrigger>
            <DrawerContent className="w-full sm:max-w-sm">
                <DrawerHeader>
                    <DrawerTitle>User Profile</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col items-center gap-4 p-4">
                    <Avatar className="size-20">
                        <AvatarImage src={user.avatar || "/avatar.png"} alt={user.username} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-lg font-semibold">{user.username}</div>
                    {user.email && <div className="text-gray-500">{user.email}</div>}
                    <Link href="/profile" className="text-blue-500 hover:underline"> View Profile</Link>
                    <Link href="/settings" className="text-blue-500 hover:underline">Order history</Link>
                    <Link href="/settings" className="text-blue-500 hover:underline">Add ship delivery</Link>
                    <Link href="/settings" className="text-blue-500 hover:underline">Account settings</Link>
                    
                </div>
                <div className="p-4">
                    {/* Add more user actions/info here */}
                    <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                        onClick={() => {
                            logout();
                            setOpen(false);
                        }}
                    >
                        Logout
                    </button>
                </div>
                <DrawerClose asChild>
                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </DrawerClose>
            </DrawerContent>
        </Drawer>
    );
}