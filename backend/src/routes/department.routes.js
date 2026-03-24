const express = require('express');
const {
    createDepartment,
    getDepartments,
} = require('../controllers/department.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router
    .route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('admin'), createDepartment);

module.exports = router;
