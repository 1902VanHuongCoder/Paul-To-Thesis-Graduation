"use client";

import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { Button } from "@/components/ui/button/button";

export default function AdminProfilePage() {
    const { user, logout } = useUser();

    if (!user) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p>Vui lòng đăng nhập để xem thông tin quản trị viên.</p>
            </div>
        );
    }

    return (
        <div className="px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="size-24 border-2 border-primary/30">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.username} className="object-cover border-[2px] border-primary" />
                        ) : (
                            <AvatarFallback className="border-[1px] border-gray-300 text-3xl">
                                {user.username?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="text-center">
                        <div className="text-5xl font-bold">{user.username}</div>
                        <div className="text-gray-500 text-lg">{user.email}</div>
                        <div className="text-gray-400 text-base mt-2">Vai trò: <span className="font-semibold text-primary">Quản trị viên</span></div>
                    </div>
                    <Button
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition cursor-pointer"
                        onClick={logout}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </div>
    );
}
