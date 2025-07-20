import { baseUrl } from "../others/base-url";

export async function fetchNews() {
  const res = await fetch(`${baseUrl}/api/news`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}