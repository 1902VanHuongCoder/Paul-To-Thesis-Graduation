import { baseUrl } from "../base-url";

export async function fetchOrigins() {
    const res = await fetch(`${baseUrl}/api/origin`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}