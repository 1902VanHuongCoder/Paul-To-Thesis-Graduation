"use client";
import { Button, Card, CashFilter, CategoryFilter, ChatBot, CustomPagination, DisplayModeSwitcher, Footer, IconButton, NewestProduct, ParterCarousel, SortDropdown, TagFilter, ToTopButton, TypewriterText } from "@/components";
import { Funnel, Hand } from "lucide-react";
import React, { useEffect } from "react";
import greenField from "@public/images/rice-banner.png";
import Image from "next/image";
import vector02 from "@public/vectors/Vector+02.png";
import { baseUrl } from "@/lib/base-url";
import { useDictionary } from "@/contexts/dictonary-context";
import { useLoading } from "@/contexts/loading-context";
interface Category {
    categoryDescription: string,
    categoryID: number,
    categoryName : string,
    categorySlug: string,
    count: number,
    createdAt: string,
    updatedAt: string,
}

interface Product {
    productID: number;
    productName: string;
    productPrice: string;
    productPriceSale: string;
    quantityAvailable: number;
    categoryID: number;
    originID: number; 
    subcategoryID: number;
    images: string[];
    rating: number;
}

interface Tag {
    tagID: number;
    tagName: string; 
}

const Homepage = () => {
    const { dictionary } = useDictionary();
    const { setLoading} = useLoading();
    const [showFilterKit, setShowFilterKit] = React.useState(false);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [heroAnimation, setHeroAnimation] = React.useState(true);

    const displayModeProps = {
        totalResults: 50,
        currentPage: 1,
        resultsPerPage: 15,
        onViewChange: (view: "grid" | "list") => {
            // handle view change
            console.log("Switched to", view, "view");
        },
    };

    const sortOptions = [
        dictionary?.sortDropdownDV || "Mặc định",
        dictionary?.sortDropdownIn || "Giá tăng dần",
        dictionary?.sortDropdownDe || "Giá giảm dần",
        dictionary?.sortDropdownHR || "Đánh giá cao",
    ];

    const handleSortingProducts = (option: string) => {
        // handle sorting logic
        console.log("Sorted by", option);
    };

    const hanleChangePage = (page: number) => {
        // handle page change
        console.log("Changed to page", page);
    };

    const handleStopHeroAnimation = () => {
        setHeroAnimation(!heroAnimation);
    };

    useEffect(() => {
        if (!showFilterKit) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [showFilterKit]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                await fetch(`${baseUrl}/api/category`).then((res) => res.json()).then((data) => setCategories(data));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        const fetchTags = async () => {
            try {
                await fetch(`${baseUrl}/api/tag`).then((res) => res.json()).then((data) => setTags(data));  
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        }
        const fetchProducts = async () => {
            try{
                await fetch(`${baseUrl}/api/product`).then((res) => res.json()).then((data) => setProducts(data));
            }catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        setLoading(true);
        fetchCategories();
        fetchTags();
        fetchProducts();
        setLoading(false);
    },[]);
    // setLoading(true);
    return (
        <div className="relative mx-auto">
            {/* Hero */}
            <div className="relative w-full h-[400px]">
                <Image src={greenField} alt="Green Field" className="object-cover w-full h-full" />
                <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,.5)]">
                </div>
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
                <button onClick={handleStopHeroAnimation} className="z-20 bg-white absolute right-10 bottom-16 flex items-center gap-x-2 py-2 px-4 rounded-md cursor-pointer group hover:bg-primary hover:shadow-lg hover:drop-shadow-amber-50 transition-all"><Hand className="group-hover:text-white" /> <span className="font-bold group-hover:text-white">{heroAnimation ? dictionary?.stopHeroAnimationButton || "Dừng hiệu ứng" : dictionary?.startHeroAnimationButton || "Chạy hiệu ứng" }</span></button>
            </div>

            {/* Main content */}
            <div className="w-full min-h-screen block md:grid md:grid-cols-[1fr_1px_3fr] gap-6 px-6 pb-10 md:py-10 transition-all">
                {/* Filter kits group */}
                <div className={`col-start-1 col-end-2 w-full max-w-full flex flex-col gap-y-6 md:max-h-fit  filter-kit-transition  ${showFilterKit ? "max-h-[1600px]" : "max-h-0"} ${showFilterKit ? "h-fit" : ""} origin-top overflow-hidden transition-all duration-300 px-1`}>
                    <CategoryFilter categories={categories} />
                    <CashFilter />
                    <NewestProduct products={products} />
                    <TagFilter tags={tags} />
                    <Button
                        variant="normal"
                        className="w-full mt-4 flex items-center justify-center gap-x-2"
                        onClick={() => {
                            setShowFilterKit(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        { dictionary?.filterButton || "Thực hiện lọc" }
                    </Button>
                </div>

                {/* Divider */}
                <div className="col-start-2 col-end-3 bg-[#eee9e9] w-[1px] h-full md:block hidden" />

                {/* Products */}
                <div className="col-start-3 col-end-4 w-full mt-10 md:mt-0 md:pl-1 flex flex-col justify-between gap-y-10">
                    <div>
                        <div className="flex items-start md:items-center md:justify-between mb-4 md:flex-row gap-y-6 flex-col-reverse">
                            <DisplayModeSwitcher {...displayModeProps} />
                            <div className="flex items-center md:justify-end justify-between w-full md:w-fit">
                                <SortDropdown options={sortOptions} onSortChange={handleSortingProducts} />
                                <IconButton className="md:hidden border-2 border-solid border-primary/10 hover:bg-secondary" iconColor="#0D401C" icon={Funnel} onClick={() => {
                                    setShowFilterKit(!showFilterKit);

                                }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {products.length > 0 && products.map((product) => (
                                <Card
                                    key={product.productID}
                                    image={product.images[0]}
                                    title={product.productName}
                                    discountPrice={product.productPriceSale}
                                    price={product.productPrice}
                                    rating={product.rating}
                                />
                            ))}
                        </div>
                    </div>
                    <CustomPagination
                        totalPages={5}
                        currentPage={1}
                        onPageChange={hanleChangePage}
                    />
                </div>
            </div>

            {/* Chatbot and Footer */}
            <ChatBot />
            <ParterCarousel />
            <ToTopButton />
            <Footer />
        </div>
    )
}

export default Homepage;