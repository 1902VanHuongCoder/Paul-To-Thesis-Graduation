"use client";
import { Breadcrumb } from "@/components";

const ShoppingCartLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pt-10"><Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng" }]} /></div>
            {children}
        </div>
    )
}

export default ShoppingCartLayout;