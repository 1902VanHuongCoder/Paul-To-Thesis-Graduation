import { baseUrl } from "@/lib/base-url";

export async function fetchCategories() {
  const res = await fetch(`${baseUrl}/api/category`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}