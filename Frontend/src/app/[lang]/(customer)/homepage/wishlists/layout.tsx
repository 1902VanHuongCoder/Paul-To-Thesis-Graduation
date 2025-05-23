"use client";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const WishlistLayout = ({children} : {children: React.ReactNode}) => {
      const {dictionary: d} = useDictionary(); 
    return(
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pb-6 pt-10"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.wishlistPageTitle || "Danh sách yêu thích của bạn" }]}/></div>
            {children}
        </div>
    )
}

export default WishlistLayout;