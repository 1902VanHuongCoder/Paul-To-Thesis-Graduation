import { Request, Response } from "express";
import Statistic from "../models/Statistic";

// Get the current statistic (access count)
export const getStatistic = async (req: Request, res: Response): Promise<void> => {
  try {
    let stat = await Statistic.findOne();
    if (!stat) {
      // If not found, create a new record
      stat = await Statistic.create({ accessCount: 0 });
    }
    res.status(200).json(stat);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Increment the access count for the current month/year
export const incrementAccessCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JS months are 0-based
    console.log(`Incrementing access count for ${year}-${month}`);
    let stat = await Statistic.findOne({ where: { year, month } });
    if (!stat) {
      stat = await Statistic.create({ year, month, accessCount: 1 });
    } else {
      stat.accessCount += 1;
      await stat.save();
    }
    res.status(200).json(stat);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// (Optional) Reset the access count to 0
export const resetStatistic = async (req: Request, res: Response): Promise<void> => {
  try {
    let stat = await Statistic.findOne();
    if (!stat) {
      stat = await Statistic.create({ accessCount: 0 });
    } else {
      stat.accessCount = 0;
      await stat.save();
    }
    res.status(200).json(stat);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
