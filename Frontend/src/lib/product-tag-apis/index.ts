import { baseUrl } from "@/lib/base-url";

export async function fetchTags() {
  const res = await fetch(`${baseUrl}/api/tag`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}
