import { Request, Response } from 'express';
import Disease from '../models/Disease';

// Get all diseases
export const getAllDiseases = async (req: Request, res: Response) => {
    try {
        const diseases = await Disease.findAll();
        res.json(diseases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch diseases' });
    }
};

// Get disease by ID
export const getDiseaseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const disease = await Disease.findByPk(req.params.id);
        if (!disease) {
            res.status(404).json({ error: 'Disease not found' });
            return;
        }
        res.json(disease);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch disease' });
    }
};

// Create new disease
export const createDisease = async (req: Request, res: Response) => {
    console.log("Creating disease with data:", req.body);
    try {
        const newDisease = await Disease.create(req.body);
        res.status(201).json(newDisease);
    } catch (error) {
        console.error("Error creating disease:", error);
        res.status(400).json({ error: 'Failed to create disease' });
    }
};

// Update disease
export const updateDisease = async (req: Request, res: Response): Promise<void> => {
    try {
        const disease = await Disease.findByPk(req.params.id);
        if (!disease) {
            res.status(404).json({ error: 'Disease not found' });
            return;
        }
        await disease.update(req.body);
        res.json(disease);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update disease' });
    }
};

// Delete disease
export const deleteDisease = async (req: Request, res: Response): Promise<void> => {
    try {
        const disease = await Disease.findByPk(req.params.id);
        if (!disease) {
            res.status(404).json({ error: 'Disease not found' });
            return;
        }
        await disease.destroy();
        res.json({ message: 'Disease deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete disease' });
    }
};
