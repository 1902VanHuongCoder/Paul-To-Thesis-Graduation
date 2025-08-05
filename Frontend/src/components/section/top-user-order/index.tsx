import React, { useEffect, useState } from "react";
import { getAllAdmins, getTopUsersByOrders } from "@/lib/user-apis";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createConversation } from "@/lib/chat-apis";
import { UserIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useUser } from "@/contexts/user-context";

interface TopUser {
    userID: string;
    orderCount: number;
    user: {
        userID: string;
        username: string;
        email: string;
        avatar: string;
    };
}

interface User {
    userID: string;
    username: string;
    email: string;
}

const TopUserOrderSection: React.FC = () => {
    const {user} = useUser();
    const [users, setUsers] = useState<TopUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getTopUsersByOrders();
                setUsers(data);
            } catch (err) {
                setError("Không thể tải dữ liệu người dùng.");
                console.error("Error fetching top users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

        // Generate conversation ID for user-admin chat
    const generateConversationID = (userID: string, targetUserID: string, isGroup: boolean) => {
        const day = new Date().getDay();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        // Generate 3 random digits 
        const randomDigits = Math.floor(Math.random() * 900) + 100;
        if (isGroup) {
            return `GRP${userID}${day}${month}${year}${randomDigits}`;
        }
        return `CON${userID}${targetUserID}`;
    };


    const handleCreateConversation = async (userID: string, username: string) => {
        try {
            if(!user){
                alert("Bạn cần đăng nhập để tạo cuộc trò chuyện.");
                return;
            }
            // Create a new conversation with this user (not group)
            let admins: User[] = [];

            try {
                // Get all admins from the backend to create group chat
                admins = await getAllAdmins();
            } catch (error) {
                console.error("Error initializing chat:", error);
            }
            // setIsOpen(true);

            const conversationID = generateConversationID(user.userID, admins[0].userID, true);
            const participants = [userID, ...admins.map(admin => admin.userID)];

            const res = await createConversation({
                conversationID: conversationID,
                conversationName: `Hỗ trợ khách hàng: ${username}`,
                participants: participants,
                isGroup: false,
            });
            // Pass conversationID to the chat page to join a room automatically
            router.push(`/vi/dashboard/chat?conversationID=${res.conversationID}`);
        } catch (err) {
            alert("Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.");
            console.error("Error creating conversation:", err);
        }
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            users.map((u, idx) => ({
                "#": idx + 1,
                "Tên khách hàng": u.user.username,
                "Email": u.user.email,
                "Số đơn hàng": u.orderCount,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Top Users");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "top-5-khach-hang.xlsx");
    };

    return (
        <section className="bg-white pt-8 pb-6">

            <h2 className="text-2xl font-bold mb-6 text-primary">Top 5 Khách Hàng Đặt Nhiều Đơn Nhất</h2>
            {loading ? (
                <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {users.map((item, idx) => (
                        <div
                            key={item.userID}
                            className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 shadow-md hover:shadow-xl transition"
                        >
                            <div className="relative w-20 h-20 mb-3">
                                {item.user.avatar ? (
                                    <Image
                                        src={item.user.avatar}
                                        alt={item.user.username}
                                        fill
                                        className="object-cover rounded-full border-4 border-primary shadow"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-full border-4 border-primary shadow text-gray-500 text-4xl">
                                        <UserIcon className="w-10 h-10" />
                                    </div>
                                )}
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                                    #{idx + 1}
                                </span>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-lg text-gray-800 mb-1 truncate max-w-[120px]">{item.user.username}</div>
                                <div className="text-gray-500 text-sm mb-1 truncate max-w-[140px]">{item.user.email}</div>
                                <div className="text-primary font-bold text-xl mt-2">{item.orderCount} đơn hàng</div>
                                <button
                                    className="mt-3 px-4 py-2 bg-primary text-white rounded-full shadow hover:bg-primary-hover transition text-sm hover:cursor-pointer"
                                    onClick={() => handleCreateConversation(item.user.userID, item.user.username)}
                                >
                                    Nhắn tin cảm ơn
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

            )}
            <div className="flex justify-end my-4">
                {/* Add button to allow user to sort products */}
                <button
                    className="flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer bg-gradient-to-r from-green-700 to-green-900 text-white rounded-full shadow-lg hover:from-green-800 hover:to-green-950 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    onClick={handleExportExcel}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#21A366" />
                        <path d="M7 8l2.5 4L7 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13 8h4M13 12h4M13 16h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Xuất Excel danh sách khách hàng
                </button>
            </div>
        </section>
    );
};

export default TopUserOrderSection;
