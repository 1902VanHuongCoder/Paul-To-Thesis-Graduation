"use client";
import { Breadcrumb, CheckoutPage } from "@/components";
import { useDictionary } from "@/contexts/dictonary-context";

const ShoppingCart = () => {
    const { dictionary: d } = useDictionary();
    return (
        <div className="py-10 px-6">
            <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: "Thực hiện thanh toán" }]} />
            <CheckoutPage />
            
        </div>
    );
}

export default ShoppingCart; 