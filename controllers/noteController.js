/**
 * @file controllers/noteController.js
 * 
 * @description Controller functions for note CRUD operations and EJS page rendering.
 *              This module handles:
 *                • Rendering the main notes page
 *                • Creating notes
 *                • Listing notes
 *                • Fetching a single note
 *                • Updating notes
 *                • Soft-deleting notes
 *                • Normalizing incoming payloads
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

const { Note, NOTE_TYPES, PRIORITIES, STATUSES } = require('../models/Note');
/**
 * Imports:
 *   • Note — Mongoose model for notes
 *   • NOTE_TYPES — Allowed categories (School, Work, Personal, etc.)
 *   • PRIORITIES — Allowed priority values (High, Medium, Low)
 *   • STATUSES — Allowed status values (In-progress, Completed, etc.)
 *
 * These constants ensure UI dropdowns and validation remain consistent.
 */


/**
 * Creates a normalized note object from request data and authenticated user data.
 *
 * This function ensures:
 *   • All required fields exist
 *   • Defaults are applied when fields are missing
 *   • Ownership is tied to the authenticated user
 *   • Payloads are sanitized before reaching Mongoose
 *
 * @param {object} body - Request body submitted by form or JSON client.
 * @param {object} user - Authenticated user injected by auth middleware.
 * @returns {object} Sanitized note fields ready for Mongoose creation/update.
 */
function buildNotePayload(body, user) {
    return {
        userId: user.id,                         // Ensures note belongs to authenticated user
        owner: body.owner || user.email || 'unknown-owner', // Owner email fallback
        title: body.title,                       // Required field
        content: body.content,                   // Required field
        type: body.type || 'Personal',           // Default category
        priority: body.priority || 'Medium',     // Default priority
        status: body.status || 'In-progress',    // Default status
        dueDate: body.dueDate || null            // Optional field
    };
}


/**
 * Renders the main EJS notes page.
 *
 * This is the page users see after logging in.
 * It loads:
 *   • All active notes
 *   • Dropdown values
 *   • User info
 *
 * @async
 * @function renderNotesPage
 * @param {import('express').Request} req - Express request with req.user.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Renders views/notes/index.ejs.
 */
async function renderNotesPage(req, res) {
    // Fetch all notes belonging to the authenticated user
    const notes = await Note.find({
        userId: req.user.id,
        deletedAt: null
    }).sort({ createdAt: -1 }); // Newest first

    // Render EJS page with all required data
    res.render('notes/index', {
        title: 'Note Taking & Management App',
        notes,
        user: req.user,
        noteTypes: NOTE_TYPES,
        priorities: PRIORITIES,
        statuses: STATUSES
    });
}


/**
 * Returns all active notes for the authenticated user as JSON.
 *
 * Used by API clients (mobile apps, external tools).
 *
 * @async
 * @function getNotes
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Sends an array of notes.
 */
async function getNotes(req, res) {
    const notes = await Note.find({
        userId: req.user.id,
        deletedAt: null
    }).sort({ createdAt: -1 });

    res.status(200).json(notes);
}


/**
 * Returns one active note owned by the authenticated user.
 *
 * Prevents cross-user access by checking:
 *   • _id matches
 *   • userId matches
 *   • deletedAt is null
 *
 * @async
 * @function getNoteById
 * @param {import('express').Request} req - Express request with note id in req.params.id.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Sends one note or 404.
 */
async function getNoteById(req, res) {
    const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user.id,
        deletedAt: null
    });

    if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
    }

    return res.status(200).json(note);
}


/**
 * Creates a note for the authenticated user.
 *
 * Supports:
 *   • HTML form submissions (redirects to /notes)
 *   • JSON API clients (returns JSON)
 *
 * @async
 * @function createNote
 * @param {import('express').Request} req - Express request containing note payload.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Sends created note as JSON or redirects after form submission.
 */
async function createNote(req, res) {
    const note = await Note.create(buildNotePayload(req.body, req.user));

    // If request came from browser (HTML), redirect to notes page
    if (req.accepts('html') && !req.originalUrl.startsWith('/api')) {
        return res.redirect('/notes');
    }

    // Otherwise return JSON for API clients
    return res.status(201).json(note);
}


/**
 * Updates one note owned by the authenticated user.
 *
 * Ensures:
 *   • Only the owner can update
 *   • Soft-deleted notes cannot be updated
 *   • Payload is sanitized
 *
 * @async
 * @function updateNote
 * @param {import('express').Request} req - Express request with note id and update payload.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Sends updated note, redirects, or 404.
 */
async function updateNote(req, res) {
    const updatePayload = buildNotePayload(req.body, req.user);
    delete updatePayload.userId; // Prevent changing ownership

    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, deletedAt: null },
        updatePayload,
        { new: true, runValidators: true }
    );

    if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.accepts('html') && !req.originalUrl.startsWith('/api')) {
        return res.redirect('/notes');
    }

    return res.status(200).json(note);
}


/**
 * Soft-deletes one note by setting deletedAt instead of removing the document.
 *
 * Soft delete advantages:
 *   • Notes can be restored later
 *   • Keeps audit history
 *   • Prevents accidental permanent deletion
 *
 * @async
 * @function deleteNote
 * @param {import('express').Request} req - Express request with note id in req.params.id.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Sends delete confirmation, redirects, or 404.
 */
async function deleteNote(req, res) {
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
    );

    if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.accepts('html') && !req.originalUrl.startsWith('/api')) {
        return res.redirect('/notes');
    }

    return res.status(200).json({ message: 'Note deleted successfully.' });
}


module.exports = {
    renderNotesPage,
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    buildNotePayload
};
/**
 * Exports all controller functions for use in:
 *   • routes/noteRoutes.js
 *   • other modules needing CRUD logic
 *
 * This keeps note-related business logic centralized and reusable.
 */
