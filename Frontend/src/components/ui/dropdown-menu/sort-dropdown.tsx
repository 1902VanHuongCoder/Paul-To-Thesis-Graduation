"use client";

import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps {
    options: string[];
    defaultOption?: string;
    onSortChange?: (option: string) => void; // Callback for when a sort option is selected
}

export default function SortDropdown({
    options,
    defaultOption = "Mặc định",
    onSortChange,
}: SortDropdownProps) {
    const [selectedOption, setSelectedOption] = useState(defaultOption);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        if (onSortChange) {
            onSortChange(option);
        }
    };

    return (
        <DropdownMenu>
            {/* Trigger Button */}
            <DropdownMenuTrigger
                className="group relative font-sans bg-secondary border-[1px] overflow-hidden border-gray-200 text-black font-normal text-md px-6 py-3 rounded-full flex items-center gap-2 focus:outline-none"
                aria-label="Sort options"
            >
                <span className="text-lg relative z-2 text-primary">{selectedOption}</span>
                <span className="text-lg relative z-2 "><ChevronDown className="text-primary" /></span>
                <span className="absolute bottom-0 left-0 w-full h-full group-hover:h-0 origin-top transition-all duration-300 bg-white z-1 rounded-full"></span>
            </DropdownMenuTrigger>

            {/* Dropdown Menu */}
            <DropdownMenuContent
                className="bg-primary text-white rounded-xl shadow-lg mt-2 px-4"
                sideOffset={8}
            >
                {options.map((option, index) => (
                    <React.Fragment key={option}>
                        <DropdownMenuItem
                            onClick={() => handleOptionSelect(option)}
                            className={`px-4 py-2 text-sm cursor-pointer ${selectedOption === option ? "text-secondary font-bold" : "text-white"
                                }`}
                            aria-label={`Sort by ${option}`}
                        >
                            {option}
                        </DropdownMenuItem>
                        {index < options.length - 1 && <DropdownMenuSeparator className="bg-white/10"/>} 
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}