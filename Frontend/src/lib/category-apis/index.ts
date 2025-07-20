import { baseUrl } from "@/lib/others/base-url";

export async function fetchCategories() {
  const res = await fetch(`${baseUrl}/api/category`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchCategoryBySlug(categorySlug: string) {
  const res = await fetch(`${baseUrl}/api/category/slug/${categorySlug}`);
  if (!res.ok) throw new Error("Category not found");
  return res.json();
}