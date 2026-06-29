/**
 * @file utils/asyncHandler.js
 * 
 * @description Utility wrapper that forwards async controller errors to Express error middleware.
 *              This helper ensures that any rejected Promise inside an async route handler
 *              is automatically passed to Express's `next()` function, preventing unhandled
 *              Promise rejections and eliminating repetitive try/catch blocks in controllers.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

/**
 * Wraps an async Express route handler and forwards rejected promises to next().
 *
 * @function asyncHandler
 * @param {Function} controller - Async Express controller function.
 *                                Must follow the signature (req, res, next).
 *                                The controller may return a Promise or use async/await.
 * @returns {Function} Express-compatible middleware function.
 *                     The returned function executes the controller and ensures that
 *                     any thrown error or rejected Promise is forwarded to Express's
 *                     centralized error-handling middleware.
 */
function asyncHandler(controller) {
    return function wrappedController(req, res, next) {
        // Convert the controller's return value into a Promise.
        // If the controller is async, it already returns a Promise.
        // If it is synchronous, Promise.resolve() wraps the return value.
        Promise.resolve(controller(req, res, next))

            // If the Promise rejects (i.e., the controller throws an error),
            // the error is passed to Express's next() function.
            // This triggers the global error-handling middleware.
            .catch(next);
    };
}

// Export the asyncHandler function so it can be used in route definitions.
module.exports = asyncHandler;
