/**
 * @file middleware/validateNote.js
 * 
 * @description Request validation middleware for creating and updating notes.
 *
 * This module ensures that all incoming note data is structurally valid before
 * reaching the controller layer. It prevents:
 *   • Missing required fields
 *   • Invalid dropdown values
 *   • Malformed payloads
 *   • Bad data from reaching MongoDB
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

const { NOTE_TYPES, PRIORITIES, STATUSES } = require('../models/Note');
/**
 * Imports the allowed enums from the Note model:
 *
 *   • NOTE_TYPES   — Allowed categories (e.g., Personal, Work, School)
 *   • PRIORITIES   — Allowed priority values (High, Medium, Low)
 *   • STATUSES     — Allowed status values (In-progress, Completed, etc.)
 *
 * These ensure validation rules stay perfectly aligned with the database schema.
 */


/**
 * Validates incoming note payloads before they reach the controller layer.
 *
 * This middleware is used for:
 *   • POST /notes
 *   • POST /notes/:id
 *
 * Validation strategy:
 *   1. Collect all validation errors into an array
 *   2. If any errors exist → return HTTP 400 with JSON
 *   3. Otherwise → call next() and allow controller to proceed
 *
 * This keeps controllers clean and ensures consistent validation behavior.
 *
 * @function validateNotePayload
 * @param {import('express').Request} req - Express request containing note data in req.body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {void} Sends 400 for invalid data or calls next for valid input.
 */
function validateNotePayload(req, res, next) {
    const errors = [];
    const { title, content, type, priority, status } = req.body;

    // --- Title validation ---
    if (!title || String(title).trim().length < 2) {
        errors.push('Title is required and must contain at least 2 characters.');
    }
    /**
     * Title rules:
     *   • Required
     *   • Must be at least 2 characters
     *   • Prevents empty or meaningless titles
     */


    // --- Content validation ---
    if (!content || String(content).trim().length < 1) {
        errors.push('Content is required.');
    }
    /**
     * Content rules:
     *   • Required
     *   • Must contain at least 1 non-whitespace character
     *   • Prevents empty notes
     */


    // --- Type validation ---
    if (type && !NOTE_TYPES.includes(type)) {
        errors.push(`Type must be one of: ${NOTE_TYPES.join(', ')}.`);
    }
    /**
     * Type rules:
     *   • Optional (defaults applied in controller)
     *   • If provided, must match allowed enums
     *   • Prevents invalid categories from reaching MongoDB
     */


    // --- Priority validation ---
    if (priority && !PRIORITIES.includes(priority)) {
        errors.push(`Priority must be one of: ${PRIORITIES.join(', ')}.`);
    }
    /**
     * Priority rules:
     *   • Optional (defaults applied in controller)
     *   • Must match allowed priority values
     */


    // --- Status validation ---
    if (status && !STATUSES.includes(status)) {
        errors.push(`Status must be one of: ${STATUSES.join(', ')}.`);
    }
    /**
     * Status rules:
     *   • Optional (defaults applied in controller)
     *   • Must match allowed status values
     */


    // --- Final validation decision ---
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed.',
            errors
        });
    }
    /**
     * If any validation errors exist:
     *   • Respond with HTTP 400 Bad Request
     *   • Provide a structured JSON error response
     *   • Prevent controller from executing
     *
     * This ensures consistent error formatting across the app.
     */


    return next();
    /**
     * If validation passes:
     *   • Call next()
     *   • Controller (create/update) executes normally
     */
}

module.exports = validateNotePayload;
/**
 * Exports the middleware so it can be used in:
 *   • routes/noteRoutes.js
 *   • Any other route requiring note validation
 *
 * This keeps validation logic centralized and reusable.
 */
