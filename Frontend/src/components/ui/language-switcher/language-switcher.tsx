"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface LanguageOption {
  code: string;
  name: string;
  flag: string; // Path to the flag image
}

const languages: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    flag: "https://cdn-icons-png.freepik.com/256/197/197374.png",
  },
  {
    code: "vi",
    name: "Vietnamese",
    flag: "https://cdn-icons-png.freepik.com/256/197/197452.png",
  },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Get current language from the first segment of the path
  const currentLang = pathname.split("/")[1] || "en";
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (language: LanguageOption) => {
    setIsOpen(false);
    // Replace the first segment (lang) with the new language code
    const segments = pathname.split("/");
    segments[1] = language.code;
    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };
  return (
    <div className="relative md:w-fit max-w-xs">

      {/* Dropdown Container */}
      <div
        className="relative border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected Language */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2 pr-2">
            <Image
              src={selectedLanguage.flag}
              alt={`${selectedLanguage.name} flag`}
              className="w-6 h-6 rounded"
              width={24}
              height={24}
            />
            <span className="md:block hidden">{selectedLanguage.name}</span>
          </div>
          <ChevronDown />
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-fit bg-white border border-gray-300 rounded-lg shadow-lg py-2">
            {languages.map((language) => (
              <li
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer pr-12"
              >
                <Image
                  src={language.flag}
                  alt={`${language.name} flag`}
                  className="w-6 h-6 rounded"
                  width={24}
                  height={24}
                />
                <span>{language.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}