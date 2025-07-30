"use client";
import React, { useEffect, useRef, useState } from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader } from "@/components/ui/drawer/drawer";
import { Input } from "@/components/ui/input/input";
import { XIcon, MicIcon } from "lucide-react";
import { DialogDescription, Title } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/contexts/dictonary-context";
import { Button } from "../button/button";
import { fetchProductByName } from "@/lib/product-apis";

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
    isShow: boolean;
    expiredAt: Date | null;
    unit: string;
}

interface Suggestion {
    productName: string;
    productID: string;
}

const SearchForm: React.FC = React.memo(function SearchForm() {
    const router = useRouter();
    const { lang } = useDictionary();
    const [search, setSearch] = useState("");
    const [listening, setListening] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedProductID, setSelectedProductID] = useState<string>("");
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Voice search handler
    const handleVoiceSearch = React.useCallback(() => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Trình duyệt của bạn không hỗ trợ tìm kiêm bằng giọng nói.");
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "vi-VN";
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSearch(transcript);
                setListening(false);
                inputRef.current?.focus();
            };
            recognitionRef.current.onerror = () => setListening(false);
            recognitionRef.current.onend = () => setListening(false);
        }
        setListening(true);
        recognitionRef.current.start();
    }, []);

    // Handle view product details
    const handleViewProduct = React.useCallback(() => {
        if (!selectedProductID) return;
        router.push(`/vi/homepage/product-details/${selectedProductID}`);
        setOpenSearch(false);
    }, [router, selectedProductID]);

    // Debounced fetch for suggestions
    useEffect(() => {
        if (search.trim().length === 0) {
            setSuggestions([]);
            return;
        }
        setLoadingSuggest(true);
        const timeout = setTimeout(() => {
           const fetchSuggestions = async () => {
                try {
                    const data = await fetchProductByName(search);
                    setSuggestions(Array.isArray(data) ? data.map((p: Product) => ({ productName: p.productName, productID: String(p.productID) })) : []);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                } finally {
                    setLoadingSuggest(false);
                }
            }
            fetchSuggestions();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    // Keyboard shortcut for opening search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpenSearch(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Keyboard navigation for suggestions
    const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
    useEffect(() => { setHighlightedIdx(-1); }, [suggestions, openSearch]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!suggestions.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIdx(idx => Math.min(idx + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIdx(idx => Math.max(idx - 1, 0));
        } else if (e.key === "Enter" && highlightedIdx >= 0) {
            e.preventDefault();
            const item = suggestions[highlightedIdx];
            setSearch(item.productName);
            setSelectedProductID(item.productID);
            router.push(`/${lang}/homepage/product-details/${item.productID}`);
            setOpenSearch(false);
        }
    };

    return (
        <Drawer direction="top" defaultOpen={false} open={openSearch} onOpenChange={setOpenSearch}>
            <DrawerTrigger className="flex items-center justify-center rounded-full hover:bg-secondary transition-all duration-200 ease-in-out cursor-pointer" aria-label="Mở tìm kiếm" tabIndex={0}>
                <span className="p-3 rounded-full bg-transparent border-[1px] border-solid border-primary/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M8.195 0c4.527 0 8.196 3.62 8.196 8.084a7.989 7.989 0 0 1-1.977 5.267l5.388 5.473a.686.686 0 0 1-.015.98a.71.71 0 0 1-.993-.014l-5.383-5.47a8.23 8.23 0 0 1-5.216 1.849C3.67 16.169 0 12.549 0 8.084C0 3.62 3.67 0 8.195 0Zm0 1.386c-3.75 0-6.79 2.999-6.79 6.698c0 3.7 3.04 6.699 6.79 6.699s6.791-3 6.791-6.699c0-3.7-3.04-6.698-6.79-6.698Z" /></svg>
                </span>
            </DrawerTrigger>
            <DrawerContent className="w-full text-black pb-10" aria-modal="true" role="dialog" aria-label="Tìm kiếm sản phẩm">
                <DrawerHeader className="hidden">
                    <Title className="text-lg font-bold hidden">Search</Title>
                    <DialogDescription className="text-sm text-white hidden">
                        {"Bạn có thể thêm chúng vào giỏ hàng hoặc xóa khỏi danh sách này."}
                    </DialogDescription>
                </DrawerHeader>
                <div className="p-4">
                    <div className="w-full flex justify-end">
                        <DrawerClose className="p-2 text-primary" aria-label="Đóng tìm kiếm">
                            <XIcon size={24} />
                        </DrawerClose>
                    </div>
                    <form className="flex flex-col" role="search" aria-label="Tìm kiếm sản phẩm" onSubmit={e => { e.preventDefault(); handleViewProduct(); }}>
                        <div className="flex items-center gap-2 px-2 md:px-10 mt-4 md:mt-0">
                            <div className="relative flex-1">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="w-full border border-gray-300 rounded-md pl-10 py-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    autoComplete="off"
                                    aria-label="Tìm kiếm sản phẩm"
                                    aria-autocomplete="list"
                                    aria-controls="search-suggestion-list"
                                    aria-activedescendant={highlightedIdx >= 0 ? `suggestion-${highlightedIdx}` : undefined}
                                />
                                {loadingSuggest ? (
                                    <svg
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 animate-spin text-primary"
                                        width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                    </svg>
                                ) : (
                                    <MicIcon
                                        size={20}
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${listening ? "text-green-600 animate-pulse" : "text-gray-500 hover:text-primary"}`}
                                        aria-label="Tìm kiếm bằng giọng nói"
                                        onClick={handleVoiceSearch}
                                        tabIndex={0}
                                    />
                                )}
                            </div>
                            <Button
                                disabled={search === ""}
                                onClick={handleViewProduct}
                                variant="default"
                                type="button"
                                className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-white"
                                aria-label="Tìm kiếm sản phẩm"
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                        {/* Suggestions dropdown */}
                        {search && suggestions.length > 0 && (
                            <ul
                                id="search-suggestion-list"
                                className="bg-white border border-gray-200 rounded shadow mt-2 max-h-60 overflow-y-auto mx-2 md:mx-10"
                                role="listbox"
                                aria-label="Gợi ý sản phẩm"
                            >
                                {suggestions.map((item, idx) => (
                                    <li
                                        key={idx}
                                        id={`suggestion-${idx}`}
                                        className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${highlightedIdx === idx ? 'bg-primary/10' : ''}`}
                                        role="option"
                                        aria-selected={highlightedIdx === idx}
                                        tabIndex={-1}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            setSearch(item.productName);
                                            setSelectedProductID(item.productID);
                                            router.push(`/${lang}/homepage/product-details/${item.productID}`);
                                            setOpenSearch(false);
                                        }}
                                    >
                                        {item.productName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </form>
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Ấn phím <span className="font-bold text-gray-700">CTRL+K</span> để nhanh chóng mở tìm kiếm.
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
});

export default SearchForm;