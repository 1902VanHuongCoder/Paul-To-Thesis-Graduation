"use client"

import * as React from "react"
import {
  Building2,
  FileUser,
  // AudioWaveform,
  // Command,
  // Frame,
  // Handshake,
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
  // Warehouse,
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
// import { NavProjects } from "./nav-projects"

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
          url: "/vi/dashboard/users",
        },
        {
          title: "Thêm người dùng",
          url: "/vi/dashboard/users/add-new-user",
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
          url: "/vi/dashboard/products",
        },
        {
          title: "Thêm sản phẩm",
          url: "/vi/dashboard/products/add-product",
        },
        {
          title: "Thẻ sản phẩm",
          url: "/vi/dashboard/products/tags",
        }, {
          title: "Chương trình giảm giá",
          url: "/vi/dashboard/products/coupon",
        },
      ],
    },
    {
      title: "Danh mục",
      url: "#",
      icon: LayoutList,
      items: [
        {
          title: "Danh mục chính",
          url: "/vi/dashboard/category",
        },
        {
          title: "Danh mục phụ",
          url: "/vi/dashboard/category/sub-category",
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
          url: "/vi/dashboard/posts",
        },
        {
          title: "Thêm bài viết",
          url: "/vi/dashboard/posts/add-post",
        },
        {
          title: "Thẻ bài viết",
          url: "/vi/dashboard/posts/tags",
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
          url: "/vi/dashboard/orders",
        },
      ],
    },
    // {
    //   title: "Kho",
    //   url: "#",
    //   icon: Warehouse,
    //   items: [
    //     {
    //       title: "Danh sách các kho",
    //       url: "#",
    //     },
    //     {
    //       title: "Tất cả giao dịch kho",
    //       url: "#",
    //     },
    //     {
    //       title: "Thêm kho mới",
    //       url: "#",
    //     },
    //     {
    //       title: "Nhập kho",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Nhà cung cấp",
      url: "#",
      icon: FileUser,
      items: [
        {
          title: "Tất cả nhà cung cấp",
          url: "/vi/dashboard/origin",
        },
        // {
        //   title: "Thêm nhà cung cấp",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Bình luận",
      url: "#",
      icon: MessageSquareText,
      items: [
        {
          title: "Bình luận sản phẩm",
          url: "/vi/dashboard/comments/products",
        },
        {
          title: "Bình luận bài viết",
          url: "/vi/dashboard/comments/news",
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
          url: "/vi/dashboard/delivery-method",
        },
      ],
    },
    {
      title: "Liên hệ và phản hồi",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Tất cả cả liên hệ",
          url: "/vi/dashboard/contacts",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Thông tin công ty",
  //     url: "/vi/dashboard/contacts",
  //     icon: Building2,
  //   },
  //   {
  //     name: "Liên hệ và phản hồi",
  //     url: "#",
  //     icon: Handshake,
  //   },
  // ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useUser();
  console.log(user);
  return (
    <Sidebar collapsible="icon" {...props} className="bg-red-500">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-primary text-white">
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <User />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Quản trị viên</span>
                  <span className="">v1.0.0</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser userInfo={{ name: user.username, email: user.email, avatar: user?.avatar || "" }} logout={logout}/>}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
