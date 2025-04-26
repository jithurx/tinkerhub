// server/routes/auth.js
const express = require('express');
const User = require('../models/User.js'); // Ensure path is correct relative to this file
const { protect, adminOnly } = require('../middleware/auth.js'); // Ensure path is correct

const router = express.Router(); // Initialize the router

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
// Handler function starts here: async (req, res) => { ... }
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        // Find user by email - Crucially select the password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Generic message
        }

        // Check if password matches the hashed password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Generic message
        }

        // Password matched, generate JWT
        const token = user.getSignedJwtToken();

        if (!token) {
             console.error("FATAL: Token generation failed. Check JWT_SECRET environment variable.");
             return res.status(500).json({ success: false, message: 'Server Error: Could not generate token' });
        }

        // Send successful response
        res.status(200).json({
            success: true,
            token,
            role: user.role
        });

    } catch (error) {
        console.error("Login API Error:", error);
        res.status(500).json({ success: false, message: 'Server Error during login process' });
    }
}); // End of handler function for POST /login

// @desc    Register a new user (Example: Admin Only)
// @route   POST /api/auth/register
// @access  Private (Admin)
// Handler function starts here: async (req, res) => { ... }
router.post('/register', protect, adminOnly, async (req, res) => {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Create user (password will be hashed by pre-save middleware in User.js)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password, // Pass plain password, hashing happens in model
            role: (role && ['admin', 'student'].includes(role)) ? role : 'student' // Validate/default role
        });

        // Send success response (don't send back password info)
        res.status(201).json({ success: true, message: 'User registered successfully', userId: user._id });

    } catch (error) {
        console.error("Registration API Error:", error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        // Handle duplicate key error (though findOne check should catch it first)
        if (error.code === 11000) {
             return res.status(400).json({ success: false, message: 'Email already exists (duplicate key).' });
        }
        res.status(500).json({ success: false, message: 'Server Error during registration' });
    }
}); // End of handler function for POST /register

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
// @access  Private (Requires login via 'protect' middleware)
// Handler function starts here: async (req, res) => { ... }
router.get('/me', protect, async (req, res) => {
    // If code reaches here, 'protect' middleware was successful and attached req.user
    // req.user already excludes the password due to .select('-password') in protect middleware
    res.status(200).json({ success: true, data: req.user });

}); // End of handler function for GET /me


// Export the router instance so it can be mounted in server.js
module.exports = router;