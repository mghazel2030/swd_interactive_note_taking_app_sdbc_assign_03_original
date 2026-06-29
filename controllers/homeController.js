/**
 * @file controllers/homeController.js
 * 
 * @description Controller for simple non-CRUD pages.
 *              This module provides:
 *                • A root redirect to the main notes page
 *                • A health-check endpoint for monitoring and load balancers
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

/**
 * Redirects the root URL to the main notes page.
 *
 * This controller is intentionally simple:
 *   - It ensures that visiting "/" always takes the user to "/notes".
 *   - It keeps the root clean and avoids duplicate logic.
 *   - It allows future expansion (e.g., landing page, marketing page) without
 *     affecting the rest of the app.
 *
 * @function redirectToNotes
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {void} Redirects to /notes.
 */
function redirectToNotes(req, res) {
    res.redirect('/notes');
    /**
     * res.redirect('/notes'):
     *   - Sends a 302 redirect by default.
     *   - Browser navigates to /notes.
     *   - If the user is authenticated, /notes loads normally.
     *   - If not authenticated, /notes triggers requireAuth middleware,
     *     which redirects the user to /login.
     *
     * This makes "/" a convenient entry point for both logged-in and logged-out users.
     */
}

/**
 * Returns a health check response for deployment monitoring.
 *
 * This endpoint is used by:
 *   • Cloud providers (Render, Railway, Heroku, AWS, GCP)
 *   • Load balancers
 *   • Uptime monitoring tools (Pingdom, UptimeRobot)
 *   • CI/CD smoke tests
 *
 * It provides a lightweight JSON response indicating that:
 *   - The server is running
 *   - The service name is correct
 *   - No authentication is required
 *
 * @function healthCheck
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {void} Sends status JSON.
 */
function healthCheck(req, res) {
    res.status(200).json({ status: 'OK', service: 'note-taking-app' });
    /**
     * res.status(200).json({ ... }):
     *   - Sends HTTP 200 (success)
     *   - Returns a small JSON payload:
     *       {
     *         status: "OK",
     *         service: "note-taking-app"
     *       }
     *
     * This endpoint does NOT:
     *   - Check database connectivity
     *   - Check session validity
     *   - Check external services
     *
     * It is intentionally lightweight so it can respond even during partial outages.
     *
     * If you want a deeper health check, you could later add:
     *   • DB ping
     *   • Redis ping
     *   • Version info
     *   • Build metadata
     */
}

module.exports = {
    redirectToNotes,
    healthCheck
};
/**
 * Exports both controller functions so they can be used in:
 *   • routes/homeRoutes.js
 *   • server bootstrap (if needed)
 *
 * This keeps non-CRUD logic isolated from CRUD controllers and authentication controllers.
 */
