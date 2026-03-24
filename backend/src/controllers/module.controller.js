const asyncHandler = require('../utils/asyncHandler');
const Module = require('../models/Module');
const User = require('../models/User');

// @desc    Create a new module
// @route   POST /api/modules
// @access  Private/Admin
const createModule = asyncHandler(async (req, res) => {
    const { name, code, description, department } = req.body;

    const moduleExists = await Module.findOne({ code });

    if (moduleExists) {
        res.status(400);
        throw new Error('Module code already exists');
    }

    const module = await Module.create({
        name,
        code,
        description,
        department,
    });

    res.status(201).json(module);
});

// @desc    Enroll student in module
// @route   POST /api/modules/:id/enroll
// @access  Private/Admin
const enrollStudent = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.students.includes(userId)) {
        res.status(400);
        throw new Error('Student already enrolled');
    }

    module.students.push(userId);
    await module.save();

    res.json({ message: 'Student enrolled successfully' });
});

// @desc    Get modules for student's department + enrolled modules
// @route   GET /api/modules/my-modules
// @access  Private/Student
const getMyModules = asyncHandler(async (req, res) => {
    // Modules in user's department OR modules where user is specifically enrolled
    const modules = await Module.find({
        $or: [
            { department: req.user.department },
            { students: req.user._id }
        ]
    }).populate('department', 'name');

    res.json(modules);
});

module.exports = { createModule, enrollStudent, getMyModules };
