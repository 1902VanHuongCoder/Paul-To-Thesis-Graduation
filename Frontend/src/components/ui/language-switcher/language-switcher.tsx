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
  { code: "ar", name: "Arabic", flag: "https://cdn-icons-png.freepik.com/256/12364/12364056.png?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid" },
  { code: "bn", name: "Bengali", flag: "https://cdn-icons-png.freepik.com/256/555/555417.png?uid=R155655216&ga=GA1.1.90954454.1737472911&semt=ais_hybrid" },
];

export default function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(languages[0]); // Default to English
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    console.log(`Language switched to: ${language.name}`);
    // Add logic to update the app's language here
  };

  return (
    <div className="relative w-full max-w-xs">
      {/* Label */}
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Language
      </label>

      {/* Custom Dropdown */}
      <div
        className="relative border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected Language */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {selectedLanguage && (
              <span className="w-8 h-6 rounded overflow-hidden">
                <Image
                  src={selectedLanguage.flag}
                  alt={`${selectedLanguage.name} flag`}
                  className="w-8 h-6 rounded"
                  width={20} // Set the width of the image
                  height={20} // Set the height of the image
                />
              </span>

            )}
            <span>  {selectedLanguage && selectedLanguage.name}</span>
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
                <span className="w-8 h-6 rounded overflow-hidden">
                  <Image
                    width={20} // Set the width of the image
                    height={20} // Set the height of the image
                    src={language.flag}
                    alt={`${language.name} flag`}
                    className="w-full h-full object-cover"
                  />
                </span>

                <span>{language.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}