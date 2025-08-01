import { baseUrl } from "@/lib/others/base-url";

export async function increaseNoAccess() {
  const res = await fetch(`${baseUrl}/api/statistic/increment`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return;
}

export async function getAccessStats() {
  const res = await fetch(`${baseUrl}/api/statistic`, {
    method: "GET"
  });
  if (!res.ok) throw new Error("Failed to fetch access stats");
  return res.json();
}