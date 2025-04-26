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
        default: 0
    }
}, { _id: false });

// Define a sub-schema for social media links
// {_id: false} prevents Mongoose from creating a default _id for this embedded object
const SocialLinksSchema = new mongoose.Schema({
    github: {
        type: String,
        trim: true
        // Optional: Add validation for URL format if desired
    },
    linkedin: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
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
        match: [ // Basic email format validation regex
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address'
        ]
    },
    role: {
        type: String,
        enum: ['student', 'admin'], // Only allow these two roles
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
        default: 'images/default-avatar.png' // Path to a default image in your static assets
        // Consider storing full URLs if using external storage like S3/Cloudinary later
    },
    about: {
        type: String,
        maxlength: [500, 'About section cannot exceed 500 characters'],
        trim: true,
        default: '' // Default to an empty string
    },
    // Embed the programming languages schema as an array
    programmingLanguages: [ProgrammingLanguageSchema],
    // Embed the social links schema as a single object
    socials: SocialLinksSchema

}, {
    // --- Schema Options ---
    timestamps: true // Automatically adds createdAt and updatedAt fields
});


// --- Mongoose Middleware ---

// Hash password before saving the user document (only if password changed)
UserSchema.pre('save', async function(next) {
    // Check if the password field was modified before hashing
    // Avoids re-hashing if only other fields like 'name' or 'about' are updated
    if (!this.isModified('password')) {
        return next(); // Skip hashing if password wasn't changed
    }

    console.log(`Hashing password for user: ${this.email}`); // Optional log
    try {
        // Generate salt (randomness factor)
        const salt = await bcrypt.genSalt(10); // 10 rounds is common
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
    // Ensure required environment variables are set
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        console.error('FATAL ERROR: JWT environment variables not set.');
        // Depending on your error handling strategy, you might:
        // throw new Error('JWT configuration error.');
        return null; // Or return null and let the calling function handle it
    }

    // Create the payload to include in the token
    const payload = {
        id: this._id,   // User's MongoDB document ID
        role: this.role // User's role
    };

    // Sign the token with the secret and expiration time
    try {
         return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    } catch(error) {
        console.error("Error signing JWT:", error);
        return null;
    }
};

// Method to compare an entered password with the user's stored hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Return false immediately if no password was entered
    if (!enteredPassword) {
        return false;
    }
    // 'this.password' refers to the hashed password fetched from the database.
    // IMPORTANT: The document MUST have been fetched including the password field
    // (e.g., using .select('+password')) because the schema has 'select: false'.
    try {
        // Use bcrypt.compare to securely compare plain text with hash
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('Error comparing password:', error);
        return false; // Return false if comparison fails for any reason
    }
};


// --- Export Model ---
// Create and export the Mongoose model based on the schema
module.exports = mongoose.model('User', UserSchema);
// Mongoose will automatically create/use a collection named 'users' (lowercase, pluralized)