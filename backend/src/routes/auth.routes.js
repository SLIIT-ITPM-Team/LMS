const express = require('express');
const { body } = require('express-validator');
const {
	register,
	login,
	getMe,
	updateProfile,
	changePassword,
	logout,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

const emailValidation = body('email').isEmail().withMessage('Valid email is required');
const passwordValidation = body('password')
	.isLength({ min: 8 })
	.withMessage('Password must be at least 8 characters long')
	.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
	.withMessage('Password must include uppercase, lowercase, and a number');

router.post(
	'/register',
	[
		body('name')
			.trim()
			.isLength({ min: 2, max: 50 })
			.withMessage('Name must be 2-50 chars')
			.matches(/^[A-Za-z\s]+$/)
			.withMessage('Name can contain letters and spaces only'),
		emailValidation,
		passwordValidation,
	],
	register
);
router.post('/login', [emailValidation, body('password').notEmpty().withMessage('Password is required')], login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post(
	'/change-password',
	[
		protect,
		body('currentPassword').notEmpty().withMessage('Current password is required'),
		body('newPassword')
			.isLength({ min: 8 })
			.withMessage('New password must be at least 8 characters long')
			.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
			.withMessage('New password must include uppercase, lowercase, and a number'),
	],
	changePassword
);
router.post('/logout', logout);

module.exports = router;
