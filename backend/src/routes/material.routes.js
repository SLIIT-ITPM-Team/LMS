const express = require('express');
const upload = require('../middlewares/upload.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  uploadMaterial,
  getAllMaterials,
  getPendingMaterials,
  reviewMaterial,
  getMaterialHierarchy,
  getMaterialsByModule,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  downloadMaterial,
  generateMaterialSummary,
} = require('../controllers/material.controller');

const router = express.Router();

router.use(protect);

router.get('/hierarchy', getMaterialHierarchy);
router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/admin/pending', authorize('admin'), getPendingMaterials);
router.patch('/:id/review', authorize('admin'), reviewMaterial);
router.get('/search', searchMaterials);
router.get('/module/:moduleId', getMaterialsByModule);
router.get('/:id/download', downloadMaterial);
router.get('/:id', getMaterialById);
router.put('/:id', authorize('admin'), updateMaterial);
router.delete('/:id', authorize('admin'), deleteMaterial);
router.post('/:id/summary', authorize('admin'), generateMaterialSummary);
router.get('/', getAllMaterials);

module.exports = router;
