// This template requires the Embla Auto Scroll plugin to be installed:
// npm install embla-carousel-auto-scroll

"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "./carousel";
import Image from "next/image";
import { useDictionary } from "@/contexts/dictonary-context";
import { useEffect, useState } from "react";
import { baseUrl } from "@/lib/base-url";

interface Origin {
    originID: string;
    originName: string;
    originImage: string;
    className?: string;
}

const ParterCarousel = () => {
    // Contexts
    const { dictionary } = useDictionary(); // Dictionary context to get the text in different languages
    
    // State variables 
    const [origins, setOrigins] = useState<Origin[]>([]); // State to store the origins data

    // Fetch origins data when the component mounts
    useEffect(() => {
        const fetchOrigins = async () => {
            try{
                fetch(`${baseUrl}/api/origin`).then((res)=>res.json()).then((data)=> setOrigins(data));
            }catch(error){
                console.error("Error fetching origins:", error); 
            }
        }
        fetchOrigins();
    },[])
    return (
        <section className="py-20 w-full font-sans border-t-1 border-primary/10">
            <div className="flex flex-col items-center text-center w-full px-6">
                <h1 className="my-6 text-pretty text-2xl font-bold lg:text-4xl">    
                    {dictionary?.partnerCarouselTitle || "Sự đồng hành của các thương hiệu uy tín"}
                </h1>
            </div>
            <div className="pt-10 md:pt-16">
                <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
                    <Carousel
                        opts={{ loop: true }}
                        plugins={[AutoScroll({ playOnInit: true })]}
                    >
                        <CarouselContent className="ml-0">
                            {origins.length > 0 && origins.map((logo) => (
                                <CarouselItem
                                    key={logo.originID}
                                    className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                                >
                                    <div className="mx-10 flex shrink-0 items-center justify-center">
                                        <div>
                                            <Image
                                                width={100}
                                                height={100}
                                                src={logo.originImage}
                                                alt={logo.originName}
                                                className={logo.className}
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"></div>
                </div>
            </div>
        </section>
    );
};

export default ParterCarousel;
