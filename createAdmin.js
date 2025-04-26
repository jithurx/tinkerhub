// createAdmin.js
require('dotenv').config(); // Load .env variables
const mongoose = require('mongoose');
const User = require('./server/models/User.js'); // Adjust path if needed

// --- Configuration ---
const ADMIN_EMAIL = ''; // Set desired admin email
const ADMIN_PASSWORD = ''; // Set desired admin password
const ADMIN_NAME = '';
// ---------------------

const connectDBAndCreateAdmin = async () => {
    try {
        // Connect to DB (similar to db.js but without exiting)
        const dbUri = process.env.MONGO_URI;
        if (!dbUri) {
            console.error('MONGO_URI not defined in .env');
            return;
        }
        await mongoose.connect(dbUri);
        console.log('MongoDB Connected for script...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
            return; // Don't create duplicates
        }

        // Create the admin user object
        const adminData = {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // Pass plain text password here
            role: 'admin'
        };

        // Create user - Mongoose pre-save hook will hash the password
        const newAdmin = await User.create(adminData);
        console.log('Admin user created successfully:');
        // Manually exclude password from logging
        const adminObj = newAdmin.toObject();
        delete adminObj.password;
        console.log(adminObj);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        // Disconnect Mongoose
        await mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};

// Run the function
connectDBAndCreateAdmin();
