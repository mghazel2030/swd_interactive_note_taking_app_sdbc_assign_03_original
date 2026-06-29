# Block Diagram — Work and Data Flow

```text
┌──────────────────────────────┐
│ Browser / User               │
│ - Opens /notes               │
│ - Submits create/edit/delete │
└───────────────┬──────────────┘
                │ HTTP request
                ▼
┌──────────────────────────────┐
│ app.js                       │
│ - Express setup              │
│ - EJS setup                  │
│ - JSON/form middleware       │
│ - Static public files        │
│ - MongoDB connection         │
└───────────────┬──────────────┘
                │ route matching
                ▼
┌──────────────────────────────┐
│ routes/noteRoutes.js         │
│ - Page routes                │
│ - REST API routes            │
│ - Auth + validation pipeline │
└───────────────┬──────────────┘
                │ validated request
                ▼
┌──────────────────────────────┐
│ middleware                   │
│ - auth.js attaches req.user  │
│ - validateNote.js checks     │
│   note payloads              │
└───────────────┬──────────────┘
                │ clean request
                ▼
┌──────────────────────────────┐
│ controllers/noteController.js│
│ - Render notes page          │
│ - Create note                │
│ - Read notes                 │
│ - Update note                │
│ - Soft-delete note           │
└───────────────┬──────────────┘
                │ Mongoose query
                ▼
┌──────────────────────────────┐
│ models/Note.js               │
│ - Schema                     │
│ - Validation rules           │
│ - Timestamps                 │
│ - Soft-delete field          │
└───────────────┬──────────────┘
                │ MongoDB protocol
                ▼
┌──────────────────────────────┐
│ MongoDB Atlas / Test MongoDB │
│ - Stores notes collection    │
│ - Tests use in-memory DB     │
└───────────────┬──────────────┘
                │ response data
                ▼
┌──────────────────────────────┐
│ EJS Views or JSON API        │
│ - views/notes/index.ejs      │
│ - views/partials/*.ejs       │
│ - /api/notes JSON responses  │
└──────────────────────────────┘
```

## MVC Mapping

- **Model**: `models/Note.js`
- **View**: `views/**/*.ejs`, `public/css/styles.css`, `public/js/app.js`
- **Controller**: `controllers/noteController.js`, `controllers/homeController.js`
- **Routes**: `routes/*.js`
- **Middleware**: authentication, validation, errors
