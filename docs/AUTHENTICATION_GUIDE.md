# Google Authentication and Session Flow Guide

## Goal

The application now asks the user to sign in with Google only once per session. After Google verifies the user, the server stores a small normalized user object in `req.session.user`. Later requests reuse the session cookie, so the user is not repeatedly asked to sign in.

## Flow

```text
Browser requests /notes
        |
        v
requireAuth checks req.session.user
        |
        |-- exists --> render notes page
        |
        |-- missing --> redirect to /login?next=/notes
                         |
                         v
                    Google Sign-In button
                         |
                         v
                    POST /auth/google with credential
                         |
                         v
                    Server verifies token using GOOGLE_CLIENT_ID
                         |
                         v
                    req.session.user = normalized Google user
                         |
                         v
                    Redirect back to /notes
```

## Required Google Cloud Setup

1. Go to Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID.
5. Choose `Web application`.
6. Add this authorized JavaScript origin for local development:

```text
http://localhost:5000
```

7. Copy the generated client ID into `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Required `.env` Values

```env
PORT=5000
MONGO_CONNECTION=mongodb+srv://<username>:<password>@<cluster-url>/note_taking_app?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SESSION_SECRET=replace-this-with-a-long-random-secret
SESSION_NAME=note_app_sid
SESSION_MAX_AGE_MS=86400000
```

## Session Expiration

`SESSION_MAX_AGE_MS=86400000` keeps the login session for 24 hours. You can increase it during development, for example:

```env
SESSION_MAX_AGE_MS=604800000
```

That keeps the session for 7 days.

## Logout

The Logout button sends:

```text
POST /logout
```

The server destroys the session, clears the session cookie, and redirects to `/login`.

## API Behavior

Page routes redirect unauthenticated users to `/login`.

API routes return:

```json
{ "message": "Authentication required." }
```

with HTTP status `401`.

## Development Tests

Automated tests use `NODE_ENV=test` and test headers such as:

```text
x-user-id: test-user-001
x-user-email: test@example.com
```

This shortcut is intentionally enabled only in the test environment so CRUD tests can run without opening a browser or contacting Google.
