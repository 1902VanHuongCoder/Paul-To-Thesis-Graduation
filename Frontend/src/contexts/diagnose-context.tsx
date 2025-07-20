"use client";
import React, { createContext, useContext, useState } from 'react';

// export type PredictResult = {
//   class: string;
//   confidence: number;
// };

export type DiseaseDetail = {
  diseaseID?: number;
  diseaseName?: string;
  diseaseEnName?: string;
  ricePathogen?: string;
  symptoms?: string;
  images?: string[];
  productPrice?: number;
  unit?: string;
};

export type DiagnoseContextType = {
  result: DiseaseDetail[] | null;
  setResult: React.Dispatch<React.SetStateAction<DiseaseDetail[] | null>>;
};

const DiagnoseContext = createContext<DiagnoseContextType | undefined>(undefined);

export const DiagnoseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [result, setResult] = useState<DiseaseDetail[] | null>(null);
  return (
    <DiagnoseContext.Provider value={{ result, setResult }}>
      {children}
    </DiagnoseContext.Provider>
  );
};

export const useDiagnoseContext = () => {
  const context = useContext(DiagnoseContext);
  if (!context) {
    throw new Error('useDiagnoseContext must be used within a DiagnoseProvider');
  }
  return context;
};
