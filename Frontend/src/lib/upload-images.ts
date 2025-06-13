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

    