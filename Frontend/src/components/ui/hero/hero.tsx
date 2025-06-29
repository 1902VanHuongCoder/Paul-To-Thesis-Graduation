import { TypewriterText } from '@/components'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast';
import background01 from "@public/images/hero-background-01.png";
import background02 from "@public/images/hero-background-02.jpg";
import background03 from "@public/images/hero-background-03.jpg";
import background04 from "@public/images/hero-background-04.jpg";
import vector02 from "@public/vectors/Vector+02.png";
import { useDictionary } from '@/contexts/dictonary-context';
import { Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
    // Contexts 
    const { dictionary } = useDictionary(); // Dictionary context to get the text in different languages

    // State to control the hero animation 
    const [heroAnimation, setHeroAnimation] = React.useState(true);
    const [bgIndex, setBgIndex] = React.useState(0);

    // Function to toggle the hero animation and show a success message
    const handleStopHeroAnimation = () => {
        setHeroAnimation(!heroAnimation);
        toast.success(heroAnimation ? dictionary?.stopHeroAnimationSuccess || "Dừng hiệu ứng thành công" : dictionary?.startHeroAnimationSuccess || "Chạy hiệu ứng thành công");
    };

    // List of hero background images to change every 8 seconds
    const heroBackgroundList = [background01, background02, background03, background04];

    // Effect to change the background image every 8 seconds if heroAnimation is true 
    React.useEffect(() => {
        // If heroAnimation is false, do not change the background image
        if (!heroAnimation) return; 

        // Set an interval to change the background image every 8 seconds
        const interval = setInterval(() => { 
            setBgIndex((prev) => (prev + 1) % heroBackgroundList.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [heroAnimation, heroBackgroundList.length]);

    return (
        <div className="relative w-full h-[400px] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={bgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={heroBackgroundList[bgIndex]}
                        alt={`Hero Background ${bgIndex + 1}`}
                        className="object-cover w-full h-full"
                        fill
                        priority
                    />
                </motion.div>
            </AnimatePresence>
            <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,.5)]"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-1 md:px-20 px-10">
                <TypewriterText
                    text={["LÚA TỐT NHÀ NÔNG VUI", "CANH TÁC THÔNG MINH CHẲNG LO LÚA ỐM", "NFEAM HOUSE SỰ LỰA CHỌN HOÀN HẢO"]}
                    speed={100}
                    loop={heroAnimation}
                    className="text-[40px] md:text-[80px] font-medium font-mono text-white"
                />
            </div>
            <div className="absolute -bottom-5 md:-bottom-7 left-0 w-full h-auto z-1">
                <Image src={vector02} alt="Logo" className="mb-4 w-full h-auto" />
            </div>
            <button onClick={handleStopHeroAnimation} className="z-20 bg-white absolute right-3 bottom-12 flex items-center gap-x-2 py-2 px-4 rounded-md cursor-pointer group hover:bg-primary hover:shadow-lg hover:drop-shadow-amber-50 transition-all"><Hand className="group-hover:text-white" /> <span className="font-bold group-hover:text-white">{heroAnimation ? dictionary?.stopHeroAnimationButton || "Dừng hiệu ứng" : dictionary?.startHeroAnimationButton || "Chạy hiệu ứng"}</span></button>
        </div>
    )
}

export default Hero