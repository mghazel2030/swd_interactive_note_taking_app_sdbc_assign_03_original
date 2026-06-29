/**
 * @file models/Note.js
 * 
 * @description Mongoose model definition for a note document.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */
// Database mangoose
const mongoose = require('mongoose');

// The types of notes
const NOTE_TYPES = [
    'Personal',
    'Family',
    'School',
    'Work',
    'Financial',
    'Social',
    'Leisure',
    'Miscellaneous'
];

// The notes priorities
const PRIORITIES = ['High', 'Medium', 'Low'];

// The notes status
const STATUSES = ['In-progress', 'Completed', 'Overdue'];

/**
 * Mongoose schema representing a single user-owned note.
 *
 * Design choices:
 * - userId scopes every note to an authenticated user.
 * - deletedAt supports soft-delete behavior instead of immediate hard-delete.
 * - timestamps automatically maintains createdAt and updatedAt.
 */
const noteSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'A note must belong to a user.'],
            index: true
        },
        owner: {
            type: String,
            required: [true, 'Owner email/name is required.'],
            trim: true
        },
        title: {
            type: String,
            required: [true, 'Title is required.'],
            trim: true,
            minlength: [2, 'Title must contain at least 2 characters.'],
            maxlength: [120, 'Title cannot exceed 120 characters.']
        },
        content: {
            type: String,
            required: [true, 'Content is required.'],
            trim: true,
            maxlength: [5000, 'Content cannot exceed 5000 characters.']
        },
        type: {
            type: String,
            enum: NOTE_TYPES,
            default: 'Personal'
        },
        priority: {
            type: String,
            enum: PRIORITIES,
            default: 'Medium'
        },
        status: {
            type: String,
            enum: STATUSES,
            default: 'In-progress'
        },
        dueDate: {
            type: Date,
            default: null
        },
        deletedAt: {
            type: Date,
            default: null,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * Returns true when the note is soft deleted.
 *
 * @method isDeleted
 * @returns {boolean} True if deletedAt has a value, otherwise false.
 */
noteSchema.methods.isDeleted = function isDeleted() {
    return Boolean(this.deletedAt);
};

/**
 * Builds a compact preview of note content for table cards or API consumers.
 *
 * @virtual excerpt
 * @returns {string} First 120 characters of note content.
 */
noteSchema.virtual('excerpt').get(function getExcerpt() {
    if (!this.content) return '';
    return this.content.length > 120 ? `${this.content.slice(0, 117)}...` : this.content;
});

noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

module.exports = {
    Note: mongoose.model('Note', noteSchema),
    NOTE_TYPES,
    PRIORITIES,
    STATUSES
};
