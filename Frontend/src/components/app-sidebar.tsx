"use client"

import * as React from "react"
import {
  Building2,
  FileUser,
  // AudioWaveform,
  // Command,
  // Frame,
  Handshake,
  LayoutList,
  MessageSquareText,
  Package,
  Package2,
  // PieChart,
  // Settings2,
  StickyNote,
  Truck,
  User,
  UsersRound,
  Warehouse,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/contexts/user-context"
import { NavProjects } from "./nav-projects"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: GalleryVerticalEnd,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: AudioWaveform,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: Command,
  //     plan: "Free",
  //   },
  // ],
  navMain: [
    {
      title: "Người dùng",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "Tất cả người dùng",
          url: "#",
        },
        {
          title: "Thêm người dùng",
          url: "#",
        },
        {
          title: "Người dùng ngừng hoạt động",
          url: "#",
        },
      ],
    },
    {
      title: "Sản phẩm",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Tất cả sản phẩm",
          url: "#",
        },
        {
          title: "Thêm sản phẩm",
          url: "#",
        },
        {
          title: "Thẻ sản phẩm",
          url: "#",
        }, {
          title: "Chương trình giảm giá",
          url: "#",
        },
      ],
    },
    {
      title: "Danh mục",
      url: "#",
      icon: LayoutList, 
      items: [
        {
          title: "Tất cả danh mục",
          url: "#",
        },
        {
          title: "Thêm danh mục",
          url: "#",
        },
        {
          title: "Thêm danh mục con",
          url: "#",
        },
      ],
    },
    {
      title: "Bài viết",
      url: "#",
      icon: StickyNote,
      items: [
        {
          title: "Tất cả bài viết",
          url: "#",
        },
        {
          title: "Thêm bài viết",
          url: "#",
        },
        {
          title: "Thẻ bài viết",
          url: "#",
        },
      ],
    },
    {
      title: "Đơn hàng",
      url: "#",
      icon: Package2,
      items: [
        {
          title: "Tất cả đơn hàng",
          url: "#",
        },
        {
          title: "Thêm đơn hàng",
          url: "#",
        },
      ],
    },
    {
      title: "Kho",
      url: "#",
      icon: Warehouse,
      items: [
        {
          title: "Danh sách các kho",
          url: "#",
        },
        {
          title: "Tất cả giao dịch kho",
          url: "#",
        },
        {
          title: "Thêm kho mới",
          url: "#",
        },
        {
          title: "Nhập kho",
          url: "#",
        },
      ],
    },
    {
      title: "Nhà cung cấp",
      url: "#",
      icon: FileUser,
      items: [
        {
          title: "Tất cả nhà cung cấp",
          url: "#",
        },
        {
          title: "Thêm nhà cung cấp",
          url: "#",
        },
      ],
    },
    {
      title: "Bình luận",
      url: "#",
      icon: MessageSquareText,
      items: [
        {
          title: "Bình luận sản phẩm",
          url: "#",
        },
        {
          title: "Bình luận bài viết",
          url: "#",
        },
      ],
    },
    {
      title: "Phương thức giao hàng",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Tất cả phương thức giao hàng",
          url: "#",
        },
        {
          title: "Thêm phương thức giao hàng",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Thông tin công ty",
      url: "#",
      icon: Building2 ,
    },
    {
      name: "Chính sách và điều khoản",
      url: "#",
      icon: Handshake,
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  console.log(user);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <User />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Quản trị viên</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        { user && <NavUser user={{name: user.username, email: user.email, avatar: user?.avatar || ""}} /> }
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
