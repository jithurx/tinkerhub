// server/config/db.js

// Import the Mongoose library
const mongoose = require('mongoose');

/**
 * Asynchronously connects to the MongoDB database using the URI
 * stored in the MONGO_URI environment variable.
 * Logs success or logs an error and exits the process on failure.
 */
const connectDB = async () => {
    try {
        // 1. Retrieve the MongoDB Connection String from environment variables
        const dbUri = process.env.MONGO_URI;

        // 2. Validate that the MONGO_URI environment variable is set
        if (!dbUri) {
            // Log a fatal error message if the URI is missing
            console.error('FATAL ERROR: MONGO_URI environment variable is not defined.');
            console.error('Please ensure it is set in your .env file or system environment.');
            // Exit the Node.js process immediately with a failure code (1)
            process.exit(1);
        }

        // 3. Attempt to connect to the database using Mongoose
        // mongoose.connect returns a promise that resolves with the connection object on success
        const conn = await mongoose.connect(dbUri);

        // 4. Log a success message including the connected host (useful for verification)
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Note: The connection is managed by Mongoose and kept open for the application's lifetime.
        // No need to explicitly close it here in a long-running server application.

    } catch (error) {
        // 5. Catch any errors that occurred during the connection attempt
        console.error(`Error Connecting to MongoDB: ${error.message}`);

        // 6. Exit the Node.js process with a failure code (1)
        // It's critical to exit if the database connection fails, as the app likely can't function.
        process.exit(1);
    }
};

// 7. Export the connectDB function so it can be imported and used in other files (like server.js)
// Make sure this is exactly 'module.exports = connectDB;' for CommonJS modules
module.exports = connectDB;