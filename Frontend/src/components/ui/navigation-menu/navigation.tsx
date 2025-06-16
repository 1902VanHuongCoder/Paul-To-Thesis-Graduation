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
import SignUpForm from "@/components/section/signup-page/signup-page";
import LoginForm from "@/components/section/login-page/login-page";
import { useUser } from "@/contexts/user-context";
import UserDrawer from "../drawer/user-drawer";

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
    const { user, logout } = useUser();
    const [categories, setCategories] = useState<Category[]>([]);
    const { lang, dictionary: t } = useDictionary();
    const { wishlists, removeFromWishlist, setWishlist } = useWishlist();
    const { addToCart, fetchCart } = useShoppingCart();
    const [openSignUpForm, setOpenSignUpForm] = useState(false);
    const [openLoginForm, setOpenLoginForm] = useState(false);
    const [openUserDrawer, setOpenUserDrawer] = useState(false);


    // Example handlers
    const handleRemoveItem = (productID: number, customerID: string) => {
        removeFromWishlist(customerID, productID);
        const wishlistUpdated = wishlists.filter((item) => item.productID !== productID);
        setWishlist(wishlistUpdated);
    };

    const handleAddToCart = async (productID: number, customerID: string) => {
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
                            <Link href="/" className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}>
                                {t?.navHomepage ? t.navHomepage : "Trang chủ"}
                            </Link>
                        </NavigationMenuItem>

                        {/* Categories Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="text-md font-semibold">{t?.navCategory ? t.navCategory : "Danh mục"}</NavigationMenuTrigger>
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
                            <Link href={`/${lang}/news`} className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}>
                                {t?.navNews ? t.navNews : "Tin tức"}
                            </Link>
                        </NavigationMenuItem>

                        {/* Contact */}
                        <NavigationMenuItem>
                            <Link href={`/${lang}/contact`} className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}>
                                {t?.navContact ? t.navContact : "Liên hệ"}
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="items-center flex gap-x-4 w-full justify-center md:justify-end">
                    <LanguageSwitcher />
                    <div className="flex items-center gap-x-2">
                        <SearchForm />
                        {
                            user && (
                                <>
                                    <ShoppingCart />
                                    <WishlistDialog
                                        wishlists={wishlists}
                                        onRemoveItemOutWishlist={(productID, customerID) => handleRemoveItem(productID, customerID)}
                                        onAddToCart={(productID, customerID) => handleAddToCart(productID, customerID)}
                                        clearAll={() => { }}
                                    />
                                </>
                            )
                        }

                        {user ? (
                            <UserDrawer
                                user={user}
                                open={openUserDrawer}
                                setOpen={() => setOpenUserDrawer(!openUserDrawer)}
                                logout={() => {
                                    logout();
                                    setOpenSignUpForm(false);
                                    setOpenLoginForm(false);
                                }} />
                        ) : (<>
                            <LoginForm open={openLoginForm} setOpen={setOpenLoginForm} setOpenSignUpForm={setOpenSignUpForm} />
                            <SignUpForm open={openSignUpForm} setOpen={setOpenSignUpForm} setOpenLoginForm={setOpenLoginForm} />
                        </>

                        )}
                    </div>
                    <MobileDrawer />
                </div>
            </div>
        </div>

    );
}