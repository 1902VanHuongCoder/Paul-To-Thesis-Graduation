import { Request, Response } from "express";
import News from "../models/News";

// GET all news articles
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const news = await News.findAll();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific news article by ID
export const getNewsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const newsArticle = await News.findByPk(id);
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
    tags,
    isPublished,
    isDraft,
  } = req.body;
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
    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing news article by ID
export const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, subtitle, content, slug, images, tags, isPublished } = req.body;
  try {
    const newsArticle = await News.findByPk(id);
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }
    await newsArticle.update({
      title,
      subtitle,
      content,
      slug,
      images,
      tags,
      isPublished,
    });
    res.status(200).json({ message: "News article updated successfully", newsArticle });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a news article by ID
export const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const newsArticle = await News.findByPk(id);
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }
    await newsArticle.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};