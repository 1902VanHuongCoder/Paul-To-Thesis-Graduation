"use client";

import { Footer, Navigation, TopHeader } from "@/components";
import { Toaster } from "react-hot-toast";
import Head from "next/head";


const HomepageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Head>
                <meta name="description" content="NFeam House - Nền tảng nông nghiệp thông minh, cung cấp giải pháp quản lý, tư vấn, và kết nối cho nhà nông hiện đại." />
            </Head>
            <div className="relative max-w-screen min-h-screen overflow-hidden font-sans">
                <Toaster position="top-right" />
                <TopHeader />
                <Navigation />
                {children}
                <Footer />
            </div>
        </>
    );
}

export default HomepageLayout;