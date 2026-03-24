const asyncHandler = require('../utils/asyncHandler');
const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
        res.status(400);
        throw new Error('Department already exists');
    }

    const department = await Department.create({
        name,
        description,
    });

    res.status(201).json(department);
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({});
    res.json(departments);
});

module.exports = { createDepartment, getDepartments };
