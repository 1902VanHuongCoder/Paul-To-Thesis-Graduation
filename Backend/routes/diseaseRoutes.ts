import { Router } from 'express';
import {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease,
  getDiseaseByEnName
} from '../controllers/diseaseController';

const router = Router();

// GET all diseases
router.get('/', getAllDiseases);

// GET disease by English name (private route)
router.get('/private/by-en-name/:diseaseEnName', getDiseaseByEnName);

// GET disease by ID
router.get('/:id', getDiseaseById);

// POST create new disease
router.post('/', createDisease);

// PUT update disease
router.put('/:id', updateDisease);

// DELETE disease
router.delete('/:id', deleteDisease);

export default router;
