const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];

        // Dev/demo bypass: allow client-side demo tokens to map to default admin
        if (token.startsWith('demo-token')) {
            const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com';
            const adminUser = await User.findOne({ email });
            if (adminUser) {
                req.user = adminUser;
                return next();
            }
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user || !req.user.isActive) {
                res.status(401);
                throw new Error('Not authorized, user does not exist or is inactive');
            }
            return next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    res.status(401);
    throw new Error('Not authorized, no token');
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Not authorized for this action',
            });
        }

        next();
    };
};

const checkOwnership = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const resourceUserId = req.params[paramName];
        if (req.user.role === 'admin' || String(req.user._id) === String(resourceUserId)) {
            return next();
        }

        return res.status(403).json({ message: 'You can only access your own data' });
    };
};

module.exports = { protect, authorize, checkOwnership };
