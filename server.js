/**
 * @file server.js
 * @description Server bootstrap file. It imports the configured Express app and starts listening.
 */

const app = require('./app');

const PORT = process.env.PORT || 5000;

/**
 * Starts the Express HTTP server.
 * Keeping listen() outside app.js makes app.js reusable by Supertest.
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
