// server/routes/auth.js
const express = require('express');
const User = require('../models/User.js'); // Ensure path is correct relative to this file
const { protect, adminOnly } = require('../middleware/auth.js'); // Ensure path is correct

const router = express.Router(); // Initialize the router

// --- Helper Function for Centralized Error Handling ---
const handleServerError = (res, error, action = 'perform action') => {
    console.error(`Error during ${action}:`, error.message); // Log the specific error message
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ID format provided for ${action}.` });
    }
     if (error.code === 11000) { // Handle MongoDB duplicate key errors (e.g., unique email)
         return res.status(400).json({ success: false, message: `Value already exists for a unique field during ${action}. Check email.` });
    }
    res.status(500).json({ success: false, message: `Server Error while trying to ${action}. Please try again later.` });
};


// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Generic message
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Generic message
        }
        const token = user.getSignedJwtToken();
        if (!token) {
             console.error("FATAL: Token generation failed. Check JWT_SECRET/JWT_EXPIRES_IN environment variables.");
             return res.status(500).json({ success: false, message: 'Server Error: Could not generate token' });
        }
        res.status(200).json({ success: true, token, role: user.role });
    } catch (error) {
        handleServerError(res, error, 'user login');
    }
});

// @desc    Register a new public user (defaults to 'student' role)
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Backend Validation
    if (!name || !email || !password) { return res.status(400).json({ success: false, message: 'Please provide name, email, and password' }); }
    if (password.length < 6) { return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' }); }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) { return res.status(400).json({ success: false, message: 'Please provide a valid email address' }); }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // Don't reveal that the email is taken for security, use a more general message
            return res.status(400).json({ success: false, message: 'Unable to register with this email.' });
        }

        // Create user - Role defaults to 'student' from model schema
        const user = await User.create({ name, email: email.toLowerCase(), password });

        // Send success message (don't log in automatically unless desired)
        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.',
            userId: user._id // Optionally return ID
        });

    } catch (error) {
        handleServerError(res, error, 'public user registration');
    }
});


// @desc    Register any user (including Admin) - Requires Admin privileges
// @route   POST /api/auth/register
// @access  Private (Admin Only)
router.post('/register', protect, adminOnly, async (req, res) => {
   const { name, email, password, role } = req.body; // Admin can specify role

   // Validation
   if (!name || !email || !password) { return res.status(400).json({ success: false, message: 'Please provide name, email, and password' }); }
   if (password.length < 6) { return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' }); }
   if (role && !['student', 'admin'].includes(role)) { return res.status(400).json({ success: false, message: 'Invalid role specified' }); }

   try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) { return res.status(400).json({ success: false, message: 'User with this email already exists' }); }

     // Create user, allowing admin to set role (defaults to student if role is omitted/invalid)
     const user = await User.create({
         name,
         email: email.toLowerCase(),
         password,
         role: (role && ['admin', 'student'].includes(role)) ? role : 'student'
     });

     res.status(201).json({ success: true, message: 'User registered successfully by admin', userId: user._id });

   } catch (error) {
     handleServerError(res, error, 'admin user registration');
   }
});

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
// @access  Private (Requires login)
router.get('/me', protect, async (req, res) => {
    // req.user is populated by 'protect' middleware and excludes password
    if (!req.user) {
         return res.status(404).json({ success: false, message: 'User not found (token valid but user deleted?)' });
    }
    res.status(200).json({ success: true, data: req.user });
});


module.exports = router; // Export the router