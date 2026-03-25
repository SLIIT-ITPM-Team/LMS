const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const { generateToken } = require('../utils/jwt');

const serializeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    assignedModules: user.assignedModules,
});

const resolveDepartmentId = async (departmentInput) => {
    if (!departmentInput) return undefined;

    if (mongoose.Types.ObjectId.isValid(departmentInput)) {
        return departmentInput;
    }

    const name = String(departmentInput).trim();
    if (!name) return undefined;

    let department = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!department) {
        department = await Department.create({ name, description: `${name} Department` });
    }

    return department._id;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (admin role assignment is restricted)
const register = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Public registration always creates students.
    // Admin creation should go through /api/admin/users.
    const safeRole = role === 'admin' ? 'student' : (role || 'student');

    const departmentId = await resolveDepartmentId(department);

    const user = await User.create({
        name,
        email,
        password,
        role: safeRole,
        department: departmentId,
    });

    if (user) {
        res.status(201).json({
            user: serializeUser(user),
            token: generateToken(user),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user and issue token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('department', 'name');

    if (!user || !user.isActive) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
        user: serializeUser(user),
        token: generateToken(user),
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .populate('department', 'name')
        .populate('assignedModules', 'name code');

    res.json({ user });
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, department } = req.body;

    const user = await User.findById(req.user._id);
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
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (department) {
        user.department = await resolveDepartmentId(department);
    }

    const updatedUser = await user.save();
    res.json({
        message: 'Profile updated successfully',
        user: serializeUser(updatedUser),
    });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
});

// @desc    Logout (client token invalidation entrypoint)
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
    res.json({ message: 'Logout successful. Please remove token client-side.' });
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout,
};
