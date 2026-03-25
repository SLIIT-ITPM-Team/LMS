import { Router } from 'express';
import upload from '../middlewares/upload.middleware.js';
import {
  uploadMaterial,
  getAllMaterials,
  getMaterialsByModule,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  downloadMaterial,
  generateMaterialSummary,
} from '../controllers/material.controller.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/search', searchMaterials);
router.get('/module/:moduleId', getMaterialsByModule);
router.get('/:id/download', downloadMaterial);
router.get('/:id', getMaterialById);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);
router.post('/:id/summary', generateMaterialSummary);
router.get('/', getAllMaterials);

export default router;
