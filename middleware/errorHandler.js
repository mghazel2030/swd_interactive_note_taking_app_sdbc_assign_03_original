/**
 * @file middleware/errorHandler.js
 * 
 * @description Centralized Express error handler.
 *
 * This module provides a single place where all application errors are formatted
 * and returned to the client. It ensures:
 *   • Consistent JSON responses for API routes
 *   • Consistent EJS-rendered error pages for HTML routes
 *   • No accidental leakage of stack traces to end users
 *   • Predictable behavior across controllers and middleware
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

/**
 * Sends consistent error responses for API and page requests.
 *
 * This function is an Express error-handling middleware. Express identifies it
 * automatically because it has four parameters: (err, req, res, next).
 *
 * Behavior:
 *   • Extracts statusCode and message from the error object
 *   • Defaults to HTTP 500 and "Internal Server Error"
 *   • If the request is an API route (/api/*), returns JSON
 *   • Otherwise renders an EJS error page
 *
 * @function errorHandler
 * @param {Error} err - Error thrown by a previous middleware/controller.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {void} Sends JSON or renders an EJS error page.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    // Determine the HTTP status code:
    //   • err.statusCode (custom errors)
    //   • err.status (common in some libraries)
    //   • fallback: 500 Internal Server Error
    const statusCode = err.statusCode || err.status || 500;

    // Determine the message to show:
    //   • err.message (developer-provided)
    //   • fallback: generic message
    const message = err.message || 'Internal Server Error';

    // If the request is for an API route, return JSON instead of HTML.
    // This prevents API clients from receiving HTML pages.
    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({ message });
    }

    // Otherwise render an EJS error page.
    // The EJS template receives:
    //   • title — page title
    //   • message — human-readable error message
    //   • statusCode — numeric HTTP status
    return res.status(statusCode).render('errors/error', {
        title: 'Application Error',
        message,
        statusCode
    });
}

module.exports = errorHandler;
/**
 * Tell Node.js:
 *
 *  - The public interface of this file is the errorHandler function.
 *  - When another file imports this module, give them this function.
 */