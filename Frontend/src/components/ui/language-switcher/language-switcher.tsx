"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    languages[0]
  );

  const handleLanguageChange = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    // Add your language change logic here, e.g., redirecting to a different URL
    window.location.href = `/${language.code}`;
  };
  return (
    <div className="relative w-full max-w-xs">

      {/* Dropdown Container */}
      <div
        className="relative border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected Language */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Image
              src={selectedLanguage.flag}
              alt={`${selectedLanguage.name} flag`}
              className="w-6 h-6 rounded"
              width={24}
              height={24}
            />
            <span>{selectedLanguage.name}</span>
          </div>
          <ChevronDown />
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            {languages.map((language) => (
              <li
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
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