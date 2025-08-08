"use client";
// import Link from "next/link";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerTrigger, DrawerDescription } from "./drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { BookUser, HousePlus, LogOut, ReceiptText, Settings, X } from "lucide-react";
import Image from "next/image";
type User = {
    userID: string;
    username: string;
    email: string;
    avatar: string;
    token: string;
};
export default function UserDrawer({ user, open, setOpen, logout }: { user: User, open: boolean, setOpen: (b: boolean) => void, logout: () => void }) {
    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <button className="p-1.5 rounded-full bg-transparent border-[1px] border-solid border-primary/50 cursor-pointer" aria-label="Open user drawer">
                    <Avatar>
                        {user.avatar ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                <Image 
                                    src={user.avatar}
                                    alt={user.username}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded-full w-full h-full" 
                                />
                            </div>
                        ) : (
                            <AvatarFallback>
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </button>
            </DrawerTrigger>
            <DrawerContent className="w-full sm:max-w-sm border-none font-sans">
                <DrawerHeader className="bg-primary w-full">
                    <DrawerTitle className="text-white ">Hồ sơ của bạn</DrawerTitle>
                    <DrawerDescription className="text-white text-sm">
                        Quản lý tài khoản và cài đặt của bạn
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-4  border-b pb-4 border-gray-200">
                        <Avatar className="size-14">
                            <AvatarImage src={user.avatar || "/avatar.png"} alt={user.username} className="object-cover" />
                            <AvatarFallback className="border-[2px] border-gray-300">{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-lg font-semibold">{user.username}</div>
                            {user.email && <div className="text-gray-500">{user.email}</div>}
                        </div>
                    </div>
                    <a href={`/vi/homepage/user-profile`} className="text-black text-md flex items-center gap-x-2 hover:text-primary hover:font-bold"><span className="text-gray-600"><BookUser /></span><span>Xem chi tiết</span></a>
                    <a href={`/vi/homepage/order-history`} className="text-black text-md flex items-center gap-x-2 hover:text-primary hover:font-bold"><span className="text-gray-600"><ReceiptText /></span><span>Lịch sử mua hàng</span></a>
                    <a href={`/vi/homepage/add-shipping-address`} className="text-black text-md flex items-center gap-x-2 hover:text-primary hover:font-bold"><span className="text-gray-600"><HousePlus /></span><span>Thêm địa chỉ giao hàng</span></a>
                    <a href={`/vi/homepage/update-user-profile?userID=${user.userID}`} className="text-black text-md flex items-center gap-x-2 hover:text-primary hover:font-bold"><span className="text-gray-600"><Settings /></span><span>Cài đặt tài khoản</span></a>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                    {/* Add more user actions/info here */}
                    <button
                        className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md hover:bg-secondary/50 cursor-pointer"
                        onClick={() => {
                            logout();
                            setOpen(false);
                        }}
                    >
                        <span><LogOut /></span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
                <DrawerClose asChild>
                    <button
                        className="absolute top-4 right-2 text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </DrawerClose>
            </DrawerContent>
        </Drawer>
    );
}