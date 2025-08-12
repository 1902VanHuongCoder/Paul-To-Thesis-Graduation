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

export interface DeliveryMethod {
  deliveryID: number;
  name: string;
  description?: string;
  basePrice: number;
  minOrderAmount?: number;
  region?: string;
  speed?: string;
  isActive: boolean;
  isDefault: boolean;
}

type OrderProduct = {
  quantity: number;
  price: number;
};

interface Product {
  productID: number;
  productName: string;
  images?: string[]; // or productImage?: string;
  OrderProduct?: OrderProduct; // Optional field for order-specific product details
}

interface Order {
  orderID: string;
  userID: string;
  totalPayment: number;
  totalQuantity: number;
  note?: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  deliveryID: number;
  cartID: number;
  discount?: number;
  deliveryCost?: number;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
  delivery: DeliveryMethod;
}

export const fetchAllOrders = async () => {
  const response = await fetch(`${baseUrl}/api/order`);
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

export const createNewOrder = async (checkoutData: CheckoutData) => {
  console.log("Creating new order with data:", checkoutData);
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

export const updateOrderStatus = async (status: string, order: Order) => {
  const response = await fetch(`${baseUrl}/api/order/${order.orderID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...order, orderStatus: status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update order status");
  }
  return response.json();
};

// Bulk update order status
export const bulkUpdateOrderStatus = async (
  orderIDs: string[],
  status: string
) => {
  const response = await fetch(`${baseUrl}/api/order/bulk-update-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderIDs, status }),
  });
  if (!response.ok) {
    throw new Error("Failed to bulk update order status");
  }
  const data = await response.json();
  return data;
};
