// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating tokens

// Define a sub-schema for programming languages within the User document
// {_id: false} prevents Mongoose from creating default _id for subdocuments in the array
const ProgrammingLanguageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Language name cannot be empty'],
        trim: true
    },
    // Proficiency stored as a number (e.g., percentage 0-100) for progress bars
    proficiency: {
        type: Number,
        min: [0, 'Proficiency cannot be less than 0'],
        max: [100, 'Proficiency cannot be more than 100'],
        default: 0,
        // Custom validator example (optional): Ensure it's an integer
        validate : {
             validator : Number.isInteger,
             message   : '{VALUE} is not an integer value for proficiency'
        }
    }
}, { _id: false });

// Define a sub-schema for social media links
// {_id: false} prevents Mongoose from creating a default _id for this embedded object
const SocialLinksSchema = new mongoose.Schema({
    github: {
        type: String,
        trim: true
        // Optional: Add validation for URL format if desired
        // match: [/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+?\/?$/, 'Invalid GitHub profile URL']
    },
    linkedin: {
        type: String,
        trim: true
        // match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+?\/?$/, 'Invalid LinkedIn profile URL']
    },
    instagram: {
        type: String,
        trim: true
        // match: [/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+?\/?$/, 'Invalid Instagram profile URL']
    }
    // Add fields for other platforms like 'twitter', 'website', etc. if needed
}, { _id: false });


// --- Main User Schema ---
const UserSchema = new mongoose.Schema({
    // --- Core Fields ---
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // Ensure emails are unique across all users
        lowercase: true, // Store emails consistently in lowercase
        trim: true,
        match: [ // Basic email format validation regex
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address'
        ]
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'admin'],
            message: 'Role must be either "student" or "admin"' // Custom error message
        },
        default: 'student' // New users are students by default
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // IMPORTANT: Prevents password hash from being sent back in queries by default
    },

    // --- Profile Fields ---
    profilePictureUrl: {
        type: String,
        trim: true,
        default: 'images/default-avatar.png' // Default avatar path (relative to frontend static assets)
        // Consider adding validation for URL format if users provide custom URLs
    },
    about: {
        type: String,
        maxlength: [500, 'About section cannot exceed 500 characters'],
        trim: true,
        default: '' // Default to an empty string
    },
    // Embed the programming languages schema as an array
    // Mongoose will validate each object in the array against ProgrammingLanguageSchema
    programmingLanguages: {
        type: [ProgrammingLanguageSchema],
        default: [] // Default to an empty array
    },
    // Embed the social links schema as a single object
    socials: {
        type: SocialLinksSchema,
        default: () => ({}) // Default to an empty object
    }

}, {
    // --- Schema Options ---
    timestamps: true // Automatically adds createdAt and updatedAt fields
});


// --- Mongoose Middleware ---

// Hash password before saving the user document (only if password changed)
UserSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified (or is new)
    if (!this.isModified('password')) {
        return next(); // Skip hashing if password wasn't changed
    }

    console.log(`Hashing password for user: ${this.email}`); // Optional log
    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        // Hash password with salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Continue with the save operation
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error); // Pass error to Mongoose/Express
    }
});


// --- Mongoose Document Methods ---

// Method to generate a signed JWT for this specific user instance
UserSchema.methods.getSignedJwtToken = function() {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        console.error('FATAL ERROR: JWT environment variables not set.');
        return null;
    }
    const payload = { id: this._id, role: this.role };
    try {
         return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    } catch(error) {
        console.error("Error signing JWT:", error);
        return null;
    }
};

// Method to compare an entered password with the user's stored hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    if (!enteredPassword || !this.password) { // Check if entered or stored password exists
        return false;
    }
    // IMPORTANT: The document MUST have been fetched including the password field
    // (e.g., using .select('+password')) because the schema has 'select: false'.
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('Error comparing password:', error);
        return false; // Return false on bcrypt error
    }
};


// --- Export Model ---
module.exports = mongoose.model('User', UserSchema);