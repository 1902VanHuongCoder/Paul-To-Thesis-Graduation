import { baseUrl } from "../others/base-url";

export async function fetchNews() {
  const res = await fetch(`${baseUrl}/api/news`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchNewsById(id: number) {
  const res = await fetch(`${baseUrl}/api/news/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createNews({
  userID,
  title,
  titleImageUrl,
  subTitle,
  content,
  slug,
  images,
  tags,
  isPublished,
  isDraft,
}: {
  userID: string;
  title: string;
  titleImageUrl: string;
  subTitle: string;
  content: string;
  slug: string;
  images?: string[];
  tags?: number[];
  isPublished?: boolean;
  isDraft?: boolean;
}) {
  const res = await fetch(`${baseUrl}/api/news`, {
    method: "POST",
    body: JSON.stringify({
      userID,
      title,
      titleImageUrl,
      subTitle,
      content,
      slug,
      images,
      tags,
      isPublished,
      isDraft,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to create news: ${res.statusText}`);
  }

  return res.json();
}

export async function updateNews({
  id,
  userID,
  title,
  titleImageUrl,
  subTitle,
  content,
  slug,
  images,
  tags,
  isPublished,
}: {
  id: number;
  userID: string;
  title: string;
  titleImageUrl: string;
  subTitle: string;
  content: string;
  slug: string;
  images?: string[];
  tags?: number[];
  isPublished?: boolean;
}) {
  const res = await fetch(`${baseUrl}/api/news/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      userID,
      title,
      titleImageUrl,
      subTitle,
      content,
      slug,
      images,
      tags,
      isPublished,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to update news: ${res.statusText}`);
  }

  return res.json();
}

export const updateNewsViews = async (newsID: number) => {
  const res = await fetch(`${baseUrl}/api/news/update-views/${newsID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to update news views: ${res.statusText}`);
  }

  return res.json();
}

export async function deleteNews(id: number) {
  const res = await fetch(`${baseUrl}/api/news/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete news: ${res.statusText}`);
  }

  return res.json();
}
