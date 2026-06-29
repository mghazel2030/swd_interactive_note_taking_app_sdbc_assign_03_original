/**
 * @file controllers/authController.js
 * 
 * @description Controller functions for Google login, session creation, and logout.
 *              This module handles:
 *                • Rendering the login page
 *                • Validating redirect paths
 *                • Verifying Google ID tokens
 *                • Creating secure server-side sessions
 *                • Logging users out
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

const { saveUserToSession, verifyGoogleCredential } = require('../middleware/auth');
/**
 * Imports two authentication helpers:
 *
 * 1. verifyGoogleCredential(credential)
 *      - Validates the Google ID token using Google’s public keys.
 *      - Normalizes the user profile (email, name, picture, etc.).
 *
 * 2. saveUserToSession(req, user)
 *      - Stores the normalized user object in req.session.user.
 *      - Persists authentication via secure session cookies.
 *
 * These helpers keep the controller clean and modular.
 */


/**
 * Validates that a redirect path is internal to this application.
 *
 * This prevents open-redirect vulnerabilities.
 * Example:
 *    GOOD: /notes
 *    BAD:  https://evil.com?stealSession=true
 *
 * Attackers often try to trick login flows into redirecting users to malicious URLs.
 * This function ensures the redirect stays inside your app.
 *
 * @param {string|undefined} nextPath - Requested redirect destination.
 * @returns {string} Safe internal redirect destination.
 */
function getSafeRedirectPath(nextPath) {
    // Only allow paths that:
    //   • Are strings
    //   • Start with a single slash (/)
    //   • Do NOT start with double slashes (//), which indicate external URLs
    if (typeof nextPath === 'string' && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
        return nextPath;
    }

    // Fallback redirect if the path is unsafe or missing
    return '/notes';
}


/**
 * Renders the login page containing the Google Identity Services button.
 *
 * If the user is already authenticated (req.session.user exists),
 * they are immediately redirected to the requested page instead of seeing the login screen.
 *
 * @function renderLoginPage
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @returns {void} Renders views/auth/login.ejs or redirects already-authenticated users.
 */
function renderLoginPage(req, res) {
    // If the user already has a session, skip login page entirely.
    if (req.session && req.session.user) {
        return res.redirect(getSafeRedirectPath(req.query.next));
    }

    // Otherwise, render the login page with required variables.
    return res.render('auth/login', {
        title: 'Sign In | Note Taking App',
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        next: getSafeRedirectPath(req.query.next),
        error: req.query.error || null,
        user: null
    });
}


/**
 * Verifies a Google ID token, creates a server-side session, and redirects to the app.
 *
 * Flow:
 *   1. Browser sends POST /auth/google with credential=<ID token>.
 *   2. Server verifies the token using verifyGoogleCredential().
 *   3. Server stores normalized user in req.session.user.
 *   4. User is redirected to the protected page they originally requested.
 *
 * This ensures:
 *   • No repeated Google prompts
 *   • No client-side token storage
 *   • Secure session-based authentication
 *
 * @async
 * @function handleGoogleLogin
 * @param {import('express').Request} req - Express request containing req.body.credential.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>} Redirects to the requested protected page or returns JSON for API callers.
 */
async function handleGoogleLogin(req, res) {
    try {
        const credential = req.body.credential;
        const nextPath = getSafeRedirectPath(req.body.next);

        // If Google did not return a credential, redirect with error.
        if (!credential) {
            return res.redirect(`/login?error=missing-credential&next=${encodeURIComponent(nextPath)}`);
        }

        // Verify Google ID token and extract normalized user profile.
        const user = await verifyGoogleCredential(credential);

        // Store user in session (server-side).
        saveUserToSession(req, user);

        // If the client prefers JSON (API client), return JSON instead of redirect.
        if (req.accepts('json') && !req.accepts('html')) {
            return res.status(200).json({ message: 'Login successful.', user });
        }

        // Otherwise redirect to the protected page.
        return res.redirect(nextPath);

    } catch (error) {
        // Any verification error results in invalid-token redirect.
        return res.redirect('/login?error=invalid-token');
    }
}


/**
 * Logs out the current user by destroying the server-side session.
 *
 * Steps:
 *   1. Destroy req.session
 *   2. Clear session cookie
 *   3. Redirect to login page
 *
 * This ensures:
 *   • No leftover session data
 *   • No stale cookies
 *   • Clean logout flow
 *
 * @function logout
 * @param {import('express').Request} req - Express request with session support.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {void} Redirects to /login after the session is destroyed.
 */
function logout(req, res, next) {
    // If no session exists, simply redirect to login.
    if (!req.session) {
        return res.redirect('/login');
    }

    // Destroy the session.
    return req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        // Remove session cookie from browser.
        res.clearCookie(process.env.SESSION_NAME || 'note_app_sid');

        // Redirect user to login page.
        return res.redirect('/login');
    });
}


module.exports = {
    renderLoginPage,
    handleGoogleLogin,
    logout,
    getSafeRedirectPath
};
/**
 * Exports all controller functions for use in:
 *   • routes/authRoutes.js
 *   • other modules needing safe redirect logic
 *
 * This keeps authentication logic centralized and reusable.
 */
