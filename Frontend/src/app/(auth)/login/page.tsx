import { MobileDrawer, Navigation, SearchForm, TopHeader } from "@/app/components";
import React from "react";

export default function MenuBar() {
  return (
    <div className="w-screen bg-black h-screen">
      <TopHeader />
      <Navigation />
      <MobileDrawer />
      <SearchForm />
    </div>
  );
}