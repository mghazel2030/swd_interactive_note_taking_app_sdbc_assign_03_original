/**
 * @file middleware/auth.js
 * 
 * @description Authentication helpers for Google Sign-In, session-based 
 * access control, and development/test API headers.
 *
 * This module provides:
 *   • Google ID token verification
 *   • Normalized user object creation
 *   • Session-based authentication
 *   • Test/development header-based authentication
 *   • Route protection middleware (requireAuth)
 *
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

// Google authentication
const { OAuth2Client } = require('google-auth-library');
/**
 * Imports Google's official OAuth2 client.
 * Used to verify Google Identity Services ID tokens server-side.
 */

// Google client ID
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Creates a reusable OAuth2 client instance using the app's Google Client ID.
 * Required for verifying ID tokens issued by Google Identity Services.
 */


/**
 * Builds a normalized application user object from a verified Google ID-token payload.
 *
 * Google returns many fields in the ID token. The application only needs:
 *   • sub (Google subject ID — stable unique identifier)
 *   • email
 *   • name (fallback to email)
 *   • picture (optional)
 *
 * This normalized object is safe to store in the session.
 *
 * @param {object} payload - Verified Google token payload returned by google-auth-library.
 * @returns {{id: string, email: string, name: string, picture: string|null}} Normalized user object.
 */
function buildGoogleUser(payload) {
    return {
        id: payload.sub,                 // Stable Google user ID
        email: payload.email,            // Primary email
        name: payload.name || payload.email, // Fallback to email if name missing
        picture: payload.picture || null // Optional profile picture
    };
}


/**
 * Indicates whether the incoming request expects an HTML response.
 *
 * Logic:
 *   • If URL does NOT start with /api
 *   • AND request accepts HTML
 *   → treat as a browser page request
 *
 * This distinction is important because:
 *   • HTML clients should be redirected to /login
 *   • API clients should receive JSON 401 errors
 *
 * @param {import('express').Request} req - Express request.
 * @returns {boolean} True when the request appears to target an HTML page.
 */
function wantsHtml(req) {
    return !req.originalUrl.startsWith('/api') && req.accepts('html');
}


/**
 * Stores an authenticated user in the current session.
 *
 * After login:
 *   • req.session.user is set
 *   • Browser receives a session cookie
 *   • Future requests automatically restore req.session.user
 *
 * This avoids repeated Google prompts and keeps authentication server-side.
 *
 * @param {import('express').Request} req - Express request with session support.
 * @param {{id: string, email: string, name: string, picture?: string|null}} user - Normalized authenticated user.
 * @returns {void}
 */
function saveUserToSession(req, user) {
    req.session.user = user;
}


/**
 * Authenticates a Google ID token and returns a normalized application user.
 *
 * Steps:
 *   1. Ensure GOOGLE_CLIENT_ID is configured
 *   2. Verify the ID token using google-auth-library
 *   3. Extract payload
 *   4. Normalize payload using buildGoogleUser()
 *
 * Security:
 *   • Token signature is validated using Google public keys
 *   • Audience must match your Google Client ID
 *   • Prevents spoofed or forged tokens
 *
 * @async
 * @param {string} credential - Google Identity Services ID token.
 * @returns {Promise<{id: string, email: string, name: string, picture: string|null}>} Authenticated user.
 * @throws {Error} Throws when GOOGLE_CLIENT_ID is missing or token verification fails.
 */
async function verifyGoogleCredential(credential) {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not configured.');
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    /**
     * verifyIdToken():
     *   • Validates token signature
     *   • Ensures token was issued for your app
     *   • Ensures token is not expired
     *   • Returns a LoginTicket containing payload
     */

    return buildGoogleUser(ticket.getPayload());
}


/**
 * Express middleware that requires an authenticated user.
 *
 * Authentication order:
 *
 * 1. Test/development API header fallback
 *      • Allows automated tests to bypass Google login
 *      • Uses x-user-id, x-user-email, x-user-name headers
 *
 * 2. Existing server-side session
 *      • User logged in via /auth/google
 *      • req.session.user restored automatically
 *
 * 3. Bearer token or credential field
 *      • API clients may send Google ID tokens directly
 *      • Supports Authorization: Bearer <token>
 *      • Supports credential in body or query
 *
 * 4. Reject unauthenticated access
 *      • HTML clients → redirect to /login
 *      • API clients → JSON 401
 *
 * @async
 * @function requireAuth
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {Promise<void>} Continues to the protected route or rejects unauthenticated access.
 */
async function requireAuth(req, res, next) {
    try {
        // 1. Test environment fallback (used in Mocha tests)
        const headerUserId = req.get('x-user-id');
        if (process.env.NODE_ENV === 'test' && headerUserId) {
            req.user = {
                id: headerUserId,
                email: req.get('x-user-email') || 'test-user@example.com',
                name: req.get('x-user-name') || 'Test User',
                picture: null
            };
            return next();
        }

        // 2. Session-based authentication
        if (req.session && req.session.user) {
            req.user = req.session.user;
            return next();
        }

        // 3. Bearer token or credential-based authentication
        const authorization = req.get('authorization') || '';
        const bearerToken = authorization.startsWith('Bearer ')
            ? authorization.replace('Bearer ', '')
            : null;

        const credential = bearerToken || req.body.credential || req.query.credential;

        if (credential) {
            req.user = await verifyGoogleCredential(credential);

            // Save user to session if available
            if (req.session) {
                saveUserToSession(req, req.user);
            }

            return next();
        }

        // 4. Reject unauthenticated access
        if (wantsHtml(req)) {
            return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
        }

        return res.status(401).json({ message: 'Authentication required.' });

    } catch (error) {
        // Token verification failed
        if (wantsHtml(req)) {
            return res.redirect('/login?error=invalid-token');
        }

        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
}

module.exports = {
    requireAuth,
    buildGoogleUser,
    saveUserToSession,
    verifyGoogleCredential
};
