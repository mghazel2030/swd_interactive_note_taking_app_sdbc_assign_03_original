/**
 * @file routes/noteRoutes.js
 * 
 * @description Route definitions for EJS note pages and API CRUD endpoints.
 *              This router handles both server-rendered pages (EJS views)
 *              and REST-style JSON API endpoints for notes.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

// Import the Express framework to create a router instance.
const express = require('express');

// Import the noteController, which contains all business logic for
// rendering pages, creating, updating, retrieving, and deleting notes.
const noteController = require('../controllers/noteController');

// Import the requireAuth middleware, which ensures that only authenticated
// users can access the routes defined in this file.
const { requireAuth } = require('../middleware/auth');

// Import the note payload validation middleware, which checks incoming
// request bodies for required fields before creating or updating notes.
const validateNotePayload = require('../middleware/validateNote');

// Import asyncHandler utility to wrap async route handlers and forward
// errors to Express's centralized error-handling middleware.
const asyncHandler = require('../utils/asyncHandler');

// Create a new Express router instance to define note-related routes.
const router = express.Router();

/**
 * Apply authentication middleware to ALL routes in this router.
 * This ensures that every route below requires a valid user session.
 */
router.use(requireAuth);

/**
 * -------------------------------------------------------------------------
 * EJS PAGE ROUTES (Server-rendered views)
 * -------------------------------------------------------------------------
 */

/**
 * GET /notes
 * Renders the main notes page using EJS templates.
 * Wrapped in asyncHandler to catch any async errors.
 */
router.get('/notes', asyncHandler(noteController.renderNotesPage));

/**
 * POST /notes
 * Creates a new note from form submission on the EJS page.
 * validateNotePayload ensures the request body contains valid fields.
 */
router.post('/notes', validateNotePayload, asyncHandler(noteController.createNote));

/**
 * POST /notes/:id
 * Updates an existing note using form submission.
 * validateNotePayload ensures the updated fields are valid.
 */
router.post('/notes/:id', validateNotePayload, asyncHandler(noteController.updateNote));

/**
 * POST /notes/:id/delete
 * Deletes a note from the EJS interface.
 * Uses POST instead of DELETE for form compatibility.
 */
router.post('/notes/:id/delete', asyncHandler(noteController.deleteNote));


/**
 * -------------------------------------------------------------------------
 * API ROUTES (JSON CRUD endpoints)
 * -------------------------------------------------------------------------
 * These routes are used by AJAX calls or external clients.
 * They return JSON instead of rendering EJS views.
 * -------------------------------------------------------------------------
 */

/**
 * GET /api/notes
 * Returns all notes as JSON.
 */
router.get('/api/notes', asyncHandler(noteController.getNotes));

/**
 * GET /api/notes/:id
 * Returns a single note by ID as JSON.
 */
router.get('/api/notes/:id', asyncHandler(noteController.getNoteById));

/**
 * POST /api/notes
 * Creates a new note via API.
 * validateNotePayload ensures the request body is valid.
 */
router.post('/api/notes', validateNotePayload, asyncHandler(noteController.createNote));

/**
 * PUT /api/notes/:id
 * Updates an existing note via API.
 * PUT is used here to follow REST conventions.
 */
router.put('/api/notes/:id', validateNotePayload, asyncHandler(noteController.updateNote));

/**
 * DELETE /api/notes/:id
 * Deletes a note via API.
 */
router.delete('/api/notes/:id', asyncHandler(noteController.deleteNote));

/**
 * Export the router so it can be mounted in the main Express application.
 */
module.exports = router;
