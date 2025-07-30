import { baseUrl } from "../others/base-url";

export async function fetchOrigins() {
    const res = await fetch(`${baseUrl}/api/origin`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function addOrigin(originName: string, imageUrl: string) {
  const res = await fetch(`${baseUrl}/api/origin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      originName,
      originImage: imageUrl,
    }),
  });

  if (!res.ok) throw new Error("Failed to add origin");
  return res.json();
}

export async function updateOrigin(originID: number, originName: string, imageUrl?: string) {
  const res = await fetch(`${baseUrl}/api/origin/${originID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      originName,
      originImage: imageUrl || "", // Use empty string if no new image is provided
    }),
  });

  return res.ok;
}

export async function deleteOrigin(originID: number) {
  const res = await fetch(`${baseUrl}/api/origin/${originID}`, {
    method: "DELETE",
  });
  const data = await res.json()
  return {message: data.message, status: res.status};
}