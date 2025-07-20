import { baseUrl } from "./base-url";

// Upload avatar to Cloudinary
export const uploadAvatar = async (avatarFile: File): Promise<string> => {
  // if (!avatarFile) return form.avatar;
  const formData = new FormData();
  formData.append("file", avatarFile);
  const res = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload avatar thất bại");
  const data = await res.json();
  return data.url;
};

export const deleteOneImage = async (url: string): Promise<void> => {
  const res = await fetch(`${baseUrl}/api/upload/single-delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Xóa ảnh thất bại");
};
