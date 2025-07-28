"use client";

import { Footer, Navigation, TopHeader } from "@/components";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { useEffect, useState } from "react";
import { baseUrl } from "@/lib/others/base-url";
import toast from "react-hot-toast";
import CustomToast from "@/components/ui/toast/custom-toast";
import { io, Socket } from "socket.io-client";
import { usePathname } from "next/navigation";
import { useChat } from "@/contexts/chat-context";

const HomepageLayout = ({ children }: { children: React.ReactNode }) => {
    // Initialize socket and join notification rooms
    const [, setSocket] = useState<Socket | null>(null);
    const { isChatOpen: isOpen } = useChat();
    const currentPath = usePathname();
    useEffect(() => {
        const s: Socket = io(baseUrl);
        setSocket(s);
        // Join notification rooms
        if (currentPath === "/vi/homepage" && isOpen) {
            s.off("chat-notification");
        } else {
            s.emit("join_room", "chat-notification");
        }

        // Listen for chat notifications
        s.on("chat-notification", (data: {
            userAvatar: string;
            room: string;
            username: string;
            message: string;
            senderID: string;
            createdAt: string;
        }
        ) => {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    createdAt={data.createdAt}
                    username={data.username}
                    userAvatar={data.userAvatar}
                    type="chat"
                />
            ), {
                duration: 500,
                position: "bottom-right",
                style: {
                    width: "400px",
                    maxWidth: "100%",
                },

            });
        });
        return () => {
            s.off("chat-notification");
            s.disconnect();
        };
    }, [isOpen, currentPath]);

    return (
        <>
            <Head>
                <meta name="description" content="NFeam House - Nền tảng nông nghiệp thông minh, cung cấp giải pháp quản lý, tư vấn, và kết nối cho nhà nông hiện đại." />
            </Head>
            <div className="relative max-w-screen min-h-screen overflow-hidden font-sans">
                <Toaster position="top-right" />
                <TopHeader />
                <Navigation />
                {children}
                <Footer />
            </div>
        </>
    );
}

export default HomepageLayout;