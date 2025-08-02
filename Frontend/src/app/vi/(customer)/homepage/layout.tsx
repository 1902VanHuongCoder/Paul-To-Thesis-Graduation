"use client";

import { Footer, Navigation, TopHeader } from "@/components";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { useEffect } from "react";
import toast from "react-hot-toast";
import CustomToast from "@/components/ui/toast/custom-toast";
import { useChat } from "@/contexts/chat-context";
import socket from "@/lib/others/socket-client";


const HomepageLayout = ({ children }: { children: React.ReactNode }) => {
    // Initialize socket and join notification rooms
    const { isChatOpen: isOpen } = useChat();
    useEffect(() => {

        // Join or leave notification room based on path and chat state
        if (isOpen) {
            socket.emit("leave_room", "chat-notification");
            socket.off("chat-notification");
        } else {
            socket.emit("join_room", "chat-notification");
        }

        // Listen for chat notifications
        const handleChatNotification = (data: {
            userAvatar: string;
            room: string;
            username: string;
            message: string;
            senderID: string;
            createdAt: string;
        }) => {
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
        };

        socket.on("chat-notification", handleChatNotification);

        return () => {
            socket.emit("leave_room", "chat-notification");
            socket.off("chat-notification", handleChatNotification); // <-- Remove handler!
        };
    }, [isOpen]);

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