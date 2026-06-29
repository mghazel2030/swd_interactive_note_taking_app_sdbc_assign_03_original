/**
 * @file routes/homeRoutes.js
 * 
 * @description Route definitions for home and health-check endpoints.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

// Import the Express framework to create routing functionality.
const express = require('express');

// Import the homeController, which contains logic for redirecting
// to the notes page and performing health checks.
const homeController = require('../controllers/homeController');

// Create a new Express router instance to define route handlers
// specific to the home and health-check functionality.
const router = express.Router();

/**
 * GET /
 * Root route of the application.
 * Delegates to homeController.redirectToNotes, which typically
 * redirects the user to the main notes dashboard or another
 * primary application page.
 */
router.get('/', homeController.redirectToNotes);

/**
 * GET /health
 * Health-check endpoint used for uptime monitoring, load balancers,
 * or external services to verify that the server is running.
 * homeController.healthCheck returns a simple JSON response
 * indicating service status.
 */
router.get('/health', homeController.healthCheck);

// Export the router so it can be mounted in the main Express app.
// This allows app.js (or server.js) to use these route definitions.
module.exports = router;
