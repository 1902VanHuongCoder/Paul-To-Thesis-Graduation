import { baseUrl } from "@/lib/others/base-url";

export async function fetchTags() {
  const res = await fetch(`${baseUrl}/api/tag`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

// Fetch products belongs to a tag 
export async function fetchProductsByTag(tagIDs: number[]) {
  const res = await fetch(`${baseUrl}/api/product-tag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagIDs }),
  });
  if (!res.ok) throw new Error("Failed to fetch products for tag");
  return res.json();
}