"use client";
import { Button, Card, CashFilter, CategoryFilter, ChatBot, CustomPagination, DisplayModeSwitcher, Hero, IconButton, NewestProduct, ParterCarousel, SortDropdown, TagFilter, ToTopButton } from "@/components";
import { Funnel } from "lucide-react";
import React, { useEffect, useCallback } from "react";
import { useLoading } from "@/contexts/loading-context";
import { motion, AnimatePresence } from "framer-motion";
import removeDuplicates from "@/lib/others/remove-duplicate";
import Head from "next/head";
import { fetchProducts } from "@/lib/product-apis";
import { fetchCategories } from "@/lib/category-apis";
import { fetchProductsByTag, fetchTags } from "@/lib/product-tag-apis";
import { increaseNoAccess } from "@/lib/statistic-apis";
import { useUser } from "@/contexts/user-context";
import { useChat } from "@/contexts/chat-context";

interface Category {
    categoryDescription: string,
    categoryID: number,
    categoryName: string,
    categorySlug: string,
    count: number,
    createdAt: string,
    updatedAt: string,
}

interface Product {
    productID: number;
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    categoryID: number;
    originID: number;
    subcategoryID: number;
    images: string[];
    rating: number;
    isShow: boolean;
    expiredAt: Date | null;
    unit: string;
}

interface Tag {
    tagID: number;
    tagName: string;
}

