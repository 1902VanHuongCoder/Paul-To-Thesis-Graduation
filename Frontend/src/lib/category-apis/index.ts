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

export async function createCategory(data: { categoryName: string; categoryDescription?: string }) {
  const res = await fetch(`${baseUrl}/api/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(id: number, data: { categoryName: string; categoryDescription?: string }) {
  const res = await fetch(`${baseUrl}/api/category/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${baseUrl}/api/category/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return { message: data.message, status: res.status };
}
