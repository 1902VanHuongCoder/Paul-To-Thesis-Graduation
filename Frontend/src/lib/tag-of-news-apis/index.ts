import { baseUrl } from "../others/base-url";

export const fetchTagsOfNews = async () => {
    const res = await fetch(`${baseUrl}/api/tag-of-news`);
    if (!res.ok) throw new Error("Failed to fetch tags of news");
    return res.json();
};

export const createTagOfNews = async (tagName: string) => {
    const res = await fetch(`${baseUrl}/api/tag-of-news`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagName }),
    });

    if (!res.ok) throw new Error("Failed to create tag of news");
    return res.json();
};

export const updateTagOfNews = async (tagID: number, tagName: string) => {
    const res = await fetch(`${baseUrl}/api/tag-of-news/${tagID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagName }),
    });

    if (!res.ok) throw new Error("Failed to update tag of news");
    return res.ok;
};

export const deleteTagOfNews = async (tagID: number) => {
    const res = await fetch(`${baseUrl}/api/tag-of-news/${tagID}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete tag of news");
    return res.ok;
}