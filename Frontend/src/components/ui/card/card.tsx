"use client";
import React from "react";
import Image from "next/image";
import formatVND from "@/lib/others/format-vnd";
import { useShoppingCart } from "@/contexts/shopping-cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useUser } from "@/contexts/user-context";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog/dialog";
// Removed framer-motion. Will use manual animation.
import Link from "next/link";
import NoImage from "@public/images/NoImage.jpg";
import toast from "react-hot-toast";

interface CardProps {
    productID: number;
    productName: string;
    image: string;
    title: string;
    discountPrice: number;
    price: number;
    rating: number; // Rating out of 5
}
export const Card = ({
    image,
    title,
    discountPrice,
    price,
    rating,
    productID,
}: CardProps) => {
    const [showContactDialog, setShowContactDialog] = useState(false);
    const { addToCart } = useShoppingCart();
    const { addToWishlist } = useWishlist();
    const { user } = useUser();
    const [flyAnim, setFlyAnim] = useState<{ x: number; y: number } | null>(null);
    const [flyImage, setFlyImage] = useState<string>("");

    const handleAddToCart = React.useCallback((e?: React.MouseEvent) => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
            return;
        }
        if (!price && !discountPrice) {
            setShowContactDialog(true);
            return;
        }
        addToCart(productID, 1);
        if (e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setFlyAnim({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            setFlyImage(image);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [user, price, discountPrice, addToCart, productID, image]);

    const handleAddToWishList = React.useCallback(() => {
        if (!user){
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
            return;
        } 
        if (!price && !discountPrice) {
            setShowContactDialog(true);
            return;
        }
        addToWishlist(user.userID, productID);
    }, [user, price, discountPrice, addToWishlist, productID]);

    // Keyboard accessibility for buttons
    const handleKeyDown = (handler: () => void) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
        }
    };

    return (
        <article className="rounded-xl overflow-hidden bg-transparent hover:shadow-2xl/10 min-w-[15rem] w-full border-[.5px] hover:border-none transition-all border-primary/20 border-solid font-sans cursor-pointer" aria-label={title}>
            <Link href={`/vi/homepage/product-details/${productID}`} aria-label={title} tabIndex={0}>
                <Image
                    src={image ? image : NoImage}
                    alt={title}
                    width={500}
                    height={300}
                    className={`w-full h-48 ${image ? 'object-contain' : 'object-cover'} p-2 pt-8`}
                    loading="lazy"
                    priority={false}
                />
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate" tabIndex={0}>{title}</h3>
                    <div className="flex items-center gap-x-4 mt-2 font-mono">
                        <span className={`${discountPrice ? 'text-primary-hover font-bold text-md' : 'hidden'}`}>{discountPrice && formatVND(discountPrice) + " VND"}</span>
                        <span className={`${price && !discountPrice ? "text-primary-hover font-bold text-md" : 'text-primary/50 line-through'} ${!price && !discountPrice && 'hidden'}`}>{formatVND(price) + " VND"}</span>
                        <span className={`${!price && !discountPrice ? "text-primary-hover font-bold text-md" : 'hidden'}`}>Liên hệ</span>
                    </div>
                    <div className="flex items-center mt-2" aria-label={`Đánh giá: ${rating} trên 5`}>
                        {Array.from({ length: 5 }, (_, index) => {
                            if (index < Math.floor(rating)) {
                                return (
                                    <span key={index} className="text-yellow-400" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>
                                    </span>
                                );
                            } else if (index < rating) {
                                return (
                                    <span key={index} className="text-yellow-400" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.951 9.67a1 1 0 0 0-.807-.68l-5.699-.828l-2.548-5.164A.978.978 0 0 0 12 2.486v16.28l5.097 2.679a1 1 0 0 0 1.451-1.054l-.973-5.676l4.123-4.02a1 1 0 0 0 .253-1.025z" opacity=".5" /><path fill="currentColor" d="M11.103 2.998L8.555 8.162l-5.699.828a1 1 0 0 0-.554 1.706l4.123 4.019l-.973 5.676a1 1 0 0 0 1.45 1.054L12 18.765V2.503a1.028 1.028 0 0 0-.897.495z" /></svg>
                                    </span>
                                );
                            } else {
                                return (
                                    <span key={index} className="text-gray-300" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10.1c.1-.5-.3-1.1-.8-1.1l-5.7-.8L12.9 3c-.1-.2-.2-.3-.4-.4c-.5-.3-1.1-.1-1.4.4L8.6 8.2L2.9 9c-.3 0-.5.1-.6.3c-.4.4-.4 1 0 1.4l4.1 4l-1 5.7c0 .2 0 .4.1.6c.3.5.9.7 1.4.4l5.1-2.7l5.1 2.7c.1.1.3.1.5.1h.2c.5-.1.9-.6.8-1.2l-1-5.7l4.1-4c.2-.1.3-.3.3-.5z" /></svg>
                                    </span>
                                );
                            }
                        })}
                        <span className="text-gray-500 ml-2 text-sm self-end" aria-label={`(${rating}/5)`}>({rating}/5)</span>
                    </div>
                </div>
            </Link>
            <div className="flex items-center justify-start gap-x-4 px-4 pb-4" role="group" aria-label="Product actions">
                <button
                    onClick={e => { e.stopPropagation(); handleAddToCart(e); }}
                    onKeyDown={handleKeyDown(() => handleAddToCart())}
                    className="p-2 hover:bg-primary group cursor-pointer transition-all bg-white rounded-full shadow border-primary/30 border-solid border-[1px]"
                    aria-label="Thêm vào giỏ hàng"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-primary group-hover:text-white lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                </button>
                <button
                    onClick={e => { e.stopPropagation(); handleAddToWishList(); }}
                    onKeyDown={handleKeyDown(handleAddToWishList)}
                    className="p-2 hover:bg-primary group cursor-pointer transition-all bg-white rounded-full shadow border-primary/30 border-solid border-[1px]"
                    aria-label="Thêm vào danh sách yêu thích"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-primary group-hover:fill-white lucide-heart-icon lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </button>
                <Link 
                    href={`/vi/homepage/product-details/${productID}`}
                    className="p-2 hover:bg-primary group cursor-pointer transition-all bg-white rounded-full shadow border-primary/30 border-solid border-[1px]"
                    aria-label="Xem chi tiết sản phẩm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-primary group-hover:text-white lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                </Link>
            </div>
<<<<<<< HEAD
            <AnimatePresence>
                {flyAnim && (
                    <motion.div
                        initial={{
                            position: 'fixed',
                            left: flyAnim.x,
                            top: flyAnim.y,
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            zIndex: 9999,
                        }}
                        animate={{
                            left: window.innerWidth - 180,
                            top: 95,
                            width: 30,
                            height: 30,
                            opacity: 0.7,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        style={{
                            pointerEvents: 'none',
                            position: 'fixed',
                            backgroundImage: `url(${flyImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 12,
                            width: 50,
                            height: 50,
                            zIndex: 9999,
                        }}
                        onAnimationComplete={() => setFlyAnim(null)}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>
=======
            {flyAnim && (
                <Image
                    src={flyImage}
                    width={50}
                    height={50}
                    style={{
                        position: 'fixed',
                        left: flyAnim.x,
                        top: flyAnim.y,
                        borderRadius: 12,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        opacity: 1,
                        transition: 'all 0.8s ease-in-out',
                    }}
                    alt="Fly to cart animation"
                    aria-hidden="true"
                    onTransitionEnd={() => setFlyAnim(null)}
                />
            )}
>>>>>>> 3ba2e34c1f1780838f0a0b3168f8d0df5ab526b2
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="font-sans">
                    <DialogHeader>
                        <DialogTitle>Liên hệ để biết thêm về giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng liên hệ với chúng tôi để biết thêm thông tin về giá sản phẩm này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col gap-y-2">
                        <p>
                            Số điện thoại: <a href="tel:0334745378" className="text-blue-600 underline">0334745378</a>
                        </p>
                        <p>
                            Email: <a href="mailto:nfeamhouse@gmail.com" className="text-blue-600 underline">nfeamhouse@gmail.com</a>
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button className="mt-4 bg-gray-200 px-4 py-2 rounded" aria-label="Đóng">Đóng</button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </article>
    );
};

export default Card;