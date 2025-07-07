"use client";
import { DynamicBreadcrumb } from "@/components"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { baseUrl } from "@/lib/base-url"
import { Bell } from "lucide-react"
import { usePathname } from "next/navigation";
import { useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import CustomToast from "@/components/ui/toast/custom-toast";

// interface OrderData {
//   username: string;
//   createdAt: string;
// }

// interface chatData {
//   username: string;
//   createdAt: string;
//   userAvatar?: string; 
//   message: string; 
// }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const path = usePathname();
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

    return () => {
      socket.off("chat-notification");
      socket.off("order-notification");
      socket.disconnect();
    };
  }, [path]);

  return (
    <SidebarProvider>
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
          <div className="pr-6">
            <Bell height={20} width={20} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 font-sans">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
