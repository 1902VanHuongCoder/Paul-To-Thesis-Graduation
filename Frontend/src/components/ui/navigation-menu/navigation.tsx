"use client";
import React, { useEffect, useState } from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "./navigation-menu-shadcn";
import Image from "next/image";
import darkLogo from "@public/images/dark+logo.png";
import vector02 from "@public/vectors/Vector+02.png";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SearchForm from "../search-form/search-form";
import ShoppingCart from "../shopping-cart/shopping-cart";
import WishlistDialog from "../dialog/wishlist-dialog";
import MobileDrawer from "../drawer/mobile-drawer";
import LanguageSwitcher from "../language-switcher/language-switcher";
import { baseUrl } from "@/lib/base-url";
import { useDictionary } from "@/contexts/dictonary-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";

const ListItem = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
});
ListItem.displayName = "ListItem"

interface Category {
    categoryID: number;
    categoryName: string;
    categoryDescription?: string;
    categorySlug: string;
}

export default function Navigation() {
    const [categories, setCategories] = useState<Category[]>([]);
    const { lang, dictionary: t } = useDictionary();
    const { wishlists, removeFromWishlist,setWishlist  } = useWishlist();
    const { addToCart, fetchCart } = useShoppingCart();


    // Example handlers
    const handleRemoveItem = (productID: number, customerID: number) => {
        removeFromWishlist(customerID, productID);
        const wishlistUpdated = wishlists.filter((item) => item.productID !== productID);
        setWishlist(wishlistUpdated);
    };

    const handleAddToCart = async (productID: number, customerID: number) => {
        addToCart(productID); 
        fetchCart(customerID);
        removeFromWishlist(customerID, productID);
        const wishlistUpdated = wishlists.filter((item) => item.productID !== productID);
        setWishlist(wishlistUpdated);
    };


    useEffect(() => {
        fetch(`${baseUrl}/api/category`)
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                console.log("Categories:", data);
            }
            )
    }, []);

    return (
        <div className="relative w-full h-fit bg-white font-sans shadow-lg">
            <div className="absolute -bottom-6 left-0 w-full h-auto z-1">
                <Image src={vector02} alt="Logo" className="mb-4 w-full h-auto" priority />
            </div>
            <div className="relative z-2 flex flex-col md:flex-row items-center justify-between bg-white font-sans text-primary md:px-6 pb-4 md:py-4">
                <Image src={darkLogo} alt="Logo" width={200} height={100} className="mb-6 mt-4 md:mt-0 md:mb-4 w-[250px] h-auto md:w-[400px] translate-x-5 md:translate-x-0" />
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList>
                        {/* Home */}
                        <NavigationMenuItem>
                            <Link href="/" className={cn(navigationMenuTriggerStyle(), "text-lg font-semibold")}>
                                {t?.navHomepage ? t.navHomepage : "Trang chủ"}
                            </Link>
                        </NavigationMenuItem>

                        {/* Categories Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="text-lg font-semibold">{t?.navCategory ? t.navCategory : "Danh mục"}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {categories.map((category) => (
                                        <li key={category.categoryID}>
                                            <Link
                                                href={`/${lang}/homepage/category/${category.categorySlug}`}
                                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                            >
                                                <div className="text-sm font-medium leading-none">{category.categoryName}</div>
                                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                    {category.categoryDescription}
                                                </p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* News */}
                        <NavigationMenuItem>
                            <Link href={`/${lang}/news`} className={cn(navigationMenuTriggerStyle(), "text-lg font-semibold")}>
                                {t?.navNews ? t.navNews : "Tin tức"}
                            </Link>
                        </NavigationMenuItem>

                        {/* Contact */}
                        <NavigationMenuItem>
                            <Link href={`/${lang}/contact`} className={cn(navigationMenuTriggerStyle(), "text-lg font-semibold")}>
                                {t?.navContact ? t.navContact : "Liên hệ"}
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="items-center flex gap-x-4 w-full justify-center md:justify-end">
                    {/* <div className="hidden md:block"><Button size="sm">Tìm hiểu ngay!</Button></div> */}
                    <LanguageSwitcher />
                    <div className="flex items-center gap-x-2">
                        {/* <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M8.195 0c4.527 0 8.196 3.62 8.196 8.084a7.989 7.989 0 0 1-1.977 5.267l5.388 5.473a.686.686 0 0 1-.015.98a.71.71 0 0 1-.993-.014l-5.383-5.47a8.23 8.23 0 0 1-5.216 1.849C3.67 16.169 0 12.549 0 8.084C0 3.62 3.67 0 8.195 0Zm0 1.386c-3.75 0-6.79 2.999-6.79 6.698c0 3.7 3.04 6.699 6.79 6.699s6.791-3 6.791-6.699c0-3.7-3.04-6.698-6.79-6.698Z" /></svg>
                        </span> */}
                        <SearchForm />
                        {/* <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/20"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 19a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 8.5 19ZM19 16H7a1 1 0 0 1 0-2h8.491a3.013 3.013 0 0 0 2.885-2.176l1.585-5.55A1 1 0 0 0 19 5H6.74a3.007 3.007 0 0 0-2.82-2H3a1 1 0 0 0 0 2h.921a1.005 1.005 0 0 1 .962.725l.155.545v.005l1.641 5.742A3 3 0 0 0 7 18h12a1 1 0 0 0 0-2Zm-1.326-9l-1.22 4.274a1.005 1.005 0 0 1-.963.726H8.754l-.255-.892L7.326 7ZM16.5 19a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5Z" /></svg></span> */}
                        <ShoppingCart />
                        <WishlistDialog
                            wishlists={wishlists}
                            onRemoveItemOutWishlist={(productID, customerID) => handleRemoveItem(productID, customerID)}
                            onAddToCart={(productID, customerID) => handleAddToCart(productID, customerID)}
                            clearAll={() => { }}
                        />
                    </div>
                    <MobileDrawer />
                    {/* <div className="p-2 rounded-full bg-transparent md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024"><path fill="currentColor" d="M27 193.6c-8.2-8.2-12.2-18.6-12.2-31.2s4-23 12.2-31.2S45.6 119 58.2 119h912.4c12.6 0 23 4 31.2 12.2s12.2 18.6 12.2 31.2s-4 23-12.2 31.2s-18.6 12.2-31.2 12.2H58.2c-12.6 0-23-4-31.2-12.2zm974.8 285.2c8.2 8.2 12.2 18.6 12.2 31.2s-4 23-12.2 31.2s-18.6 12.2-31.2 12.2H58.2c-12.6 0-23-4-31.2-12.2S14.8 522.6 14.8 510s4-23 12.2-31.2s18.6-12.2 31.2-12.2h912.4c12.6 0 23 4 31.2 12.2zm0 347.4c8.2 8.2 12.2 18.6 12.2 31.2s-4 23-12.2 31.2s-18.6 12.2-31.2 12.2H58.2c-12.6 0-23-4-31.2-12.2S14.8 870 14.8 857.4s4-23 12.2-31.2S45.6 814 58.2 814h912.4c12.6 0 23 4.2 31.2 12.2z" /></svg>                </div> */}
                </div>
            </div>
        </div>

    );
}