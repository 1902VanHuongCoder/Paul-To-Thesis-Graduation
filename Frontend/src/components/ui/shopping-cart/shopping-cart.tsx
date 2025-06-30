"use client";
import React, { useEffect } from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader, DrawerFooter, DrawerTitle } from "@/components/ui/drawer/drawer";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import formatVND from "@/lib/format-vnd";
import { useDictionary } from "@/contexts/dictonary-context";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface CartItem {
    quantity: number;
    price: number;
    discount: number;
}
export interface Product {
    productID: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    images: string[];
    rating: number;
    createdAt: string;
    updatedAt: string;
    CartItem: CartItem;
}

export interface Cart {
    cartID: number;
    totalQuantity: number;
    products: Product[];
}

export default function ShoppingCart() {
    // Router
    const router = useRouter();

    // Contexts 
    const { cart, updateCart, setCart, removeFromCart } = useShoppingCart();
    const { dictionary: d, lang } = useDictionary();

    // State variables
    const [open, setOpen] = React.useState(false);

    // Function to handle changing product quantity 
    const handleChangeProductQuantity = (productID: number, quantity: number) => {
        // Find the current product
        const product = cart.products.find(p => p.productID === productID);
        if (!product) {
            toast.error(d?.shoppingCartProductNotFound || "Sản phẩm không tìm thấy");
            return;
        };

        // Check if the new quantity is valid
        if (quantity < 1) {
            toast.error(d?.shoppingCartQuantityError || "Số lượng sản phẩm không thể nhỏ hơn 1");
            return;
        };

        // Update the product quantity in the cart 
        const updatedProducts = cart.products.map(p => {
            if (p.productID === productID) {
                return {
                    ...p,
                    CartItem: {
                        ...p.CartItem,
                        quantity: quantity
                    }
                };
            }
            return p;
        });

        // Update the cart state and call the updateCart function
        setCart({
            ...cart,
            products: updatedProducts
        });
        updateCart(cart.cartID, productID, quantity);
    };

    // Calculate total payment 
    const totalPayment = cart && cart.products ? cart.products.length > 0 ? cart.products.reduce((sum, item) => {
        // Use sale price if available, otherwise use regular price
        const price = item.productPriceSale ? item.productPriceSale : item.productPrice; // Assuming productPriceSale is the sale price
        const quantity = item.CartItem?.quantity || 0; // Get the quantity from CartItem or default to 0
        const discount = item.CartItem?.discount || 0; // Get the discount from CartItem or default to 0

        // Apply discount if present (assuming discount is a number like 10 for 10%)
        const discountedPrice = price * (1 - discount / 100);
        return sum + discountedPrice * quantity; // Calculate total price for this item
    }, 0) : 0 : 0;

    // Fucntion to handle removing an item from the cart
    const handleRemoveItem = (productID: number) => {
        const updatedProducts = cart.products.filter(p => p.productID !== productID);
        setCart({
            ...cart,
            products: updatedProducts
        });
        removeFromCart(productID, cart.cartID);
    }

    // Effect to handle keyboard shortcut for opening the cart 
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown); // cleaner function to remove the event listener
    }, []);

    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            {/* Trigger */}
            <DrawerTrigger onClick={() => setOpen(true)} className="relative flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-200 ease-in-out cursor-pointer">
                <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/50"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 19a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 8.5 19ZM19 16H7a1 1 0 0 1 0-2h8.491a3.013 3.013 0 0 0 2.885-2.176l1.585-5.55A1 1 0 0 0 19 5H6.74a3.007 3.007 0 0 0-2.82-2H3a1 1 0 0 0 0 2h.921a1.005 1.005 0 0 1 .962.725l.155.545v.005l1.641 5.742A3 3 0 0 0 7 18h12a1 1 0 0 0 0-2Zm-1.326-9l-1.22 4.274a1.005 1.005 0 0 1-.963.726H8.754l-.255-.892L7.326 7ZM16.5 19a1.5 1.5 0 1 0 1.5 1.5a1.5 1.5 0 0 0-1.5-1.5Z" /></svg></span>
                {cart && cart.products && cart.products.length > 0 &&
                    <span className="absolute -top-1 -left-1 w-[22px] h-[22px] bg-white rounded-full flex justify-center items-center">
                        <span className="w-[20px] h-[20px] bg-secondary rounded-full text-sm animate-pulse">{cart.products.length}</span>
                    </span>
                }
            </DrawerTrigger>

            {/* Content */}
            <DrawerContent className="!w-[100%] bg-white text-black font-sans z-100">
                {/* Header */}
                <DrawerHeader className="flex items-center w-full flex-row justify-between border-b pb-4">
                    <DrawerTitle className="text-lg font-bold">
                        <p className="uppercase">{d?.shoppingCartTitle ? d.shoppingCartTitle : "Giỏ hàng"} ({cart.products?.length ? cart.products?.length : 0})</p>
                        <p className="text-gray-400 text-sm font-semibold opacity-70">Nhấn phím <b className="text-black">CTRL + M</b> để mở nhanh giỏ hàng</p>
                    </DrawerTitle>
                    <DrawerClose className="text-gray-500 hover:text-black">
                        <X size={20} />
                    </DrawerClose>
                </DrawerHeader>

                {/* Cart Items */}
                <div className="p-4 space-y-4 h-fit overflow-y-auto">
                    {cart && cart.products !== undefined ? cart.products.map((item, index) => (
                        <div key={item.productID} className={`flex items-center gap-4 ${index !== cart.products.length - 1 && 'border-b'} pb-4`}>
                            {/* Product Image */}
                            <div className="w-[60px] h-[60px] flex-shrink-0">
                                <Image
                                    src={item.images[0]} // Assuming images is an array and you want the first image
                                    alt={item.productName}
                                    width={60}
                                    height={60}
                                    className="rounded-md object-cover w-full h-full"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                                <h4 className="font-semibold max-w-[230px] truncate">{item.productName}</h4>
                                <p className={`text-sm  font-semibold ${item.productPriceSale ? 'line-through text-gray-500' : 'text-primary-hover'} `}>{item.productPrice ? formatVND(item.productPrice) + " VND" : "Liên hệ"}</p>
                                <p className="text-sm text-primary-hover">{item.productPriceSale ? formatVND(item.productPriceSale) + " VND" : ""}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity - 1)}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-6 text-center">{item?.CartItem?.quantity ? item.CartItem?.quantity : 0}</span>
                                <button
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={() => handleChangeProductQuantity(item.productID, item.CartItem.quantity + 1)}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Remove Icon */}
                            <button onClick={() => handleRemoveItem(item.productID)} className="text-gray-500 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>
                    )) : <span>{d?.shoppingCartEmpty || "Bạn chưa thêm sản phẩm nào vào giỏ hàng."}</span>}
                </div>

                {/* Footer */}
                <DrawerFooter className="border-t pt-4">

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">{d?.shoppingCartTotal ? d.shoppingCartTotal : "Tổng cộng"}: </span>
                        <span className="text-xl font-bold text-primary">{formatVND(totalPayment)} <span className="text-sm">VND</span></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            disabled={!cart.products} // Disable if no products in cart
                            onClick={() => {
                                setOpen(false); // Close the drawer
                                router.push(`/${lang}/homepage/checkout`);
                            }}
                            className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary">
                            {d?.shoppingCartCheckout ? d.shoppingCartCheckout : "Thanh toán"}
                        </button>
                        
                        <button
                            disabled={!cart.products} // Disable if no products in cart
                            onClick={
                                () => {
                                    setOpen(false); // Close the drawer
                                    router.push(`/${lang}/homepage/shopping-cart`);
                                }
                            } className="w-full py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-black">
                            {d?.shoppingCartDetailsButton ? d.shoppingCartDetailsButton : "Xem chi tiết đơn hàng"}
                        </button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}