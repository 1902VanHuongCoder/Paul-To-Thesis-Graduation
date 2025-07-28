"use client";
import { DynamicBreadcrumb } from "@/components"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import CustomToast from "@/components/ui/toast/custom-toast";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { fetchConversations } from "@/lib/chat-apis";
import socket from "@/lib/others/socket-client";

interface User {
  userID: string;
  username: string;
  email: string;
}

interface Message {
  messageID: number;
  conversationID: string;
  senderID: string;
  content: string;
  createdAt: string;
  sender?: User;
  isRead?: boolean;
}

interface Conversation {
  conversationID: string;
  conversationName: string;
  participants: User[];
  isGroup: boolean;
  conversationAvatar?: string;
  newestMessage?: string;
  hostID?: string;
  messages?: Message[];
}

interface ConversationList {
  conversationID: string;
  userID: string;
  conversation: Conversation;
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // If path is equal to "/vi/dashboard/chat", the system will not get chat notifications
    if (path === "/vi/dashboard/chat") {
      // disconnect to chat-notifications room
      socket.emit("leave_room", "chat-notification");
      socket.off("chat-notification");
    } else {
      // else we join the 'chat-notification room' to get chat notifications
      socket.emit("join_room", "chat-notification");
    }

    // Join the 'order-notification' room to get order notifications
    socket.emit("join_room", "order-notification");

    // Join the 'admin-room' to receive unread count updates
    socket.emit("join_room", "admin-room");

    const unreadCountUpdate = (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    };

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
        duration: 5000,
        position: "bottom-right",
        style: {
          width: "400px",
          maxWidth: "100%",
        },
      });
    };

    const handleOrderNotification = (data: {
      userAvatar: string;
      room: string;
      username?: string;
      message?: string;
      senderID?: string;
      createdAt: string;
    }) => {
      toast.custom((t) => (
        <CustomToast
          t={t}
          createdAt={data.createdAt}
          username={data.username}
          userAvatar={data.userAvatar}
          type="order"
        />
      ), {
        duration: 5000,
        position: "bottom-right",
        style: {
          width: "400px",
          maxWidth: "100%",
        },
      });
    };

    socket.on("chat-notification", handleChatNotification);
    socket.on("order-notification", handleOrderNotification);
    socket.on("unread_count_update", unreadCountUpdate);

    return () => {
      // Leave the chat-notification room when component unmounts
      socket.emit("leave_room", "chat-notification");
      socket.off("chat-notification", handleChatNotification);
      // Leave the order-notification room when component unmounts
      socket.emit("leave_room", "order-notification");
      socket.off("order-notification", handleOrderNotification);
      socket.off("unread_count_update", unreadCountUpdate);
      // Leave the admin-room when component unmounts
      socket.emit("leave_room", "admin-room");
    };
  }, [path, user]);

  useEffect(() => {
    // Fetch unread count for chat badge
    if (user) {
      const fetchConversationsData = async () => {
        try {
          const data = await fetchConversations(user.userID);
          if (!data) {
            throw new Error("Failed to fetch conversations");
          }
          let count = 0;
          data.forEach((item: ConversationList) => {
            if (item.conversation.messages && item.conversation.messages.length > 0) {
              count += item.conversation.messages.filter(message => !message.isRead && message.senderID !==
                user.userID).length;
            }
          });
          setUnreadCount(count);
        } catch (error) {
          console.error("Error fetching conversations:", error);
          setUnreadCount(0);
        }
      };
      fetchConversationsData();
    }
  }, [user]);

  return (
    <SidebarProvider className="overflow-x-hidden">
      <Toaster position="top-right" />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between font-sans">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="relative mr-4 w-fit">
            <Link href="/vi/dashboard/chat" className="p-2 bg-primary text-white rounded-md block">
              <MessageCircle height={20} width={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 font-sans">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
