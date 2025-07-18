import { Router } from 'express';
import {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
} from '../controllers/diseaseController';

const router = Router();

// GET all diseases
router.get('/', getAllDiseases);

// GET disease by ID
router.get('/:id', getDiseaseById);

// POST create new disease
router.post('/', createDisease);

// PUT update disease
router.put('/:id', updateDisease);

// DELETE disease
router.delete('/:id', deleteDisease);

export default router;
