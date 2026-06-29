# MongoDB Atlas and CRUD Walkthrough

## 1. Create or Use Your MongoDB Atlas Account

1. Sign in to MongoDB Atlas.
2. Create a project, for example `note-taking-app`.
3. Create a free or paid cluster.
4. Create a database user with a strong password.
5. Add your IP address in **Network Access**.
6. Click **Connect** → **Drivers** → copy the Node.js connection string.

## 2. Add the Connection String to the Code

Create `.env` in the project root:

```env
PORT=5000
MONGO_CONNECTION=mongodb+srv://<username>:<password>@<cluster-url>/note_taking_app?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=<your-google-client-id>
```

In `app.js`, the application connects with:

```js
mongoose.connect(process.env.MONGO_CONNECTION);
```

In tests, this connection is skipped because `NODE_ENV=test` is set by the test script. Tests use `mongodb-memory-server` instead.

## 3. How Create Works

Route:

```text
POST /api/notes
POST /notes
```

Flow:

1. `routes/noteRoutes.js` receives the POST request.
2. `auth.js` attaches `req.user`.
3. `validateNote.js` verifies title, content, type, priority, and status.
4. `noteController.createNote()` builds the note payload.
5. `Note.create(...)` inserts the document into MongoDB.

Core code:

```js
const note = await Note.create(buildNotePayload(req.body, req.user));
```

## 4. How Read Works

Route:

```text
GET /api/notes
GET /notes
```

Flow:

1. The authenticated `userId` is taken from `req.user.id`.
2. The controller searches only active notes where `deletedAt: null`.
3. Notes are sorted newest-first.

Core code:

```js
const notes = await Note.find({
  userId: req.user.id,
  deletedAt: null
}).sort({ createdAt: -1 });
```

## 5. How Update Works

Route:

```text
PUT /api/notes/:id
POST /notes/:id
```

Flow:

1. The note id comes from `req.params.id`.
2. The user id comes from `req.user.id`.
3. The query uses both fields so one user cannot update another user’s note.
4. `runValidators: true` forces Mongoose schema validation on update.

Core code:

```js
const note = await Note.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.id, deletedAt: null },
  updatePayload,
  { new: true, runValidators: true }
);
```

## 6. How Delete Works

This implementation uses **soft delete**. The document is not physically removed; `deletedAt` is set to the current date.

Route:

```text
DELETE /api/notes/:id
POST /notes/:id/delete
```

Core code:

```js
const note = await Note.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.id, deletedAt: null },
  { deletedAt: new Date() },
  { new: true }
);
```

Advantages of soft delete:

- Accidental deletes can be recovered.
- Audit history is easier.
- Normal read queries can hide deleted notes using `deletedAt: null`.

## 7. Database Best Practices

- Never commit `.env` to GitHub.
- Use one MongoDB user per application/environment.
- Use strong generated passwords.
- Restrict Atlas IP access.
- Use separate databases for development, testing, and production.
- Validate data at both middleware level and schema level.
- Always scope user data by `userId`.
- Use indexes for common query fields such as `userId` and `deletedAt`.
- Use `runValidators: true` on updates.
- Prefer soft delete for user-facing data unless permanent deletion is legally or functionally required.
