"use client";
import { Button, Card, CashFilter, CategoryFilter, ChatBot, CustomPagination, DisplayModeSwitcher, IconButton, NewestProduct, ParterCarousel, SortDropdown, TagFilter, ToTopButton, TypewriterText } from "@/components";
import { Funnel, Hand } from "lucide-react";
import React, { useEffect } from "react";
import greenField from "@public/images/rice-banner.png";
import Image from "next/image";
import vector02 from "@public/vectors/Vector+02.png";
import { baseUrl } from "@/lib/base-url";
import { useDictionary } from "@/contexts/dictonary-context";
import { useLoading } from "@/contexts/loading-context";
import { motion, AnimatePresence } from "framer-motion";
import removeDuplicates from "@/lib/remove-duplicate";
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
    const { setLoading } = useLoading();
    const [showFilterKit, setShowFilterKit] = React.useState(false);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [heroAnimation, setHeroAnimation] = React.useState(true);
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
            label: dictionary?.sortDropdownDV || "Mặc định",
        },
        {
            value: "asc",
            label: dictionary?.sortDropdownIn || "Giá tăng dần",
        },
        {
            value: "desc",
            label: dictionary?.sortDropdownDe || "Giá giảm dần",
        },
        {
            value: "highRating",
            label: dictionary?.sortDropdownHR || "Đánh giá cao",
        }
    ];

    const handleStopHeroAnimation = () => {
        setHeroAnimation(!heroAnimation);
    };

    const paginatedProducts = React.useMemo(() => {
        const start = (currentPage - 1) * displayModeProps.resultsPerPage;
        return productsAfterFilter.slice(start, start + displayModeProps.resultsPerPage);
    }, [productsAfterFilter, currentPage, displayModeProps.resultsPerPage]);

    const handleCategoryFilter = (categoryID: number) => {
        const filteredProducts = products.filter((product) => product.categoryID === categoryID);
        setProductsAfterFilter(filteredProducts);
        setCurrentPage(1);
    }

    const handleCashFilter = (min: number, max: number) => {
        const filteredProducts = products.filter((product) => {
            const price = parseInt(product.productPrice);
            return price >= min && price <= max;
        });
        setProductsAfterFilter(filteredProducts);
        setCurrentPage(1);
    }

    const handleTagFilter = (tagID: number) => {
        const listOfTagIDTemp = [...listOfTagID, tagID];

        const uniqueArr = removeDuplicates(listOfTagIDTemp);

        setListOfTagID(uniqueArr);
        const fetchProductIDContainTagID = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/product-tag`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }, body: JSON.stringify({ tagIDs: uniqueArr })
                });
                const data = await response.json();
                const filteredProducts = products.filter((product) => data.productIDs.includes(product.productID));
                setProductsAfterFilter(filteredProducts);
            } catch (error) {
                console.error("Error fetching product's IDs contain belong to tagID:", error);
            }
        }
        fetchProductIDContainTagID();
    }

    const sortByPriceAsc = (products: Product[]) => {
        const sortedProducts = [...products].sort((a, b) => parseInt(a.productPrice) - parseInt(b.productPrice))
        return sortedProducts;
    }

    const sortByPriceDesc = (products: Product[]) => {
        const sortedProducts = [...products].sort((a, b) => parseInt(b.productPrice) - parseInt(a.productPrice))
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
            try {
                await fetch(`${baseUrl}/api/product`).then((res) => res.json()).then((data) => {
                    setProducts(data);
                    setProductsAfterFilter(data);
                });
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        const fetchAll = async () => {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 5000);
            await Promise.all([fetchCategories(), fetchTags(), fetchProducts()]);
        }
        fetchAll();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                await fetch(`${baseUrl}/api/shopping-cart?customerID=1`).then((res) => res.json()).then((data) => console.log(data));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        fetchCategories();
    }, [])
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
                <button onClick={handleStopHeroAnimation} className="z-20 bg-white absolute right-10 bottom-16 flex items-center gap-x-2 py-2 px-4 rounded-md cursor-pointer group hover:bg-primary hover:shadow-lg hover:drop-shadow-amber-50 transition-all"><Hand className="group-hover:text-white" /> <span className="font-bold group-hover:text-white">{heroAnimation ? dictionary?.stopHeroAnimationButton || "Dừng hiệu ứng" : dictionary?.startHeroAnimationButton || "Chạy hiệu ứng"}</span></button>
            </div>

            {/* Main content */}
            <div className="w-full min-h-screen block md:grid md:grid-cols-[1fr_1px_3fr] gap-6 px-6 pb-10 md:py-10 transition-all">
                {/* Filter kits group */}
                <div className={`col-start-1 col-end-2 w-full max-w-full flex flex-col gap-y-6 md:max-h-fit  filter-kit-transition  ${showFilterKit ? "max-h-[1600px]" : "max-h-0"} ${showFilterKit ? "h-fit" : ""} origin-top overflow-hidden transition-all duration-300 px-1`}>
                    <CategoryFilter categories={categories} onCategorySelect={(categoryID) => handleCategoryFilter(categoryID)} />
                    <CashFilter onFilter={(min, max) => { handleCashFilter(min, max) }} />
                    <NewestProduct products={products} />
                    <TagFilter tags={tags} onTagSelect={(tagID) => handleTagFilter(tagID)} />
                    <Button
                        variant="normal"
                        className="w-full mt-4 flex items-center justify-center gap-x-2"
                        onClick={() => {
                            setShowFilterKit(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        {dictionary?.filterButton || "Thực hiện lọc"}
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

                        {/* <div className={`${productView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col items-start"}  gap-6 justify-items-center`}>
                            {paginatedProducts.length > 0 && paginatedProducts.map((product) => (
                                <Card
                                    key={product.productID}
                                    image={product.images[0]}
                                    title={product.productName}
                                    discountPrice={product.productPriceSale}
                                    price={product.productPrice}
                                    rating={product.rating}
                                />
                            ))}
                        </div> */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={productView}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className={productView === "grid"
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
                                    : "flex flex-col items-start gap-y-6"
                                }
                            >
                                {paginatedProducts.length > 0 && paginatedProducts.map((product) => (
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
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <CustomPagination
                        totalPages={Math.ceil(products.length / displayModeProps.resultsPerPage)}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Chatbot and Footer */}
            <ChatBot />
            <ParterCarousel />
            <ToTopButton />
        </div>
    )
}

export default Homepage;