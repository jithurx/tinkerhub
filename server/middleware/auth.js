// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js'); // Path relative to this file (middleware folder)

/**
 * Middleware to protect routes by verifying JWT token.
 * Attaches the user document (excluding password) to req.user if successful.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer <token>)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the secret from environment variables
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with the token ID
            // Select '-password' to ensure password hash isn't attached to the request object
            req.user = await User.findById(decoded.id).select('-password');

            // Check if user still exists
            if (!req.user) {
                 console.warn(`Authorization denied: User ${decoded.id} not found.`);
                 return res.status(401).json({ success: false, message: 'Not authorized (user not found)' });
            }

            // Token is valid, user exists - proceed to the next middleware or route handler
            next();

        } catch (error) {
            // Handle specific JWT errors or general verification failures
            console.error('Token Verification Error:', error.message);
            let message = 'Not authorized (token failed)';
            if (error.name === 'JsonWebTokenError') {
                message = 'Not authorized (invalid token)';
            } else if (error.name === 'TokenExpiredError') {
                message = 'Not authorized (token expired)';
            }
            return res.status(401).json({ success: false, message: message });
        }
    }

    // If no token was found in the header
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized (no token provided)' });
    }
};

/**
 * Middleware to authorize access only for users with the 'admin' role.
 * IMPORTANT: This middleware MUST run AFTER the 'protect' middleware,
 * as it relies on req.user being populated.
 */
const adminOnly = (req, res, next) => {
    // Check if req.user was successfully attached by 'protect' middleware
    if (req.user && req.user.role === 'admin') {
        // User exists and is an admin, allow access
        next();
    } else {
        // User is either not logged in (should have been caught by protect)
        // or does not have the admin role.
        res.status(403).json({ success: false, message: 'User role not authorized for this resource' }); // 403 Forbidden
    }
};

// Export the middleware functions so they can be imported in route files
module.exports = {
    protect,
    adminOnly
};