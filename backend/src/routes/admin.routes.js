const express = require('express');
const { body } = require('express-validator');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignModule,
    getStatistics,
    getDepartments,
    createDepartment,
    createModule,
    getModules,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post(
    '/users',
    [
        body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
            .withMessage('Password must include uppercase, lowercase, and a number'),
        body('role').isIn(['student', 'admin']).withMessage('Role must be student or admin'),
    ],
    createUser
);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/assign-module', assignModule);

router.get('/statistics', getStatistics);
router.get('/departments', getDepartments);
router.post('/departments', [body('name').notEmpty().withMessage('Department name is required')], createDepartment);
router.get('/modules', getModules);
router.post(
    '/modules',
    [
        body('name').trim().notEmpty().withMessage('Module name is required'),
        body('code').trim().notEmpty().withMessage('Module code is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('academicYear').isIn(['Year 1', 'Year 2', 'Year 3', 'Year 4']).withMessage('Academic year is required'),
        body('academicSemester').isIn(['1st Semester', '2nd Semester']).withMessage('Academic semester is required'),
    ],
    createModule
);

module.exports = router;
