"use client";

import React from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader } from "@/app/components/ui/drawer/drawer";
import { Input } from "@/app/components/ui/input/input";
import { XIcon } from "lucide-react";
import { Title } from "@radix-ui/react-dialog";
import Button from "../button/button";

export default function SearchForm() {
    return (
        <Drawer direction="top">
            {/* Trigger Button */}
            <DrawerTrigger className="p-2 bg-primary text-white rounded-md">
                Open Search
            </DrawerTrigger>

            {/* Drawer Content */}
            <DrawerContent className="w-full  text-black pb-10">  
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
                        <Input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="flex-1 border border-gray-300 rounded-md"
                        />
                        {/* Search Button */}
                        <Button variant="normal" className="px-4 py-2 bg-primary text-white rounded-md"> Tìm kiếm </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}