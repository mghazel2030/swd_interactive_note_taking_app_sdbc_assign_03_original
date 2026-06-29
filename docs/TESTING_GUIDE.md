# Testing Guide — Mocha, Chai, Supertest

## 1. Where the Tests Are Implemented

The development-only test module is implemented here:

```text
test/note.api.test.js
```

The test-related npm commands are defined in:

```text
package.json
```

Relevant scripts:

```json
"scripts": {
  "test": "cross-env NODE_ENV=test mocha \"test/**/*.test.js\" --exit",
  "test:watch": "cross-env NODE_ENV=test mocha \"test/**/*.test.js\" --watch"
}
```

## 2. Testing Stack

The test module uses:

- **Mocha**: test runner.
- **Chai**: assertion library.
- **Supertest**: sends HTTP requests to the Express app without manually starting the server.
- **mongodb-memory-server**: creates a temporary MongoDB database for tests.
- **cross-env**: sets `NODE_ENV=test` consistently on Windows, macOS, and Linux.

The original request mentioned “chat”; the correct package name is **Chai**.

## 3. Why Tests Are Development Only

The testing libraries are listed under `devDependencies` in `package.json`:

```json
"devDependencies": {
  "chai": "...",
  "mocha": "...",
  "mongodb-memory-server": "...",
  "supertest": "..."
}
```

This means they are not required for production runtime. For production-only installation, use:

```bash
npm install --omit=dev
```

For development and testing, use:

```bash
npm install
```

## 4. How to Run the Tests

From the project root folder:

```bash
npm test
```

Expected output should look similar to:

```text
Note API CRUD
  ✓ GET /health should return app health status
  ✓ GET /notes should redirect unauthenticated page users to /login
  ✓ GET /api/notes should return 401 for unauthenticated API clients
  ✓ POST /api/notes should create a note
  ✓ GET /api/notes should list active notes for the authenticated user
  ✓ GET /api/notes/:id should return one note by id
  ✓ PUT /api/notes/:id should update an existing note
  ✓ DELETE /api/notes/:id should soft-delete a note
  ✓ POST /api/notes should reject invalid input
  ✓ should prevent users from reading another user's note
```

## 5. How to Run Tests Continuously While Editing Code

```bash
npm run test:watch
```

Mocha will re-run the tests whenever test files change.

## 6. What Is Tested

`test/note.api.test.js` covers:

1. Health check endpoint.
2. Unauthenticated page redirect behavior.
3. Unauthenticated API rejection.
4. Create note.
5. Read/list notes.
6. Read one note by id.
7. Update note.
8. Soft-delete note.
9. Input validation failure.
10. User isolation: one user cannot read another user's note.

## 7. How a CRUD Test Works

Example create test:

```js
const response = await request(app)
    .post('/api/notes')
    .set(authHeaders)
    .send(sampleNote)
    .expect(201);

expect(response.body.title).to.equal(sampleNote.title);
```

Explanation:

1. `request(app)` loads the Express app directly.
2. `.post('/api/notes')` simulates an HTTP POST request.
3. `.set(authHeaders)` simulates an authenticated test user.
4. `.send(sampleNote)` sends JSON data.
5. `.expect(201)` verifies the HTTP response status.
6. `expect(...)` verifies response body content.

## 8. Important Note About mongodb-memory-server

The first test run may take longer because `mongodb-memory-server` may download MongoDB binaries. This happens only for the development test environment. It does not use your MongoDB Atlas database.

If your network blocks the binary download, the app can still run normally, but the automated tests will not complete until the MongoDB test binary is available.

## 9. Unit vs Integration Tests

This test file is mostly an **integration test** because it tests route + middleware + controller + model + database together.

A pure **unit test** would test one function in isolation, such as a validation helper. For this CRUD app, integration tests are more useful because they verify that Express routes, authentication middleware, controllers, Mongoose models, and database behavior all work together.
