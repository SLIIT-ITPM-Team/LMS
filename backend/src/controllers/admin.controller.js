const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const Module = require('../models/Module');

const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        return false;
    }
    return true;
};

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    assignedModules: user.assignedModules,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// @desc    List users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, department, active, q, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (active === 'true' || active === 'false') filter.isActive = active === 'true';
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
        ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .populate('department', 'name')
            .populate('assignedModules', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(filter),
    ]);

    res.json({
        users,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .populate('department', 'name')
        .populate('assignedModules', 'name code');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({ user });
});

// @desc    Create user as admin
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    if (!handleValidation(req, res)) return;

    const { name, email, password, role = 'student', department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role, department });
    res.status(201).json({ user: sanitizeUser(user) });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role, department, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
            res.status(400);
            throw new Error('Email is already in use');
        }
        user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    const updated = await user.save();
    res.json({ message: 'User updated successfully', user: sanitizeUser(updated) });
});

// @desc    Delete user (soft or hard)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const { permanent } = req.query;
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (permanent === 'true') {
        await User.deleteOne({ _id: user._id });
        return res.json({ message: 'User permanently deleted' });
    }

    user.isActive = false;
    await user.save();
    return res.json({ message: 'User deactivated successfully' });
});

// @desc    Assign module(s) to student
// @route   POST /api/admin/users/:id/assign-module
// @access  Private/Admin
const assignModule = asyncHandler(async (req, res) => {
    const { moduleId, moduleIds = [] } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'student') {
        res.status(400);
        throw new Error('Modules can only be assigned to students');
    }

    const selectedIds = Array.from(new Set([...(moduleId ? [moduleId] : []), ...moduleIds]));
    if (selectedIds.length === 0) {
        res.status(400);
        throw new Error('At least one module is required');
    }

    const modules = await Module.find({ _id: { $in: selectedIds } });
    if (modules.length !== selectedIds.length) {
        res.status(400);
        throw new Error('One or more selected modules are invalid');
    }

    for (const mod of modules) {
        if (!mod.students.some((s) => String(s) === String(user._id))) {
            mod.students.push(user._id);
            await mod.save();
        }
    }

    const currentAssigned = new Set(user.assignedModules.map((m) => String(m)));
    for (const id of selectedIds) {
        currentAssigned.add(String(id));
    }
    user.assignedModules = Array.from(currentAssigned);

    const updatedUser = await user.save();
    await updatedUser.populate('assignedModules', 'name code');

    res.json({ message: 'Module(s) assigned successfully', user: sanitizeUser(updatedUser) });
});

// @desc    Dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getStatistics = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalStudents,
        totalAdmins,
        activeUsers,
        totalDepartments,
        totalModules,
        departmentBreakdown,
        recentUsers,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isActive: true }),
        Department.countDocuments(),
        Module.countDocuments(),
        User.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            {
                $project: {
                    _id: 0,
                    departmentId: '$_id',
                    department: { $ifNull: [{ $arrayElemAt: ['$department.name', 0] }, 'Unassigned'] },
                    count: 1,
                },
            },
        ]),
        User.find()
            .select('name email role createdAt isActive')
            .sort({ createdAt: -1 })
            .limit(8),
    ]);

    res.json({
        totals: {
            totalUsers,
            totalStudents,
            totalAdmins,
            activeUsers,
            totalDepartments,
            totalModules,
        },
        departmentDistribution: departmentBreakdown,
        recentUsers,
    });
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private/Admin
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json({ departments });
});

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const exists = await Department.findOne({ name: name?.trim() });
    if (exists) {
        res.status(400);
        throw new Error('Department already exists');
    }

    const department = await Department.create({ name, description });
    res.status(201).json({ department });
});

// @desc    Create module under a department
// @route   POST /api/admin/modules
// @access  Private/Admin
const createModule = asyncHandler(async (req, res) => {
    const { name, code, description, department } = req.body;

    if (!name?.trim() || !code?.trim() || !department) {
        res.status(400);
        throw new Error('Name, code and department are required');
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
        res.status(404);
        throw new Error('Department not found');
    }

    const exists = await Module.findOne({ code: code.trim() });
    if (exists) {
        res.status(400);
        throw new Error('Module code already exists');
    }

    const moduleDoc = await Module.create({
        name: name.trim(),
        code: code.trim(),
        description: description?.trim() || '',
        department,
    });

    await moduleDoc.populate('department', 'name');
    res.status(201).json({ module: moduleDoc });
});

// @desc    Get modules for assignment UI
// @route   GET /api/admin/modules
// @access  Private/Admin
const getModules = asyncHandler(async (req, res) => {
    const { department } = req.query;
    const filter = {};
    if (department) filter.department = department;

    const modules = await Module.find(filter)
        .select('name code description department createdAt')
        .populate('department', 'name')
        .sort({ name: 1 });

    res.json({ modules });
});

module.exports = {
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
};
