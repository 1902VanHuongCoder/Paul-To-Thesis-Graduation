"use client";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const OrderHistoryLayout = ({children} : {children: React.ReactNode}) => {
    const {dictionary: d} = useDictionary(); 
    return(
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pt-10"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.orderHistoryTitle || "Lịch sử mua hàng" }]}/></div>
            {children}
        </div>
    )
}

export default OrderHistoryLayout;