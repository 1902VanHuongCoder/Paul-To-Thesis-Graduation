"use client";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const ProductDetailsLayout = ({children} : {children: React.ReactNode}) => {
    const {dictionary: d} = useDictionary(); 
    return(
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pb-6 pt-10"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.productDetailsTitle || "Chi tiết sản phẩm" }]}/></div>
            {children}
        </div>
    )
}

export default ProductDetailsLayout;