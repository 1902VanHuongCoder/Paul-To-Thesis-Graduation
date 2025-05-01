"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs/tabs";

interface TabsNavigationProps {
  description: string;
  reviews: { count: number; content: string };
}

export default function TabsNavigation({
  description,

  reviews,
}: TabsNavigationProps) {
  return (
    <Tabs defaultValue="description" className="w-full max-w-3xl mx-auto">
      {/* Tabs List */}
      <TabsList className="bg-gray-100 rounded-lg p-1">
        <TabsTrigger value="description" className="text-sm font-medium">
          Description
        </TabsTrigger>
        <TabsTrigger value="reviews" className="text-sm font-medium">
          Reviews ({reviews.count})
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <div className="border border-gray-200 rounded-lg p-4">
        <TabsContent value="description">
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </TabsContent>
        <TabsContent value="reviews">
          <p className="text-gray-700 leading-relaxed">{reviews.content}</p>
        </TabsContent>
      </div>
    </Tabs>
  );
}