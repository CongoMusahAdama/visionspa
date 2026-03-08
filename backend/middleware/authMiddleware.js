const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Get token from cookie
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch admin from database
        req.user = await Admin.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth check error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized, invalidated token' });
    }
};

module.exports = { protect };
