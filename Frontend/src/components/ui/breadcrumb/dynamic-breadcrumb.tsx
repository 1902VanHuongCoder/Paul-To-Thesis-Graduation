"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";

const pathToLabel = (segment: string) => {
  // Map route segments to readable labels
  switch (segment) {
    case "dashboard": return "Thông tin tổng quan";
    case "products": return "Quản lý sản phẩm";
    case "edit-product": return "Cập nhật thông tin sản phẩm";
    case "users": return "Quản lý người dùng";
    case "add-new-user": return "Thêm người dùng";
    case "add-product": return "Thêm sản phẩm";
    case "tags": return "Thẻ";
    case "coupon": return "Chương trình giảm giá";
    case "category": return "Danh mục";
    case "sub-category": return "Danh mục phụ";
    case "posts": return "Bài viết";
    case "add-post" : return "Thêm bài viết";
    case "orders" : return "Đơn hàng";
    case "origin": return "Nhà cung cấp"; 
    case "comments": return "Bình luận";
    case "news" : return "Tin tức";
    case "delivery-method": return "Phương thức giao hàng";
    case "contacts": return "Liên hệ và phản hồi";
    case "admin-profile": return "Thông tin quản trị viên";
    case "admin-settings": return "Cài đặt quản trị viên";
    case "chat" : return "Trò chuyện";
    // Add more mappings as needed
    default: return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
};

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList className="">
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          return (
            <React.Fragment key={seg}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{pathToLabel(seg)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={"/vi" + href}>{pathToLabel(seg)}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}