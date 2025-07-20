import { baseUrl } from "../others/base-url";

export async function fetchProducts() {
  const res = await fetch(`${baseUrl}/api/product`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductByName(productName: string) {
  const res = await fetch(`${baseUrl}/api/product/name?name=${encodeURIComponent(productName)}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}