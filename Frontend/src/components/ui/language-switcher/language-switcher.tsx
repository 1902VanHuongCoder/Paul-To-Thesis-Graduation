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
    code: "ar",
    name: "Arabic",
    flag: "https://cdn-icons-png.freepik.com/256/12364/12364056.png",
  },
  {
    code: "bn",
    name: "Bengali",
    flag: "https://cdn-icons-png.freepik.com/256/555/555417.png",
  },
];

export default function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(languages[0]); // Default to Arabic
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    console.log(`Language switched to: ${language.name}`);
    // Add logic to update the app's language here (e.g., i18n.changeLanguage(language.code))
  };

  return (
    <div className="relative w-full max-w-xs">
      {/* Label */}
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Language
      </label>

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