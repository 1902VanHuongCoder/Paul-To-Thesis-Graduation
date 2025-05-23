import { Breadcrumb } from "@/components";

const WishlistLayout = async ({children} : {children: React.ReactNode}) => {
    return(
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans px-6">
            <div className="pb-6 pt-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlists" }]}/></div>
            {children}
        </div>
    )
}

export default WishlistLayout;