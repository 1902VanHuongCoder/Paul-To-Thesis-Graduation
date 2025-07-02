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
import { useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import { io, Socket } from "socket.io-client"

interface SocketData {
  userName: string;
  totalPayment: number;
  createdAt: string;
  orderID: number;
}

export default function DashboardLayout({children}: { children: React.ReactNode }) {
  useEffect(() => {
    const socket: Socket = io(baseUrl);
    socket.emit("join_room", "admins"); // Join the 'admins' room
    socket.on("admins", (data : SocketData) => {
      console.log("New admin notification:", data);
      toast.success(`hihi `); 
    });
    return () => {
      socket.off("admins");
      socket.disconnect();
    };
  }, []);

  
  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="pr-6">
            <Bell height={20} width={20}/>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
