"use client";
import { DynamicBreadcrumb } from "@/components"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { baseUrl } from "@/lib/others/base-url"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import CustomToast from "@/components/ui/toast/custom-toast";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { fetchConversations } from "@/lib/chat-apis";

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
    const socket: Socket = io(baseUrl);
    // If path is equal to "/vi/dashboard/chat", the system will not get chat notifications
    if (path === "/vi/dashboard/chat") {
      // disconnect to chat-notifications room 
      socket.off("chat-notification");
    } else {
      // else we join the 'chat-notification room' to get chat notifications
      socket.emit("join_room", "chat-notification");
    }

    // Join the 'order-notification' room to get order notifications
    socket.emit("join_room", "order-notification");

    // Listen for chat notifications
    socket.on("chat-notification", () => {

      toast.custom((t) => (
        <CustomToast
          t={t}
          createdAt="2023-10-01T12:00:00Z"
          username="John Doe"
          type="order"
        />


      ), {
        duration: 5000,
        position: "bottom-right",
        style: {
          width: "400px",
          maxWidth: "100%",
        },
      })
    });

    // Listen for order notifications 
    socket.on("order-notification", () => {

      toast.custom((t) => (
        <CustomToast
          t={t}
          createdAt="2023-10-01T12:00:00Z"
          username="John Doe"
          type="order"
        />


      ), {
        duration: 5000,
        position: "bottom-right",
        style: {
          width: "400px",
          maxWidth: "100%",
        },
      })
    });

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

    return () => {
      socket.off("chat-notification");
      socket.off("order-notification");
      socket.disconnect();
    };
  }, [path, user]);

  return (
    <SidebarProvider className="overflow-x-hidden">
      <Toaster position="top-right"/>
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
