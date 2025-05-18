"use client";
import { Button, Card, CashFilter, CategoryFilter, ChatBot, CustomPagination, DisplayModeSwitcher, Footer, IconButton, ParterCarousel, PopularProduct, SortDropdown, TagFilter, ToTopButton, WishlistDialog } from "@/components";
import { Funnel } from "lucide-react";
import React from "react";

interface Category {
    name: string;
    count: number;
}

interface Product {
    id: string;
    image: string;
    title: string;
    price: string;
    rating: number; // Rating out of 5
}

const Homepage = () => {
    const [showFilterKit, setShowFilterKit] = React.useState(false);
    const sampleCategories: Category[] = [
        { name: "Electronics", count: 12 },
        { name: "Books", count: 8 },
        { name: "Clothing", count: 15 },
        { name: "Home & Kitchen", count: 6 },
        { name: "Toys", count: 10 },
    ];
    const sampleProducts: Product[] = [
        {
            id: "1",
            image: "http://www.congtyhai.com/Data/Sites/1/News/1426/1erase-2.png",
            title: "Wireless Headphones",
            price: "59.99",
            rating: 4.5,
        },
        {
            id: "2",
            image: "http://www.congtyhai.com/Data/Sites/1/News/1357/hai-pb-hoang-ho-si_500ml_1618367278.png",
            title: "Smart Watch",
            price: "129.99",
            rating: 4.2,
        },
        {
            id: "3",
            image: "http://www.congtyhai.com/Data/Sites/1/News/1359/manozeb-80wp_xanh_1kg_1618288208.png",
            title: "Bluetooth Speaker",
            price: "39.99",
            rating: 4.7,
        },
        {
            id: "4",
            image: "http://www.congtyhai.com/Data/Sites/1/News/1358/phan-bon-la-hai.jpg",
            title: "E-book Reader",
            price: "89.99",
            rating: 4.3,
        },
        {
            id: "5",
            image: "http://www.congtyhai.com/Data/Sites/1/News/1358/phan-bon-la-hai.jpg",
            title: "Fitness Tracker",
            price: "49.99",
            rating: 4.0,
        },
    ];

    const sampleTags: string[] = [
        "New Arrival",
        "Discount",
        "Best Seller",
        "Trending",
        "Limited Edition",
        "Eco Friendly",
        "Popular",
        "Gift Idea",
    ];

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
        "Mặc định",
        "Giá tăng dần",
        "Giá giảm dần",
        "Bán chạy nhất",
        "Đánh giá cao",
    ];
    return (
        <div className="relative mx-auto">
            <div className="w-full min-h-screen block md:grid md:grid-cols-[1fr_1px_3fr] gap-6 px-6 pb-10 md:py-10 transition-all">
                {/* Sidebar */}
                <div className={`col-start-1 col-end-2 w-full max-w-full flex flex-col gap-y-6 md:max-h-fit  filter-kit-transition  ${showFilterKit ? "max-h-[1600px]" : "max-h-0"}
    ${showFilterKit ? "h-fit" : ""}
     origin-top overflow-hidden transition-all duration-300 px-1`}>
                    <CategoryFilter categories={sampleCategories} />
                    <CashFilter />
                    <PopularProduct products={sampleProducts} />
                    <TagFilter tags={sampleTags} />
                    <Button
                        variant="normal"
                        className="w-full mt-4 flex items-center justify-center gap-x-2"
                        onClick={() => {
                            setShowFilterKit(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        Thực hiện lọc
                    </Button>
                </div>
                {/* Divider */}
                <div className="col-start-2 col-end-3 bg-[#eee9e9] w-[1px] h-full md:block hidden" />

                {/* Main content */}
                <div className="col-start-3 col-end-4 w-full mt-10 md:mt-0 md:pl-1 flex flex-col justify-between gap-y-10">
                    <div>
                        <div className="flex items-start md:items-center md:justify-between mb-4 md:flex-row gap-y-6 flex-col-reverse">
                            <DisplayModeSwitcher {...displayModeProps} />
                            <div className="flex items-center md:justify-end justify-between w-full md:w-fit">
                                <SortDropdown options={sortOptions} defaultOption="Mặc định" onSortChange={(option) => { /* handle sort */ }} />
                                <IconButton className="md:hidden border-2 border-solid border-primary/10 hover:bg-secondary" iconColor="#0D401C" icon={Funnel} onClick={() => {
                                    setShowFilterKit(!showFilterKit);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {sampleProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    image={product.image}
                                    title={product.title}
                                    discountPrice={product.price}
                                    price={product.price}
                                    rating={product.rating}
                                />
                            ))}
                        </div>
                    </div>
                    <CustomPagination
                        totalPages={5}
                        currentPage={1}
                        onPageChange={(page: number) => { /* handle page change */ }}
                    />
                </div>
            </div>
            <ChatBot />
            <ParterCarousel />
            <ToTopButton />
            <Footer />
        </div>

    )
}

export default Homepage;