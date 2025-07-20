// context/DictionaryContext.tsx (example path)
"use client"; 
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { loadDictionary } from "@/lib/others/load-dictionary";

// Type for dictionary entries
export type DictionaryType = Record<string, string>;

// Interface for context value
export interface DictionaryContextProps {
  lang: "en" | "vi";
  dictionary: DictionaryType | undefined;
}

// Create context
const DictionaryContext = createContext<DictionaryContextProps | undefined>(
  undefined
);

// Hook to consume context
export function useDictionary(): DictionaryContextProps {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}

// Props for provider
interface DictionaryProviderProps {
  lang: "en" | "vi";
  children: ReactNode;
}

// Context Provider
export function DictionaryProvider({
  lang,
  children,
}: DictionaryProviderProps) {
  const [dictionary, setDictionary] = useState<DictionaryType>();

  useEffect(() => {
    loadDictionary(lang).then(setDictionary);
  }, [lang]);

  return (
    <DictionaryContext.Provider value={{ lang, dictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
}
