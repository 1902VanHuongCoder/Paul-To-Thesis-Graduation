"use client"
import * as React from "react"
import Image from "next/image"
import lightlogo from "@public/images/light+logo.png";
import grazzvector from "@public/vectors/Grazz+vector.png";
import Link from "next/link";
import formatDate from "@/lib/format-date";
import { fetchNews } from "@/lib/news-apis";

type News = {
    newsID: number;
    title: string;
    subtitle?: string | null;
    titleImageUrl?: string | null;
    slug?: string;
    isPublished: boolean;
    isDraft: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
};


export const Footerdemo = () => {
    // Contexts

    const [news, setNews] = React.useState<News[]>([]);

    // Memoized fetch for performance
    React.useEffect(() => {
        const fetch = async () => {
                const res = await fetchNews();
                setNews(res);
        };
        fetch();
    }, []);

    return (
        <footer className="relative bg-primary text-foreground transition-colors duration-300 font-sans" aria-label="Site footer">
            <div className="absolute -top-1 md:-top-3 overflow-hidden w-full h-fit" aria-hidden="true">
                <Image src={grazzvector} width={800} height={1000} alt="Decorative grass vector" className="w-full h-full object-cover" priority />
            </div>
            <div className="container px-4 py-12 w-full mx-auto">
                <div className="flex flex-col gap-y-4 md:flex-row items-start md:items-center justify-between border-b-[1px] border-dashed border-white/40 pb-8">
                    <Link href="/" aria-label={"Trang chủ"}>
                        <Image 
                            src={lightlogo} 
                            width={200} 
                            height={200} 
                            style={{ height: 'auto' }} 
                            className="w-[200px] h-auto" 
                            alt={"NFeamHouse logo"} 
                            priority 
                        />
                    </Link>
                    <p className="text-white text-xl font-mono uppercase" aria-live="polite">{"TRAO NIỀM TIN NHẬN TÀI LỘC"}</p>
                    <nav aria-label="Social media" className="flex items-center gap-4 justify-center rounded-full">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white text-brown p-2 bg-secondary rounded-full">
                            {/* SVG icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white text-brown p-2 bg-secondary rounded-full">
                            {/* SVG icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17.318.077c1.218.056 2.06.235 2.838.537a5.36 5.36 0 0 1 1.956 1.274a5.36 5.36 0 0 1 1.274 1.956c.302.779.481 1.62.537 2.838C23.992 8.192 24 8.724 24 12s-.008 3.808-.077 5.318c-.056 1.218-.235 2.06-.537 2.839a5.36 5.36 0 0 1-1.274 1.955a5.359 5.359 0 0 1-1.956 1.274c-.779.302-1.62.481-2.838.537c-1.51.069-2.041.077-5.318.077c-3.277 0-3.809-.008-5.318-.077c-1.218-.056-2.06-.235-2.839-.537a5.359 5.359 0 0 1-1.955-1.274a5.36 5.36 0 0 1-1.274-1.956c-.302-.779-.481-1.62-.537-2.838C.008 15.81 0 15.278 0 12c0-3.277.008-3.81.077-5.318c.056-1.218.235-2.06.537-2.838a5.36 5.36 0 0 1 1.274-1.956A5.36 5.36 0 0 1 3.843.614C4.623.312 5.464.133 6.682.077C8.19.008 8.722 0 12 0c3.277 0 3.81.008 5.318.077ZM12 2.667c-3.24 0-3.736.007-5.197.074c-.927.042-1.483.16-1.994.359a2.73 2.73 0 0 0-1.036.673A2.707 2.707 0 0 0 3.1 4.809c-.198.51-.317 1.067-.359 1.994C2.674 8.264 2.667 8.76 2.667 12s.007 3.736.074 5.197c.042.927.16 1.483.359 1.993c.17.436.35.713.673 1.037c.324.324.601.504 1.036.673c.51.198 1.067.317 1.994.359c1.462.067 1.958.074 5.197.074c3.24 0 3.735-.007 5.197-.074c.927-.042 1.483-.16 1.994-.359a2.73 2.73 0 0 0 1.036-.673c.324-.324.504-.601.673-1.036c.198-.51.317-1.067.359-1.994c.067-1.462.074-1.958.074-5.197s-.007-3.735-.074-5.197c-.042-.927-.16-1.483-.359-1.993a2.709 2.709 0 0 0-.673-1.037A2.708 2.708 0 0 0 19.19 3.1c-.51-.198-1.067-.317-1.994-.359c-1.461-.067-1.957-.074-5.197-.074Zm0 15.555a6.222 6.222 0 1 1 0-12.444a6.222 6.222 0 0 1 0 12.444Zm0-2.666a3.556 3.556 0 1 0 0-7.112a3.556 3.556 0 0 0 0 7.112Zm6.222-8.445a1.333 1.333 0 1 1 0-2.667a1.333 1.333 0 0 1 0 2.667Z" /></svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white text-brown p-2 bg-secondary rounded-full">
                            {/* SVG icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m5.939 7.713v.646a.37.37 0 0 1-.38.37a5.364 5.364 0 0 1-2.903-1.108v4.728a3.938 3.938 0 0 1-1.18 2.81a4.011 4.011 0 0 1-2.87 1.17a4.103 4.103 0 0 1-2.862-1.17a3.98 3.98 0 0 1-1.026-3.805c.159-.642.48-1.232.933-1.713a3.58 3.58 0 0 1 2.79-1.313h.82v1.703a.348.348 0 0 1-.39.348a1.918 1.918 0 0 0-1.23 3.631c.27.155.572.246.882.267c.24.01.48-.02.708-.092a1.928 1.928 0 0 0 1.313-1.816V5.754a.359.359 0 0 1 .359-.36h1.415a.359.359 0 0 1 .359.34a3.303 3.303 0 0 0 1.282 2.245a3.25 3.25 0 0 0 1.641.636a.37.37 0 0 1 .338.35z" /></svg>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-white text-brown p-2 bg-secondary rounded-full">
                            {/* SVG icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 840 600"><path fill="currentColor" d="M422 2q101 0 171 4t116 16t71 33t37 57t15 86t2 121l-2 121q-1 50-15 86t-37 56t-71 34t-116 16t-171 4t-171-4t-116-16t-71-34t-37-56t-14-86t-3-121t3-121t14-86t37-57t71-33T251 6t171-4zm132 331q12-6 12-14t-12-14l-185-86q-12-6-20-1t-9 20v162q0 14 9 19t20 0z" /></svg>
                        </a>
                    </nav>
                </div>
                <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-3 py-8 text-white max-w-screen overflow-hidden border-b-[1px] border-dashed border-white/40">
                    <section aria-labelledby="contact-heading">
                        <h3 id="contact-heading" className="mb-4 text-lg font-semibold">{"Liên hệ với chúng tôi"}</h3>
                        <div className="flex items-start gap-6 flex-col">
                            {/* Phone */}
                            <div className="flex items-center gap-2">
                                <span className="" aria-hidden="true"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 26 26"><path fill="#F8C32C" d="M22.386 18.026c-1.548-1.324-3.119-2.126-4.648-.804l-.913.799c-.668.58-1.91 3.29-6.712-2.234c-4.801-5.517-1.944-6.376-1.275-6.951l.918-.8c1.521-1.325.947-2.993-.15-4.71l-.662-1.04C7.842.573 6.642-.552 5.117.771l-.824.72c-.674.491-2.558 2.087-3.015 5.119c-.55 3.638 1.185 7.804 5.16 12.375c3.97 4.573 7.857 6.87 11.539 6.83c3.06-.033 4.908-1.675 5.486-2.272l.827-.721c1.521-1.322.576-2.668-.973-3.995l-.931-.801z" /></svg></span>
                                <span className="text-sm">+84 334745377</span>
                            </div>
                            {/* Email */}
                            <div className="flex items-center gap-2">
                                <span className="" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="#F8C32C" d="M17.25 2.75H6.75A4.75 4.75 0 0 0 2 7.5v9a4.75 4.75 0 0 0 4.75 4.75h10.5A4.76 4.76 0 0 0 22 16.5v-9a4.76 4.76 0 0 0-4.75-4.75m-3.65 8.32a3.26 3.26 0 0 1-3.23 0L3.52 7.14a3.25 3.25 0 0 1 3.23-2.89h10.5a3.26 3.26 0 0 1 3.23 2.89z" /></svg></span>
                                <span className="text-sm">nfeamhouse@gmail.com</span>
                            </div>
                            {/* Location */}
                            <div className="flex items-center gap-2">
                                <span className="" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><path fill="#F8C32C" d="M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4a2 2 0 0 0 0 4z" /></svg></span>
                                <span className="text-sm">{"30/04, phường Hưng Lợi, quận Ninh Kiều, Cần Thơ"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="" aria-hidden="true">
                                    <svg width="16" height="16" fill="#F8C32C" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>time</title> <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM14.016 16v-5.984q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408v4h4q0.8 0 1.408 0.576t0.576 1.408-0.576 1.44-1.408 0.576h-6.016q-0.832 0-1.408-0.576t-0.576-1.44z"></path> </g></svg></span>
                                <span className="text-sm">{"Từ thứ hai - thứ sáu, 8:00 AM - 17:00 PM"}</span>
                            </div>
                        </div>
                    </section>
                    <section aria-labelledby="news-heading">
                        <h3 id="news-heading" className="mb-4 text-lg font-semibold">{"Bài đăng mới"}</h3>
                        <div className="flex flex-col gap-4">
                            {news.slice(0, 3).map((item) => (
                                <article key={item.newsID} className="flex items-center gap-2 mb-4 md:mb-0" aria-label={item.title}>
                                    <div className="max-w-[50px] h-[50px] bg-white rounded-md overflow-hidden shrink-0">
                                        {item.titleImageUrl && (
                                            <Image
                                                src={item.titleImageUrl}
                                                alt={item.title}
                                                width={50}
                                                height={50}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                    <div className="text-sm">
                                        <Link href={`/vi/homepage/news/${item.newsID}`} className="hover:text-white/60 cursor-pointer uppercase text-[12px]" aria-label={item.title}>
                                            {item.title}
                                        </Link>
                                        <p className="text-secondary" aria-label={formatDate(item.createdAt)}>{formatDate(item.createdAt)}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                    <section aria-labelledby="quicklink-heading" className="relative">
                        <h3 id="quicklink-heading" className="mb-4 text-lg font-semibold">{"Liên kết nhanh"}</h3>
                        <ul className="font-normal space-y-2">
                            <li className="flex items-center gap-x-2 cursor-pointer"><Link href="/" aria-label={"Trang chủ"}>{"Trang chủ"}</Link></li>
                            <li className="flex items-center gap-x-2 cursor-pointer"><Link href={`/vi/news`} aria-label={"Tin tức"}>{"Tin tức"}</Link></li>
                            <li className="flex items-center gap-x-2 cursor-pointer"><Link href={`/vi/contact`} aria-label={"Liên hệ"}>{"Liên hệ"}</Link></li>
                        </ul>
                    </section>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 pt-8 text-center md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © 2024 NFeamHouse. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footerdemo 