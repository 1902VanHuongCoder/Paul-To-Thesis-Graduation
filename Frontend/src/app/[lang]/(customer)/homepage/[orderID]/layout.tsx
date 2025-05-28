"use client";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const OrderDetailsLayout = ({ children, params }: { children: React.ReactNode, params: { orderID: string } }) => {
    const {dictionary: d, lang} = useDictionary(); 
    const { orderID } = params;
    return(
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pt-10"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.orderHistoryTitle || "Lịch sử mua hàng", href: `/${lang}/homepage/order-history` }, { label: orderID }]}/></div>
            {children}
        </div>
    )
}

export default OrderDetailsLayout;