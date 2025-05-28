"use client";

import React, { createContext, useContext, useState } from "react";

interface CheckoutData {
    orderID?: string;
    userID?: number;
    fullName?: string;
    totalPayment?: number;
    totalQuantity?: number;
    note?: string;
    phone?: string;
    address?: string;
    paymentMethod?: string;
    deliveryID?: number;
    cartID?: number;
    discount?: {
      discountID: string;
      discountValue: number;
    };
}

interface CheckoutContextValue {
    checkoutData: CheckoutData | undefined;
    setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutData | undefined>>;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within a CheckoutProvider");
  return ctx;
}
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>();

  return (
    <CheckoutContext.Provider
      value={{
        checkoutData,
        setCheckoutData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}