"use client";
import { Navigation, TopHeader } from "@/components";

const HomepageLayout = ({ children, params }: { children: React.ReactNode; params: {lang:"en" | "vi"}; }) => {
    return (
        <div className="max-w-screen min-h-screen overflow-hidden">
            <TopHeader params={params} />
            <Navigation params={params} />
            {children}
        </div>
    );
}

export default HomepageLayout;