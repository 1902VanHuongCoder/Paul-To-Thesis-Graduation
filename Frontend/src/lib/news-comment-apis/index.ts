import { baseUrl } from "../others/base-url";

interface NewsComment {
  commentID: number;
  userID: string;
  newsID: number;
  content: string;
  likeCount: number;
  dislikeCount: number;
  commentAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user_comments: {
    username: string;
    userID: number;
    email: string;
    avatar?: string;
  };
}


export const fetchNewsComments = async (
  baseUrl: string
): Promise<NewsComment[]> => {
  const response = await fetch(`${baseUrl}/api/news-comment`);
  if (!response.ok) {
    throw new Error("Failed to fetch news comments");
  }
  return response.json();
};

export const fetchNewsCommentsByNewsID = async (
  newsID: number
): Promise<NewsComment[]> => {
  const response = await fetch(`${baseUrl}/api/news-comment/news/${newsID}`);
  if (!response.ok) {
    throw new Error("Failed to fetch news comments by news ID");
  }
  return response.json();
};

export const createNewsComment = async (
  newsID: number,
  userID: string,
  content: string
): Promise<NewsComment> => {
  const response = await fetch(`${baseUrl}/api/news-comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID, newsID, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create news comment");
  }
  return response.json();
}

export const likeNewsComment = async (
  commentID: number
): Promise<boolean> => {
  const response = await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "like" }),
  });

  if (!response.ok) {
    throw new Error("Failed to like news comment");
  }
  return response.ok;
};

export const dislikeNewsComment = async (
  commentID: number
): Promise<boolean> => {
  const response = await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "dislike" }),
  });

  if (!response.ok) {
    throw new Error("Failed to dislike news comment");
  }
  return response.ok;
};

export const deleteNewsComment = async (
  commentID: number
): Promise<{ status: number; message: string }> => {
  const response = await fetch(`${baseUrl}/api/news-comment/${commentID}`, {
    method: "DELETE",
  });
 const data = await response.json();
  return {
    status: response.status,
    message: data.message,
  };
};