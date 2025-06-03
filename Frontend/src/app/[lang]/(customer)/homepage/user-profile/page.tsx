"use client";

import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar/avatar";
import { useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";

interface ShippingAddress {
    shippingAddressID: number;
    phone: string;
    address: string;
    isDefault: boolean;
}

export default function UserProfilePage() {
    const { user, logout } = useUser();
    const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.userID) return;
            try {
                const res = await fetch(`${baseUrl}/api/shipping-address/user/${user.userID}`);
                if (res.ok) {
                    const data = await res.json();
                    setShippingAddresses(data);
                    console.log("Fetched shipping addresses:", data);
                } else {
                    setShippingAddresses([]);
                }
            } catch {
                setShippingAddresses([]);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [user?.userID]);

    if (!user) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-16">
            <div className="flex flex-col items-center gap-4">
                <Avatar className="size-24">
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                    ) : (
                        <AvatarFallback>
                            {user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="text-2xl font-bold">{user.username}</div>
                <div className="text-gray-500">{user.email}</div>
                <button
                    className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={logout}
                >
                    Đăng xuất
                </button>
            </div>

            <div className="mt-10">
                <h3 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h3>
                {loadingAddresses ? (
                    <div>Đang tải danh sách địa chỉ...</div>
                ) : shippingAddresses.length === 0 ? (
                    <div>Bạn chưa có địa chỉ giao hàng nào.</div>
                ) : (
                    <ul className="space-y-4">
                        {shippingAddresses.map(addr => (
                            <li
                                key={addr.shippingAddressID}
                                className={`p-4 border rounded ${addr.isDefault ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                            >
                                <div className="font-medium">{addr.address}</div>
                                <div className="text-gray-600">SĐT: {addr.phone}</div>
                                {addr.isDefault && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                                        Mặc định
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}