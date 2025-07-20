import { baseUrl } from "../others/base-url";

export const generateVNPayPaymentUrl = async (
  orderID: string,
  amount: number,
  orderDescription: string,
  language: string,
  orderType: string,
  bankCode?: string
) => {
  const data = await fetch(`${baseUrl}/api/create-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderID,
      amount,
      orderDescription,
      bankCode,
      language,
      orderType,
    }),
  });
  if (!data.ok) {
    throw new Error("Failed to create payment");
  }
  const response = await data.json();
  return response?.data?.paymentUrl || "";
};
