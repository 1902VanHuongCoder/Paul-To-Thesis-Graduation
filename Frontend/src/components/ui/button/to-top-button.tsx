"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ToTopButton: React.FC = React.memo(function ToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Throttle scroll event for performance
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsVisible(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = React.useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);

    // Keyboard accessibility: Enter/Space triggers scroll
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    };

    return (
        <button
            onClick={scrollToTop}
            onKeyDown={handleKeyDown}
            className={`z-100 fixed bottom-23 right-7 p-3 rounded-full bg-secondary hover:bg-primary text-white shadow-lg hover:shadow-primary/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Lên đầu trang"
            tabIndex={isVisible ? 0 : -1}
            type="button"
        >
            <ArrowUp size={20} className="animate-bounce animate-alternate-reverse" aria-hidden="true" />
        </button>
    );
});

export default ToTopButton;