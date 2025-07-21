import { baseUrl } from "../others/base-url";
interface CheckoutData {
  orderID?: string;
  userID?: string;
  fullName?: string;
  totalPayment?: number;
  totalQuantity?: number;
  note?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  deliveryID?: number;
  cartID?: number;
  deliveryCost?: number;
  discount?: {
    discountID: string;
    discountValue: number;
  };
  status?: string;
}

export const createNewOrder = async (checkoutData: CheckoutData) => {
  const response = await fetch(`${baseUrl}/api/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(checkoutData),
  });
  if (!response.ok) {
    throw new Error("Failed to create order");
  }
  return response.json();
};

export const getOrderHistory = async (userID: string) => {
  const response = await fetch(`${baseUrl}/api/order/history/${userID}`);
  if (!response.ok) {
    throw new Error("Failed to fetch order history");
  }
  return response.json();
};

export const getOrderDetails = async (orderID: string) => {
  const response = await fetch(`${baseUrl}/api/order/${orderID}`);
  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }
  return response.json();
};
