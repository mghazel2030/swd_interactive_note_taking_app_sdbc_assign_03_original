/**
 * @file routes/authRoutes.js
 * 
 * @description Authentication route definitions for login, Google callback handling, and logout.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

// Import the Express framework to create a router instance.
const express = require('express');

// Import the authentication controller containing login, Google OAuth, and logout logic.
const authController = require('../controllers/authController');

// Import asyncHandler utility to wrap async route handlers and forward errors to Express.
const asyncHandler = require('../utils/asyncHandler');

// Create a new Express router instance to define authentication-related routes.
const router = express.Router();

/**
 * GET /login
 * Renders the login page.
 * This route does not require authentication.
 */
router.get('/login', authController.renderLoginPage);

/**
 * POST /auth/google
 * Initiates Google OAuth login flow.
 * Wrapped in asyncHandler to ensure any thrown errors are passed to Express error middleware.
 */
router.post('/auth/google', asyncHandler(authController.handleGoogleLogin));

/**
 * POST /logout
 * Logs the user out by clearing their session.
 */
router.post('/logout', authController.logout);

// Export the router so it can be mounted in the main application (app.js).
module.exports = router;
