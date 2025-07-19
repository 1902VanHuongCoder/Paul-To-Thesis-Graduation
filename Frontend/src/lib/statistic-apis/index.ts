import { baseUrl } from "@/lib/base-url";

export async function increaseNoAccess() {
  const res = await fetch(`${baseUrl}/api/statistic/increment`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return;
}