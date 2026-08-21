# Note Taking & Management App — Midterm Project:

This is my implementation of the Note Taking & Management App, using:

    - A modular MVC-style Express application using EJS views
    - Partials
    - Mongoose models
    - Controllers
    - Routes
    - Middleware
    - Public assets, and 
    - Development-only automated tests.

## 1. Folder Structure

```text
note-taking-app-refactored/
├── app.js                         # Express app configuration
├── server.js                      # HTTP server bootstrap
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variable template
├── config/
│   └── database.js                # MongoDB connection helper
├── controllers/
│   ├── authController.js          # Google login/session/logout logic
│   ├── homeController.js          # Home and health-check logic
│   └── noteController.js          # Notes CRUD + EJS rendering logic
├── middleware/
│   ├── auth.js                    # Google token + session authentication middleware
│   ├── errorHandler.js            # Central error middleware
│   └── validateNote.js            # Create/update request validation
├── models/
│   └── Note.js                    # Mongoose note schema/model
├── routes/
│   ├── authRoutes.js              # Login, Google callback, logout routes
│   ├── homeRoutes.js              # Root and health routes
│   └── noteRoutes.js              # EJS page routes + REST API routes
├── utils/
│   └── asyncHandler.js            # Async controller wrapper
├── views/
│   ├── auth/login.ejs             # Google Sign-In page
│   ├── notes/index.ejs            # Main notes page
│   ├── errors/error.ejs           # Error page
│   └── partials/                  # Reusable EJS components
├── public/
│   ├── css/styles.css             # Browser stylesheet
│   └── js/app.js                  # Browser-side UI helper
├── test/
│   └── note.api.test.js           # Mocha/Chai/Supertest CRUD tests
└── 
```

## 2. Install and Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:5000/notes
```

## 3. Required `.env` Values

```env
PORT=5000
MONGO_CONNECTION=mongodb+srv://<username>:<password>@<cluster-url>/note_taking_app?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
SESSION_SECRET=replace-this-with-a-long-random-secret
SESSION_NAME=note_app_sid
SESSION_MAX_AGE_MS=86400000
```

## 4. Main Implementation Requirements Covered

- Express server
- MongoDB database access through Mongoose
- EJS instead of static HTML
- EJS partials for header, footer, note form, and note table
- Google login page and Express session redirect flow
- Login required once per session until session expiration or logout
- Modular folder structure: config, controllers, models, routes, views, public, middleware, utils, test, docs
- Mocha, Chai, Supertest tests in `test/note.api.test.js`
- Tests use `mongodb-memory-server`, so tests do not touch production MongoDB Atlas

## 5. Important `app.js` Lines

The requested middleware/configuration lines are included in `app.js`:

```js
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_CONNECTION);
```

The MongoDB connection is skipped only when `NODE_ENV=test`, because automated tests use an in-memory MongoDB server.

## 6. Run Tests

```bash
npm test
```

The test dependencies are in `devDependencies`; they are for development only and are not required to run the production app.


## 7. Google Login Behavior

Open `/notes`. If no valid session exists, the app redirects to `/login?next=/notes`. After Google Sign-In succeeds, the server verifies the ID token, stores the authenticated user in the Express session, and redirects back to `/notes`.

You only sign in once per session. The session lasts for `SESSION_MAX_AGE_MS` milliseconds or until you click Logout.

See `docs/AUTHENTICATION_GUIDE.md` for the detailed flow.

## UI Update Notes

The latest UI update includes:

- Wider application canvas for better use of desktop page width.
- Cleaner authenticated-user header using an initials avatar instead of a potentially broken Google profile image.
- Updated title/subtitle wording.
- Updated footer wording.
- Side-by-side Edit and Delete controls.
- Blue Edit button and red Delete button.

## Test Location and Command

Tests are implemented in:

```text
test/note.api.test.js
```

Run them with:

```bash
npm test
```

The tests use Mocha, Chai, Supertest, and mongodb-memory-server. These packages are development-only dependencies.