const Homepage = () => {
    const { setLoading } = useLoading();
    const { user } = useUser();
    const { toggleChat, isChatOpen } = useChat();
    const [showFilterKit, setShowFilterKit] = React.useState(false);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [productView, setProductView] = React.useState("grid");
    const [productsAfterFilter, setProductsAfterFilter] = React.useState<Product[]>([]);
    const [listOfTagID, setListOfTagID] = React.useState<number[]>([]);
    const displayModeProps = {
        totalResults: productsAfterFilter.length,
        currentPage: 1,
        resultsPerPage: 15,
        onViewChange: (view: "grid" | "list") => {
            setProductView(view);
        },
    };

    const sortOptions = [
        {
            value: "default",
            label: "Mặc định",
        },
        {
            value: "asc",
            label: "Giá tăng dần",
        },
        {
            value: "desc",
            label: "Giá giảm dần",
        },
        {
            value: "highRating",
            label: "Đánh giá cao",
        }
    ];

    const paginatedProducts = React.useMemo(() => {
        if (productsAfterFilter.length === 0) return [];
        const start = (currentPage - 1) * displayModeProps.resultsPerPage;
        return productsAfterFilter.slice(start, start + displayModeProps.resultsPerPage);
    }, [productsAfterFilter, currentPage, displayModeProps.resultsPerPage]);

    const handleCategoryFilter = useCallback((categoryID: number) => {
        const filteredProducts = products.filter((product) => product.categoryID === categoryID);
        setProductsAfterFilter(filteredProducts);
        setCurrentPage(1);
    }, [products]);

    const handleCashFilter = useCallback((min: number, max: number) => {
        const filteredProducts = products.filter((product) => {
            if (product.productPriceSale > 0) {
                return product.productPriceSale >= min && product.productPriceSale <= max;
            }
            const price = product.productPrice;
            return price >= min && price <= max;
        });
        setProductsAfterFilter(filteredProducts);
        setCurrentPage(1);
    }, [products]);

    const handleTagFilter = useCallback((tagID: number) => {
        let uniqueArr: number[];
        if (listOfTagID.includes(tagID)) {
            // Remove tagID if it exists
            uniqueArr = listOfTagID.filter(id => id !== tagID);
        } else {
            // Add tagID if it doesn't exist
            uniqueArr = removeDuplicates([...listOfTagID, tagID]);
        }
        if (uniqueArr.length === 0) {
            setProductsAfterFilter(products);
            setListOfTagID([]);
            return;
        }
        setListOfTagID(uniqueArr);
        console.log(uniqueArr);
        const fetchProductIDContainTagID = async () => {
            const [response] = await Promise.all([
                fetchProductsByTag(uniqueArr)
            ]);
            const filteredProducts = products.filter((product) => response.productIDs.includes(product.productID));
            setProductsAfterFilter(filteredProducts);
        }
        fetchProductIDContainTagID();
    }, [listOfTagID, products]);

    const sortByPriceAsc = (products: Product[]) => {
        const sortedProducts = [...products].sort((a, b) => {
            if (a.productPriceSale > 0 && b.productPriceSale > 0) {
                return a.productPriceSale - b.productPriceSale;
            } else if (a.productPriceSale > 0 && b.productPriceSale === 0) {
                return a.productPriceSale - b.productPrice;
            } else if (a.productPriceSale === 0 && b.productPriceSale > 0) {
                return a.productPrice - b.productPriceSale;
            } else {
                return a.productPrice - b.productPrice;
            }
        })
        return sortedProducts;
    }

    const sortByPriceDesc = (products: Product[]) => {
        const sortedProducts = [...products].sort((a, b) => {
            if (a.productPriceSale > 0 && b.productPriceSale > 0) {
                return b.productPriceSale - a.productPriceSale;
            } else if (a.productPriceSale > 0 && b.productPriceSale === 0) {
                return b.productPriceSale - a.productPrice;
            } else if (a.productPriceSale === 0 && b.productPriceSale > 0) {
                return b.productPrice - a.productPriceSale;
            } else {
                return b.productPrice - a.productPrice;
            }
        })
        return sortedProducts;
    }

    const sortByRating = (products: Product[]) => {
        const sortedProducts = [...products].sort((a, b) => b.rating - a.rating)
        return sortedProducts;
    }

    const handleSortingProducts = (option: string) => {
        if (option === "asc") {
            const sortedProducts = sortByPriceAsc(productsAfterFilter);
            setProductsAfterFilter(sortedProducts);
        } else if (option === "desc") {
            const sortedProducts = sortByPriceDesc(productsAfterFilter);
            setProductsAfterFilter(sortedProducts);
        }
        else if (option === "highRating") {
            const sortedProducts = sortByRating(productsAfterFilter);
            setProductsAfterFilter(sortedProducts);
        }
        else {
            setProductsAfterFilter(products);
        }
    };

    useEffect(() => {
        if (!showFilterKit) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [showFilterKit]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const [categoriesData, tagsData, productsData] = await Promise.all([
                fetchCategories(),
                fetchTags(),
                fetchProducts(),
            ]);
            setCategories(categoriesData);
            setTags(tagsData);
            setProducts(productsData);
            setProductsAfterFilter(productsData);
            setLoading(false);
        };
        fetchAll();
    }, [setLoading]);

    useEffect(() => {
        increaseNoAccess();
    }, []);

    return (
        <>
            <Head>
                <title>{"NFeam House - Trang chủ"}</title>
                <meta name="description" content={"NFeam House - Nền tảng nông nghiệp thông minh, cung cấp giải pháp quản lý, tư vấn, và kết nối cho nhà nông hiện đại."} />
            </Head>
            <main className="relative mx-auto" aria-label="Nội dung chính trang chủ">
                {/* Hero */}
                <Hero />

                {/* Main content */}
                <section className="w-full min-h-screen block md:grid md:grid-cols-[1fr_1px_3fr] gap-6 px-6 pb-10 md:pb-10 pt-5 transition-all" aria-label="Bộ lọc và sản phẩm">
                    {/* Filter kits group */}
                    <aside className={`col-start-1 col-end-2 w-full max-w-full flex flex-col gap-y-6 md:max-h-fit  filter-kit-transition  ${showFilterKit ? "max-h-[1600px]" : "max-h-0"} ${showFilterKit ? "h-fit" : ""} origin-top overflow-hidden transition-all duration-300 px-1`} aria-label="Bộ lọc sản phẩm">
                        <CategoryFilter categories={categories} onCategorySelect={handleCategoryFilter} />
                        <CashFilter onFilter={handleCashFilter} />
                        <NewestProduct products={products} />
                        <TagFilter
                            tags={tags}
                            onTagSelect={handleTagFilter}
                            onClear={() => {
                                setListOfTagID([]);
                                setProductsAfterFilter(products);
                            }}
                        />
                        <Button
                            variant="normal"
                            className="w-full mt-4 flex items-center justify-center gap-x-2 md:hidden"
                            onClick={() => {
                                setShowFilterKit(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            aria-label={"Thực hiện lọc"}
                        >
                            {"Thực hiện lọc"}
                        </Button>
                    </aside>

                    {/* Divider */}
                    <div className="col-start-2 col-end-3 bg-[#eee9e9] w-[1px] h-full md:block hidden" />

                    {/* Products */}
                    <section className="col-start-3 col-end-4 w-full mt-10 md:mt-0 md:pl-1 flex flex-col justify-between gap-y-10" aria-label="Danh sách sản phẩm">
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
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={productView}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className={productView === "grid"
                                        ? `${paginatedProducts.length > 0 && "grid"} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center`
                                        : "flex flex-col items-start gap-y-6"
                                    }
                                >
                                    {paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
                                        <Card
                                            key={product.productID}
                                            image={product.images[0]}
                                            title={product.productName}
                                            discountPrice={product.productPriceSale}
                                            price={product.productPrice}
                                            rating={product.rating}
                                            productID={product.productID}
                                            productName={product.productName}
                                        />
                                    )) : <div className="w-full text-center py-5 border-[1px] border-dashed ">Không có dữ liệu sản phẩm</div>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <CustomPagination
                            totalPages={Math.ceil(products.length / displayModeProps.resultsPerPage)}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </section>
                </section>
                {user && <ChatBot
                    isOpen={isChatOpen}
                    setIsOpen={() => {
                        toggleChat();
                    }}
                />}
                <ParterCarousel />
                <ToTopButton />
            </main>
        </>
    );
}

export default Homepage;