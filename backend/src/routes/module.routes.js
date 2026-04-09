const express = require('express');
const {
    createModule,
    enrollStudent,
    getMyModules,
} = require('../controllers/module.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/my-modules', protect, authorize('student'), getMyModules);
router.post('/', protect, authorize('admin'), createModule);
router.post('/:id/enroll', protect, authorize('admin'), enrollStudent);

module.exports = router;
