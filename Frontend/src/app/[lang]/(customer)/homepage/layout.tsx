"use client";
import { Navigation, TopHeader, TypewriterText } from "@/components";
import { useLoading } from "@/contexts/loading-context";
import { Spinner } from "@/components/ui/spinner/spinner";

const HomepageLayout = ({ children }: { children: React.ReactNode }) => {
    const { loading, } = useLoading();
    return (
        <div className="relative max-w-screen min-h-screen overflow-hidden font-sans">
            <TopHeader />
            <Navigation />
            {loading && <div className="w-full h-full fixed inset-0 flex flex-col justify-center items-center z-100 bg-[rgba(0,0,0,.8)]">
                <Spinner variant="pinwheel" size={50} className="" stroke="#fff" />
                <TypewriterText
                    text={["Đang tải dữ liệu! Vui lòng chờ ...", "Loading data! Waiting ...", "Nfeam House"]}
                    speed={100}
                    loop={true}
                    className="md:text-[20px] font-medium font-mono text-white"
                />
            </div>}
            {children}
        </div>
    );
}

export default HomepageLayout;