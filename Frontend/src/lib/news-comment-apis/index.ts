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

