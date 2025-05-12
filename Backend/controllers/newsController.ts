import { Request, Response } from "express";
import { News, TagOfNews, NewsTagOfNews } from "../models";

// GET all news articles
export const getAllNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await News.findAll({
      include: [{ model: TagOfNews, as: "tags" }],
    });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news articles:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific news article by ID
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const newsArticle = await News.findByPk(id, {
      include: [{ model: TagOfNews, as: "tags" }],
    });

    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }

    res.status(200).json(newsArticle);
  } catch (error) {
    console.error("Error fetching news article by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new news article
export const createNews = async (req: Request, res: Response): Promise<void> => {
  const { userID, title, subtitle, images, tags } = req.body;

  try {
    // Create the news article
    const newNews = await News.create({
      userID,
      title,
      subtitle,
      images,
      views: 0, // Initialize views to 0
    });

    // Handle tags associated with the news
    if (tags && Array.isArray(tags)) {
      const tagInstances = await TagOfNews.findAll({
        where: { newsTagID: tags },
      });

      if (tagInstances.length !== tags.length) {
        res.status(400).json({ message: "Some tags do not exist" });
        return;
      }

      // Create records in NewsTagOfNews table
      const newsTagRecords = tags.map((tagID: number) => ({
        newsID: newNews.newsID,
        newsTagID: tagID,
      }));
      await NewsTagOfNews.bulkCreate(newsTagRecords);
    }

    res.status(201).json(newNews);
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing news article by ID
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, subtitle, images, tags } = req.body;

  try {
    const newsArticle = await News.findByPk(id);

    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }

    // Update the news article
    await newsArticle.update({
      title,
      subtitle,
      images,
    });

    // Update tags associated with the news
    if (tags && Array.isArray(tags)) {
      const tagInstances = await TagOfNews.findAll({
        where: { newsTagID: tags },
      });

      if (tagInstances.length !== tags.length) {
        res.status(400).json({ message: "Some tags do not exist" });
        return;
      }

      // Remove existing tags and add new ones
      await NewsTagOfNews.destroy({ where: { newsID: id } });
      const newsTagRecords = tags.map((tagID: number) => ({
        newsID: id,
        newsTagID: tagID,
      }));
      await NewsTagOfNews.bulkCreate(newsTagRecords);
    }

    res.status(200).json({ message: "News article updated successfully", newsArticle });
  } catch (error) {
    console.error("Error updating news article:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a news article by ID
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const newsArticle = await News.findByPk(id);

    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }

    // Remove associated tags
    await NewsTagOfNews.destroy({ where: { newsID: id } });

    // Delete the news article
    await newsArticle.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting news article:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};