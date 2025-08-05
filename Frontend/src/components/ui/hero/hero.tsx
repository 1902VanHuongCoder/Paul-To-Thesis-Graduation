import { TypewriterText } from '@/components'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast';
import background01 from "@public/images/hero-background-01.png";
import background02 from "@public/images/hero-background-02.jpg";
import background03 from "@public/images/hero-background-03.jpg";
import background04 from "@public/images/hero-background-04.jpg";
import vector02 from "@public/vectors/Vector+02.png";
import { Hand } from 'lucide-react';

const Hero = () => {
    // State to control the hero animation 
    const [heroAnimation, setHeroAnimation] = React.useState(true);
    const [bgIndex, setBgIndex] = React.useState(0);
    // Memoize background list to avoid re-creating on every render
    const heroBackgroundList = React.useMemo(() => [background01, background02, background03, background04], []);
    // Function to toggle the hero animation and show a success message
    const handleStopHeroAnimation = () => {
        toast.success(heroAnimation ? "Dừng hiệu ứng thành công" : "Chạy hiệu ứng thành công");
        setHeroAnimation((prev) => !prev);
    };

    // Effect to change the background image every 8 seconds if heroAnimation is true 
    React.useEffect(() => {
        if (!heroAnimation) return;
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % heroBackgroundList.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [heroAnimation, heroBackgroundList.length]);
    return (
        <section
            className="relative w-full h-[400px] overflow-hidden"
            aria-label={"Banner quảng bá NFEAM HOUSE"}
        >
            {/* Manual fade animation for background images */}
            {heroBackgroundList.map((bg, idx) => (
                <Image
                    key={idx}
                    src={bg}
                    alt={`Ảnh nền ${idx + 1}`}
                    style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        inset: 0,
                        opacity: bgIndex === idx ? 1 : 0,
                        transition: "opacity 1s",
                        zIndex: 0,
                    }}
                    fill
                    priority={bgIndex === idx}
                    sizes="100vw"
                    aria-hidden="true"
                />
            ))}
            <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,.5)]" aria-hidden="true"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-1 md:px-20 px-10">
                <h1 className="sr-only">{"NFEAM HOUSE - Nông nghiệp thông minh"}</h1>
                <TypewriterText
                    text={[
                        "LÚA TỐT NHÀ NÔNG VUI",
                        "CANH TÁC THÔNG MINH CHẲNG LO LÚA ỐM",
                        "NFEAM HOUSE SỰ LỰA CHỌN HOÀN HẢO"
                    ]}
                    speed={100}
                    loop={heroAnimation}
                    className="text-[40px] md:text-[80px] font-medium font-mono text-white"
                />
            </div>
            <div className="absolute -bottom-5 md:-bottom-7 left-0 w-full h-auto z-1" aria-hidden="true">
                <Image src={vector02} alt={"Vector trang trí"} className="mb-4 w-full h-auto" priority />
            </div>
            <button
                onClick={handleStopHeroAnimation}
                className="z-20 bg-white absolute right-3 bottom-12 flex items-center gap-x-2 py-2 px-4 rounded-md cursor-pointer group hover:bg-primary hover:shadow-lg hover:drop-shadow-amber-50 transition-all"
                aria-pressed={heroAnimation}
                aria-label={heroAnimation ? ("Dừng hiệu ứng") : ("Chạy hiệu ứng")}
            >
                <Hand className="group-hover:text-white" aria-hidden="true" />
                <span className="font-bold group-hover:text-white">
                    {heroAnimation ? "Dừng hiệu ứng" : "Chạy hiệu ứng"}
                </span>
            </button>
        </section>
    );
}

export default Hero