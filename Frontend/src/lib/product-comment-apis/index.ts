import { baseUrl } from "../others/base-url";
export const fetchAllComments = async () => {
  const response = await fetch(`${baseUrl}/api/comment`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
}

export const fetchComments = async (productID: number) => {
  const response = await fetch(`${baseUrl}/api/comment/product/${productID}`);

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
};

export const comment = async (
  userID: string,
  productID: number,
  content: string,
  rating: number,
  status: string
) => {
  const response = await fetch(`${baseUrl}/api/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productID,
      content,
      rating,
      userID,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit comment");
  }

  return response.json();
};

export const fetchCommentByProductID = async (productID: number) => {
  const response = await fetch(`${baseUrl}/api/comment/product/${productID}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments by product ID");
  }
  const data = await response.json();
  if (data.status === "error") {
    throw new Error(data.message);
  }

  return data;
};

export const likeComment = async (commentID: number) => {
  const response = await fetch(`${baseUrl}/api/comment/reaction/${commentID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "like" }),
  });

  if (!response.ok) {
    throw new Error("Failed to like comment");
  }

  return response.json();
};

export const dislikeComment = async (commentID: number) => {
  const response = await fetch(`${baseUrl}/api/comment/reaction/${commentID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "dislike" }),
  });

  if (!response.ok) {
    throw new Error("Failed to dislike comment");
  }

  return response.json();
};

