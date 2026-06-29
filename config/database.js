/**
 * @file config/database.js
 * 
 * @description Centralized MongoDB connection helper for the Note Taking App:
 * 
 *  - This module keeps database connection logic outside controllers, routes, and
 *    the server bootstrap file so that the codebase stays modular and testable.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

const mongoose = require('mongoose');
/**
 * Imports Mongoose, the ODM (Object Data Modeling) library used to:
 *   - Connect to MongoDB
 *   - Define schemas and models
 *   - Provide validation and query helpers
 * 
 * All database operations in the app rely on this single Mongoose instance.
 */


/**
 * Connects the application to MongoDB using a Mongoose connection string.
 *
 * @async
 * @function connectDatabase
 * @param {string} mongoConnection - MongoDB Atlas or local MongoDB connection string.
 * @returns {Promise<typeof mongoose>} Resolved Mongoose instance after connection succeeds.
 * @throws {Error} Throws when the connection string is missing or MongoDB rejects the connection.
 */
async function connectDatabase(mongoConnection) {
    if (!mongoConnection) {
        throw new Error('MONGO_CONNECTION is missing. Add it to your .env file.');
    }
    /**
     * Defensive check:
     *   - Ensures the environment variable is present.
     *   - Prevents Mongoose from attempting to connect with an undefined URI.
     *   - Provides a clear error message for developers.
     */

    mongoose.set('strictQuery', true);
    /**
     * Enables strictQuery mode:
     *   - Prevents ambiguous or unsafe query filters.
     *   - Forces Mongoose to only accept fields defined in schemas.
     *   - Helps avoid accidental queries using misspelled or invalid fields.
     */

    return mongoose.connect(mongoConnection);
    /**
     * Initiates the actual MongoDB connection.
     * 
     * mongoose.connect():
     *   - Returns a Promise.
     *   - Resolves when the connection is successful.
     *   - Rejects if:
     *       • Credentials are wrong
     *       • Network issues occur
     *       • Cluster is unreachable
     *       • IP whitelist is misconfigured
     * 
     * The returned Promise is awaited by the caller (usually app.js).
     */
}


/**
 * Disconnects Mongoose from MongoDB.
 * Useful for automated tests and graceful shutdown.
 *
 * @async
 * @function disconnectDatabase
 * @returns {Promise<void>} Resolves after the Mongoose connection is closed.
 */
async function disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    /**
     * readyState values:
     *   0 = disconnected
     *   1 = connected
     *   2 = connecting
     *   3 = disconnecting
     * 
     * This check ensures:
     *   - We only disconnect if a connection exists.
     *   - Prevents unnecessary disconnect calls.
     *   - Avoids errors during test teardown or server shutdown.
     */
}


module.exports = {
    connectDatabase,
    disconnectDatabase
};
/**
 * Exports both functions so they can be used in:
 *   - app.js (server startup)
 *   - test suites (MongoMemoryServer)
 *   - CLI scripts
 * 
 * This keeps database logic centralized and reusable.
 */

