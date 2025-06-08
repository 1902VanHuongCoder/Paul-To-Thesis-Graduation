import { Request, Response } from "express";
import News from "../models/News";
import { NewsComment, NewsTagOfNews, TagOfNews, User } from "../models";

// GET all news articles with tags
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const news = await News.findAll({
      include: [
        {
          model: TagOfNews,
          as: "hastags",
          through: { attributes: [] }, // Exclude join table fields
        },
        {
          model: User,
          as: "author",
          attributes: ["userID", "username", "email"], // Include user details
        },
        {
          model: NewsComment,
          as: "comments",
        },
      ],
    });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getNewsById = async (req: Request, res: Response) => {
  const { newsID } = req.params;
  try {
    const newsArticle = await News.findByPk(newsID, {
      include: [
        {
          model: TagOfNews,
          as: "hastags",
          through: { attributes: [] },
        },
        {
          model: User,
          as: "author",
          attributes: ["userID", "username", "email"], // Include user details
        },
        {
          model: NewsComment,
          as: "comments",
        },
      ],
    });
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }
    res.status(200).json(newsArticle);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new news article
export const createNews = async (req: Request, res: Response) => {
  const {
    userID,
    title,
    titleImageUrl,
    subtitle,
    content,
    slug,
    images,
    tags, // [1,2,3]
    isPublished,
    isDraft,
  } = req.body;
  console.log({
    userID,
    title,
    titleImageUrl,
    subtitle,
    content,
    slug,
    images,
    tags,
    isPublished,
    isDraft,
  });
  try {
    const newNews = await News.create({
      userID,
      title,
      titleImageUrl,
      subtitle,
      content,
      slug,
      images,
      tags,
      isDraft: isDraft,
      isPublished: isPublished,
      views: 0,
    });

    // 2. Insert records into news_tag_of_news for each tag
    if (Array.isArray(tags) && tags.length > 0) {
      const tagRecords = tags.map((newsTagID: number) => ({
        newsID: newNews.newsID,
        newsTagID,
      }));
      await NewsTagOfNews.bulkCreate(tagRecords);
    }

    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing news article by ID
export const updateNews = async (req: Request, res: Response) => {
  const { newsID } = req.params;
  const { title, subtitle, content, slug, images, tags, isPublished, titleImageUrl } = req.body;
  try {
    const newsArticle = await News.findByPk(newsID);
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }

    // Always update tags if provided (not just by length)
    if (Array.isArray(tags)) {
      // Remove all old tags
      await NewsTagOfNews.destroy({
        where: { newsID: newsArticle.newsID },
      });

      // Insert new tags
      if (tags.length > 0) {
        const tagRecords = tags.map((newsTagID: number) => ({
          newsID: newsArticle.newsID,
          newsTagID,
        }));
        await NewsTagOfNews.bulkCreate(tagRecords);
      }
    }

    await newsArticle.update({
      title,
      subtitle,
      content,
      slug,
      tags,
      images,
      isPublished,
      titleImageUrl,
      isDraft: isPublished ? false : true, // If published, set isDraft to false
    });

    res.status(200).json({ message: "News article updated successfully", newsArticle });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// DELETE a news article by ID
export const deleteNews = async (req: Request, res: Response) => {
  const { newsID } = req.params;
  try {
    const newsArticle = await News.findByPk(newsID);
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }
    await NewsTagOfNews.destroy({
      where: {newsID: newsArticle.newsID } 
    })
    await newsArticle.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
