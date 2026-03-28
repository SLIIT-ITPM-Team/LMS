const express = require('express');
const courseController = require('../controllers/course.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Public routes (both admin and student can access)
router.get('/', protect, courseController.getAllCourses);
router.get('/:id', protect, courseController.getCourseById);
router.get('/module/:moduleId', protect, courseController.getCoursesByModule);

// Admin only routes
router.post('/', 
  protect, 
  authorize('admin'), 
  courseController.createCourse
);

router.put('/:id', 
  protect, 
  authorize('admin'), 
  courseController.updateCourse
);

router.delete('/:id', 
  protect, 
  authorize('admin'), 
  courseController.deleteCourse
);

router.post('/:id/regenerate-summary', 
  protect, 
  authorize('admin'), 
  courseController.regenerateSummary
);

module.exports = router;