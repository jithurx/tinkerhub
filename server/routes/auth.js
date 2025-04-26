// server/routes/auth.js
const express = require('express');
const User = require('../models/User.js'); // Ensure correct path to model
const { protect, adminOnly } = require('../middleware/auth.js'); // Ensure correct path to middleware

const router = express.Router(); // Initialize the router

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
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
});

// @desc    Register a new user (Example: Admin Only)
// @route   POST /api/auth/register
// @access  Private (Admin)
router.post('/register', protect, adminOnly, async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password, // Hashing handled by pre-save hook
            role: (role && ['admin', 'student'].includes(role)) ? role : 'student'
        });

        res.status(201).json({ success: true, message: 'User registered successfully', userId: user._id });

    } catch (error) {
        console.error("Registration API Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        if (error.code === 11000) {
             return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server Error during registration' });
    }
});

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
// @access  Private (Requires login)
router.get('/me', protect, async (req, res) => {
    // req.user is populated by 'protect' (already excludes password)
    if (!req.user) {
         return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: req.user });
});


// @desc    Update user profile details for the logged-in user
// @route   PUT /api/auth/me
// @access  Private (Requires login)
router.put('/me', protect, async (req, res) => {
    try {
        // User document is attached to req.user by 'protect' middleware
        // Fetch it again here to ensure we have the latest version before saving
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Define fields allowed to be updated from request body
        // Exclude sensitive fields like 'email', 'role', 'password'
        const allowedUpdates = [
            'name',
            'about',
            'profilePictureUrl',
            'socials',
            'programmingLanguages'
        ];

        // Update user fields based on request body
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                 // Special handling for object/array fields to prevent overwriting with non-objects/arrays
                 if (field === 'socials') {
                      if (typeof req.body.socials === 'object' && req.body.socials !== null) {
                           // Optionally validate sub-keys if needed
                           user.socials = { // Create or update, don't merge deeply by default
                                github: req.body.socials.github,
                                linkedin: req.body.socials.linkedin,
                                instagram: req.body.socials.instagram
                                // Add other expected social keys
                           };
                      } else if (req.body.socials === null) { // Allow clearing socials
                          user.socials = undefined;
                      }
                 } else if (field === 'programmingLanguages') {
                      if (Array.isArray(req.body.programmingLanguages)) {
                           // Replace entire array - ensure array items match schema structure
                           // Add validation loop here if needed before assigning
                           user.programmingLanguages = req.body.programmingLanguages;
                      } else if (req.body.programmingLanguages === null || req.body.programmingLanguages.length === 0) {
                           user.programmingLanguages = []; // Allow clearing languages
                      }
                 } else {
                    // Update standard fields
                    user[field] = req.body[field];
                 }
            }
        });

        // Save the updated user document (this will trigger validation)
        const updatedUser = await user.save();

        // Return updated user data (excluding password)
        // Convert to plain object and manually delete password just to be safe
        const responseUser = updatedUser.toObject();
        delete responseUser.password;

        res.status(200).json({ success: true, data: responseUser });

    } catch (error) {
        console.error("Update Profile API Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error updating profile' });
    }
});


module.exports = router; // Export the router