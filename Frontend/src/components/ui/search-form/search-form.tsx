"use client";

import React from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader } from "@/app/components/ui/drawer/drawer";
import { Input } from "@/app/components/ui/input/input";
import { XIcon, MicIcon } from "lucide-react";
import { Title } from "@radix-ui/react-dialog";
import Button from "../button/button-brand";

export default function SearchForm() {
    return (
        <Drawer direction="top">
            {/* Trigger Button */}
            <DrawerTrigger className="p-2 bg-primary text-white rounded-md">
                Open Search
            </DrawerTrigger>

            {/* Drawer Content */}
            <DrawerContent className="w-full text-black pb-10">
                {/* Header */}
                <DrawerHeader className="hidden">
                    <Title className="text-lg font-bold hidden">Search</Title>
                </DrawerHeader>

                {/* Search Form */}
                <div className="p-4">
                    <div className="w-full flex justify-end">
                        <DrawerClose className="p-2 text-primary">
                            <XIcon size={24} />
                        </DrawerClose>
                    </div>
                    <form className="flex items-center gap-2 px-2 md:px-10 mt-4 md:mt-0">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full border border-gray-300 rounded-md pl-10 py-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/10"
                            />
                            {/* Voice Icon */}
                            <MicIcon
                                size={20}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-primary"
                                aria-label="Voice search"
                            />
                        </div>
                        {/* Search Button */}
                        <Button variant="normal" className="px-4 py-2 bg-primary text-white rounded-md">
                            Tìm kiếm
                        </Button>
                    </form>
                    {/* Shortcut Info */}
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Press <span className="font-bold text-gray-700">CTRL+K</span> to quickly open the search.
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}