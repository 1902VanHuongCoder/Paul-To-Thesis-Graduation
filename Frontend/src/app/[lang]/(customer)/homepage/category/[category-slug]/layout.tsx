"use client";
import { Breadcrumb } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const CategorySlugLayout = ({ children }: { children: React.ReactNode, params: { categorySlug: string } }) => {
    const { dictionary: d } = useDictionary();
    return (
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans">
            <div className="pt-10 px-6"><Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Kết quả sản phẩm của danh mục" }]} /></div>
            {children}
        </div>
    )
}

export default CategorySlugLayout;