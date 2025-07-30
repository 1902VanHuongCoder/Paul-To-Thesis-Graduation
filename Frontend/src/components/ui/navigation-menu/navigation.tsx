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
import { cn } from "@/lib/others/utils";
import dynamic from "next/dynamic";
const SearchForm = dynamic(() => import("@/components/ui/search-form/search-form"), { ssr: false });
import ShoppingCart from "../shopping-cart/shopping-cart";
import WishlistDialog from "../dialog/wishlist-dialog";
import MobileDrawer from "../drawer/mobile-drawer";
import { useWishlist } from "@/contexts/wishlist-context";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import SignUpForm from "@/components/section/signup-page/signup-page";
import LoginForm from "@/components/section/login-page/login-page";
import { useUser } from "@/contexts/user-context";
import UserDrawer from "../drawer/user-drawer";
import { fetchCategories } from "@/lib/category-apis";
import { Badge } from "../badge/badge";
import Button from "../button/button-brand";

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
    // Contexts
    const { user, logout } = useUser(); // User context to manage user state
    const { addToCart, fetchCart } = useShoppingCart(); // Shopping cart context to manage cart operations
    const { wishlists, removeFromWishlist, setWishlist } = useWishlist(); // Wishlist context to manage wishlist operations

    // State variables
    const [categories, setCategories] = useState<Category[]>([]); // List of categories fetched from the API 
    const [openSignUpForm, setOpenSignUpForm] = useState(false); // State to control the visibility of the sign-up form
    const [openLoginForm, setOpenLoginForm] = useState(false); // State to control the visibility of the login form
    const [openUserDrawer, setOpenUserDrawer] = useState(false); // State to control the visibility of the user drawer (user profile, settings, etc.)
    const [isClient, setIsClient] = useState(false); // State to track if component is mounted on client


    // Memoized handlers for performance
    const handleRemoveItem = React.useCallback((productID: number, customerID: string) => {
        removeFromWishlist(customerID, productID);
        setWishlist(wishlists.filter((item) => item.productID !== productID));
    }, [removeFromWishlist, setWishlist, wishlists]);

    const handleAddToCart = React.useCallback(async (productID: number, customerID: string) => {
        addToCart(productID, 1);
        fetchCart(customerID);
        removeFromWishlist(customerID, productID);
        setWishlist(wishlists.filter((item) => item.productID !== productID));
    }, [addToCart, fetchCart, removeFromWishlist, setWishlist, wishlists]);

    // Fetch categories from the API when the component mounts 
    useEffect(() => {
        setIsClient(true); // Mark as client-side rendered
        const fetchCategoriesData = async () => {
            const categoriesData = await fetchCategories();
            setCategories(categoriesData);
        }
        fetchCategoriesData();
    }, []);

    return (
        <nav className="relative w-full h-fit font-sans shadow-lg" aria-label="Main navigation">
            <div className="absolute -bottom-6 left-0 w-full h-auto z-1" aria-hidden="true">
                <Image src={vector02} width={1000} height={100} alt="" className="mb-4 w-full h-auto" priority />
            </div>
            <div className="relative z-2 flex flex-col md:flex-row items-center justify-between bg-white font-sans text-primary md:px-6 pb-4 md:pt-4 md:pb-2">
                <Link href="/" aria-label={"Trang chủ"}>
                    <Image src={darkLogo} alt={"Logo NFeam House"} width={200} height={100} className="mb-6 mt-4 md:mt-0 md:mb-4 w-[250px] h-auto md:w-[400px] translate-x-5 md:translate-x-0" priority />
                </Link>
                {/* Only render NavigationMenu on client to avoid hydration mismatch */}
                {isClient && (
                    <NavigationMenu className="hidden md:block" aria-label={"Menu"}>
                        <NavigationMenuList>
                            {/* Home */}
                            <NavigationMenuItem>
                                <Link href="/" className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}
                                    aria-current="page">
                                    {"Trang chủ"}
                                </Link>
                            </NavigationMenuItem>
                            {/* Categories Dropdown */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-md font-semibold" aria-haspopup="menu">
                                    {"Danh mục"}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]" aria-label={"Danh mục"}>
                                        {categories.map((category) => (
                                            <li key={category.categoryID}>
                                                <Link
                                                    href={`/vi/homepage/category/${category.categorySlug}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    aria-label={category.categoryName}
                                                >
                                                    <div className="text-sm font-medium leading-none">{category.categoryName}</div>
                                                    <p className="text-sm leading-snug text-muted-foreground line-clamp-1">
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
                                <Link href={`/vi/homepage/news`} className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}
                                    aria-label={"Tin tức"}>
                                    {"Tin tức"}
                                </Link>
                            </NavigationMenuItem>
                            {/* Contact */}
                            <NavigationMenuItem>
                                <Link href={`/vi/homepage/contact`} className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}
                                    aria-label={"Liên hệ"}>
                                    {"Liên hệ"}
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href={`/vi/homepage/detect-rice-disease`} className={cn(navigationMenuTriggerStyle(), "text-md font-semibold")}
                                    aria-label={"Chẩn đoán bệnh lúa"}>
                                    <Badge className="bg-red-500 text-white mr-2">New</Badge>
                                    <span>{"Chẩn đoán bệnh lúa"}</span>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                )}
                <div className="items-center flex gap-x-4 w-full justify-center md:justify-end">
                    {/* <LanguageSwitcher /> */}
                    <div className="flex items-center gap-x-2">
                        <SearchForm />
                        {user && (
                            <>
                                <ShoppingCart />
                                <WishlistDialog
                                    wishlists={wishlists}
                                    onRemoveItemOutWishlist={handleRemoveItem}
                                    onAddToCart={handleAddToCart}
                                    clearAll={() => { }}
                                />
                            </>
                        )}
                        {user ? (
                            <UserDrawer
                                user={user}
                                open={openUserDrawer}
                                setOpen={() => setOpenUserDrawer(!openUserDrawer)}
                                logout={() => {
                                    logout();
                                    setOpenSignUpForm(false);
                                    setOpenLoginForm(false);
                                }}
                            />
                        ) : (
                            <>
                                <Button variant="primary" size="sm" onClick={() => setOpenLoginForm(true)}>
                                    Đăng nhập
                                </Button>
                                <LoginForm open={openLoginForm} setOpen={setOpenLoginForm} setOpenSignUpForm={setOpenSignUpForm} />
                                <Button variant="normal" size="sm" className="py-3" onClick={() => setOpenSignUpForm(true)}>
                                    Đăng ký
                                </Button>
                                <SignUpForm open={openSignUpForm} setOpen={setOpenSignUpForm} setOpenLoginForm={setOpenLoginForm} />
                            </>
                        )}
                    </div>
                    <MobileDrawer />
                </div>
            </div>
        </nav>
    );
}