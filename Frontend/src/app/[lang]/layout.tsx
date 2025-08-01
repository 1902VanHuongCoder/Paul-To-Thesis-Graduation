import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { Itim } from "next/font/google";
import "../globals.css";

import { use } from "react";
import { DictionaryProvider } from "@/contexts/dictonary-context";
import { LoadingProvider } from "@/contexts/loading-context";
import { ShoppingCartProvider } from "@/contexts/shopping-cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { UserProvider } from "@/contexts/user-context";
import { DiagnoseProvider } from "@/contexts/diagnose-context";
import { ChatProvider } from "@/contexts/chat-context";

const nunito = Nunito_Sans({
    variable: "--font-nunito",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
    display: "swap",
});

const itim = Itim({
    variable: "--font-itim",
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "NFeam House",
    description: "Generated by create next app",
};

export default function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: "en" | "vi" }>;
}) {
    const { lang } = use(params);
    return (
        <html lang={lang}>
            <body className={`${nunito.variable} ${itim.variable} antialiased`}>
                <DictionaryProvider lang={lang}>
                    <LoadingProvider>
                        <UserProvider>
                            <ShoppingCartProvider>
                                <WishlistProvider>
                                    <CheckoutProvider>
                                        <DiagnoseProvider>
                                            <ChatProvider>
                                            {children}
                                            </ChatProvider>
                                        </DiagnoseProvider>
                                    </CheckoutProvider>
                                </WishlistProvider>
                            </ShoppingCartProvider>
                        </UserProvider>
                    </LoadingProvider>

                </DictionaryProvider>
            </body>
        </html>
    );
}