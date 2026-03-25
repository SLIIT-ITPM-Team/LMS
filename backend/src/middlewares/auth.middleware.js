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

module.exports = { protect };
