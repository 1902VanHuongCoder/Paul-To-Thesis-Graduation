import { baseUrl } from "../base-url";

export async function fetchProducts() {
  const res = await fetch(`${baseUrl}/api/product`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}