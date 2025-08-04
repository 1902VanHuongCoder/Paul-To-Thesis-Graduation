import { baseUrl } from "../others/base-url";

type Product = {
  productName: string;
  productPrice: number;
  productPriceSale?: number | null;
  quantityAvailable: number;
  categoryID: number;
  subcategoryID: number;
  originID: number;
  tagIDs: number[];
  images: string[];
  descriptionImages: string[];
  description: string;
  isShow: boolean;
  expiredAt?: Date | null;
  unit: string;
  barcode?: string;
  boxBarcode?: string;
  quantityPerBox?: number;
  performedBy: string;
  diseaseIDs: number[];
};
export async function fetchProducts() {
  const res = await fetch(`${baseUrl}/api/product`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data;
}

export async function fetchProductsNotExpired() {
  const res = await fetch(`${baseUrl}/api/product/not-expired`);
  if (!res.ok) throw new Error("Failed to fetch not expired products");
  const data = await res.json();
  console.log("Fetched not expired products:", data);
  return data;
}

export async function fetchProductByName(productName: string) {
  const res = await fetch(`${baseUrl}/api/product/name?name=${encodeURIComponent(productName)}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function fetchProductById(productId: string) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function importProducts(isBox: boolean, barcode: string) {
  const res = await fetch(`${baseUrl}/api/product/${isBox ? 'box-' : ''}barcode/${barcode}`);
  if (!res.ok) throw new Error("Failed to import products");
  return res.json();
}

export async function updateProduct(productId: string, data: Product) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.ok;
}

export async function updateProductQuantity(productID: string, quantity: number, performedBy: string, note: string) {
  const res = await fetch(`${baseUrl}/api/product/update/quantity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productID,
      quantityAvailable: quantity,
      performedBy,
      note,
    }),
  });
  if (!res.ok) throw new Error("Failed to update product quantity");
  return res.ok;
}

export async function deleteProduct(productId: string) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return {
    status: res.status,
    message: data.message
  };
}

export async function fetchTopSellingProducts() {
  const res = await fetch(`${baseUrl}/api/product/statistic/top-selling`);
  if (!res.ok) throw new Error("Failed to fetch top selling products");
  return res.json();
}

export async function fetchPoorSellingProducts() {
  const res = await fetch(`${baseUrl}/api/product/statistic/poor-selling`);
  if (!res.ok) throw new Error("Failed to fetch poor selling products");
  return res.json();
}

export async function fetchProductsOrderCount() {
  const res = await fetch(`${baseUrl}/api/product/statistic/order-count`);
  if (!res.ok) throw new Error("Failed to fetch products order count");
  return res.json();
}

// fetch products will be expired in 30 days
export async function fetchProductsWillBeExpired() {
  const res = await fetch(`${baseUrl}/api/product/statistic/will-be-expired`);
  if (!res.ok) throw new Error("Failed to fetch products will be expired");
  const data = await res.json();
  return data;
}

// update product order 
export async function batchUpdateProductOrder(updates: { productID: number, order: number }[]) {
  const res = await fetch(`${baseUrl}/api/product/batch-update-order/sort`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to batch update product order");
  return res.ok;
}