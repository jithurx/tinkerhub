// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Required for the getSignedJwtToken method

const UserSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true, // Ensure emails are unique
    lowercase: true, // Store emails in lowercase for consistency
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  // Role determines access level
  role: {
    type: String,
    enum: ['student', 'admin'], // Allowed roles
    default: 'student'
  },
  // Password - required, min length, not selected by default in queries
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // IMPORTANT: Password field won't be returned in queries by default
  },
  // Timestamps for creation/update tracking
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// --- Mongoose Middleware ---

// Encrypt password using bcrypt BEFORE saving a user document
UserSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt (adds randomness to the hash)
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally recommended
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Proceed to saving the document
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error); // Pass error to Mongoose/Express error handling
  }
});

// --- Mongoose Document Methods ---

// Method to generate a signed JWT for the user
UserSchema.methods.getSignedJwtToken = function() {
  // Check if JWT_SECRET and JWT_EXPIRES_IN are loaded from .env
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      console.error('FATAL ERROR: JWT_SECRET or JWT_EXPIRES_IN not defined in environment variables.');
      // In a real app, you might throw or handle this more gracefully
      // For now, returning null or throwing might be appropriate depending on calling code
      return null;
  }

  // Create payload for the token
  const payload = {
      id: this._id, // User's unique MongoDB ID
      role: this.role // Include user's role for authorization checks
  };

  // Sign the token
  return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Method to compare the user-entered password with the hashed password stored in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword) {
    return false;
  }
  // 'this.password' refers to the hashed password stored in the DB for this user instance.
  // NOTE: You MUST ensure the user document was fetched with the password selected
  // (e.g., using .select('+password') in your login route's findOne call)
  // before calling this method, because the schema has `select: false`.
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false; // Return false on error
  }
};

// Export the model
module.exports = mongoose.model('User', UserSchema);