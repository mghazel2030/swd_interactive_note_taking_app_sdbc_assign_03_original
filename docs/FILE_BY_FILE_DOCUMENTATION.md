# File-by-File Step-by-Step Documentation

## `app.js`

Purpose: configure the Express application.

Sections:

1. Import dependencies: Express, path, Mongoose, dotenv, routes, and error middleware.
2. Load `.env`: makes environment variables available through `process.env`.
3. Create Express app: `const app = express()`.
4. Configure EJS: `app.set('view engine', 'ejs')` and views directory.
5. Configure middleware:
   - `express.json()` reads JSON request bodies.
   - `express.urlencoded({ extended: true })` reads HTML form submissions.
   - `methodOverride('_method')` supports method overrides if needed later.
   - `express.static(...)` serves CSS and browser JavaScript.
6. Connect MongoDB with `mongoose.connect(process.env.MONGO_CONNECTION)` except in tests.
7. Register routes.
8. Register 404 handler.
9. Register centralized error handler.
10. Export app for `server.js` and Supertest.

## `server.js`

Purpose: start the HTTP server.

Sections:

1. Import configured Express app.
2. Read port from `.env` or default to 5000.
3. Call `app.listen(...)`.

## `config/database.js`

Purpose: provide reusable database connect/disconnect helpers.

Sections:

1. Import Mongoose.
2. `connectDatabase()` validates the connection string and calls `mongoose.connect()`.
3. `disconnectDatabase()` closes the connection when needed.

Note: `app.js` includes the explicit `mongoose.connect(process.env.MONGO_CONNECTION)` line requested for lecture alignment. The helper is still useful for future refactoring or scripts.

## `models/Note.js`

Purpose: define the MongoDB document structure.

Sections:

1. Import Mongoose.
2. Define allowed enum arrays: note types, priorities, statuses.
3. Define schema fields:
   - `userId`: owner scope.
   - `owner`: owner email/name.
   - `title`: required note title.
   - `content`: required note content.
   - `type`, `priority`, `status`: controlled values.
   - `dueDate`: optional deadline.
   - `deletedAt`: soft-delete marker.
4. Enable timestamps so Mongoose manages `createdAt` and `updatedAt`.
5. Add instance method `isDeleted()`.
6. Add virtual field `excerpt`.
7. Export model and enum arrays.

## `controllers/noteController.js`

Purpose: implement note business logic.

Sections:

1. Import Note model and enum values.
2. `buildNotePayload()`: normalizes form/API data.
3. `renderNotesPage()`: reads notes and renders `views/notes/index.ejs`.
4. `getNotes()`: returns all active notes as JSON.
5. `getNoteById()`: returns one note by id.
6. `createNote()`: inserts a new note.
7. `updateNote()`: updates an existing note owned by the current user.
8. `deleteNote()`: soft-deletes a note.
9. Export controller functions.

## `controllers/homeController.js`

Purpose: implement small non-CRUD route actions.

Sections:

1. `redirectToNotes()`: sends `/` to `/notes`.
2. `healthCheck()`: returns status JSON.

## `routes/noteRoutes.js`

Purpose: map URLs to controller functions.

Sections:

1. Import Express router and middleware.
2. Apply `requireAuth` to all note routes.
3. Define EJS page routes:
   - `GET /notes`
   - `POST /notes`
   - `POST /notes/:id`
   - `POST /notes/:id/delete`
4. Define REST API routes:
   - `GET /api/notes`
   - `GET /api/notes/:id`
   - `POST /api/notes`
   - `PUT /api/notes/:id`
   - `DELETE /api/notes/:id`
5. Export router.

## `middleware/auth.js`

Purpose: attach an authenticated user to `req.user`.

Sections:

1. Import Google OAuth client.
2. `buildGoogleUser()`: converts Google token payload to app user format.
3. `requireAuth()`: supports:
   - test headers (`x-user-id`, `x-user-email`),
   - Google OAuth token,
   - development fallback user.

## `middleware/validateNote.js`

Purpose: reject invalid note input before controller logic.

Sections:

1. Import allowed values from the model.
2. Check title and content.
3. Check enum values.
4. Return 400 if invalid.
5. Call `next()` if valid.

## `middleware/errorHandler.js`

Purpose: centralize error responses.

Sections:

1. Determine status code and message.
2. Return JSON for `/api/...` errors.
3. Render EJS error page for browser page errors.

## `utils/asyncHandler.js`

Purpose: remove repetitive `try/catch` blocks from async controllers.

Section:

1. Wrap controller and forward rejected promises to `next()`.

## EJS Views

### `views/notes/index.ejs`

Purpose: assemble the page using partials.

Includes:

1. Header partial.
2. Create-note form partial.
3. Notes table partial.
4. Footer partial.

### `views/partials/header.ejs`

Purpose: reusable HTML head, opening body, app header, signed-in user label.

### `views/partials/footer.ejs`

Purpose: reusable footer, Go-to-Top button, and public JavaScript import.

### `views/partials/noteForm.ejs`

Purpose: server-rendered create form.

### `views/partials/noteTable.ejs`

Purpose: server-rendered notes table with edit and delete controls.

## `public/css/styles.css`

Purpose: visual styling.

Sections:

1. Global reset.
2. Header/footer.
3. Main page shell.
4. Panels.
5. Form fields.
6. Buttons.
7. Notes table.
8. Responsive layout.

## `public/js/app.js`

Purpose: small browser-side behavior.

Section:

1. Add click listener to the Go-to-Top button.

## `test/note.api.test.js`

Purpose: development-only CRUD test suite.

Sections:

1. Import Chai, Supertest, Mongoose, MongoMemoryServer, app, and model.
2. Define auth headers and sample note.
3. `before`: start in-memory MongoDB.
4. `afterEach`: clean database.
5. `after`: disconnect and stop memory server.
6. Test health check, create, read, update, delete, validation, and user isolation.

## Google Session Login Update

### `controllers/authController.js`

1. Imports authentication helpers from `middleware/auth.js`.
2. Defines `getSafeRedirectPath()` to prevent open redirects after login.
3. Defines `renderLoginPage()` to render the EJS Google login page and redirect already-authenticated users.
4. Defines `handleGoogleLogin()` to receive the Google credential, verify it on the server, save the normalized user into the Express session, and redirect to the protected page.
5. Defines `logout()` to destroy the Express session and clear the session cookie.

### `routes/authRoutes.js`

1. Maps `GET /login` to the login page.
2. Maps `POST /auth/google` to Google credential verification and session creation.
3. Maps `POST /logout` to session destruction.

### `middleware/auth.js`

1. Verifies Google ID tokens with `google-auth-library`.
2. Stores only a compact user object in the server-side session.
3. Lets automated tests use `x-user-id` headers only when `NODE_ENV=test`.
4. Reuses `req.session.user` on later requests so users only sign in once per session.
5. Redirects HTML users to `/login` and returns JSON `401` responses for unauthenticated API clients.

### `views/auth/login.ejs`

1. Loads the Google Identity Services script.
2. Renders the Google Sign-In button using `GOOGLE_CLIENT_ID`.
3. Receives the browser-side Google credential.
4. Submits the credential to `POST /auth/google`.

### `views/partials/header.ejs`

1. Displays the signed-in Google user.
2. Shows the profile photo when available.
3. Provides a Logout button.

### `app.js`

1. Adds `express-session` before routes.
2. Configures the session cookie name, secret, max age, `httpOnly`, `sameSite`, and production-only `secure` flag.
3. Registers the new authentication routes before protected note routes.
