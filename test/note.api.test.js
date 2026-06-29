/**
 * @file test/note.api.test.js
 * 
 * @description Development-only Mocha, Chai, Supertest tests for note CRUD endpoints.
 *              This suite validates the behavior of both authenticated and unauthenticated
 *              clients, ensuring correct CRUD functionality, validation, authorization,
 *              and soft-delete behavior.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

const { expect } = require('chai');                 // Chai assertion library for readable test expectations.
const request = require('supertest');               // Supertest allows HTTP requests against the Express app.
const mongoose = require('mongoose');               // Mongoose ODM for MongoDB.
const { MongoMemoryServer } = require('mongodb-memory-server'); // In-memory MongoDB for isolated test environments.
const app = require('../app');                      // The Express application under test.
const { Note } = require('../models/Note');         // Mongoose Note model used for DB assertions.

let mongoServer;                                    // Will hold the in-memory MongoDB instance.

// Mock authentication headers simulating a logged-in user.
const authHeaders = {
    'x-user-id': 'test-user-001',
    'x-user-email': 'test@example.com'
};

// Sample note payload used for create/update tests.
const sampleNote = {
    title: 'Mocha CRUD Test Note',
    content: 'This note is created during automated testing.',
    owner: 'test@example.com',
    type: 'School',
    priority: 'High',
    status: 'In-progress',
    dueDate: '2026-06-15T10:30'
};

describe('Note API CRUD', function noteApiSuite() {
    this.timeout(20000);                             // Extend timeout for slower CI environments.

    // Before all tests: start in-memory MongoDB and connect Mongoose.
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    // After each test: clear all notes to ensure isolation.
    afterEach(async () => {
        await Note.deleteMany({});
    });

    // After all tests: disconnect and stop in-memory DB.
    after(async () => {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    // -------------------------------
    // Individual Test Cases
    // -------------------------------

    it('GET /health should return app health status', async () => {
        const response = await request(app).get('/health').expect(200);
        expect(response.body.status).to.equal('OK');
    });

    it('GET /notes should redirect unauthenticated page users to /login', async () => {
        const response = await request(app).get('/notes').expect(302);
        expect(response.headers.location).to.include('/login?next=%2Fnotes');
    });

    it('GET /api/notes should return 401 for unauthenticated API clients', async () => {
        const response = await request(app).get('/api/notes').expect(401);
        expect(response.body.message).to.equal('Authentication required.');
    });

    it('POST /api/notes should create a note', async () => {
        const response = await request(app)
            .post('/api/notes')
            .set(authHeaders)
            .send(sampleNote)
            .expect(201);

        expect(response.body.title).to.equal(sampleNote.title);
        expect(response.body.userId).to.equal(authHeaders['x-user-id']);
        expect(response.body.deletedAt).to.equal(null);
    });

    it('GET /api/notes should list active notes for the authenticated user', async () => {
        await request(app).post('/api/notes').set(authHeaders).send(sampleNote).expect(201);

        const response = await request(app).get('/api/notes').set(authHeaders).expect(200);

        expect(response.body).to.have.lengthOf(1);
        expect(response.body[0].title).to.equal(sampleNote.title);
    });

    it('GET /api/notes/:id should return one note by id', async () => {
        const created = await request(app).post('/api/notes').set(authHeaders).send(sampleNote).expect(201);

        const response = await request(app)
            .get(`/api/notes/${created.body._id}`)
            .set(authHeaders)
            .expect(200);

        expect(response.body._id).to.equal(created.body._id);
    });

    it('PUT /api/notes/:id should update an existing note', async () => {
        const created = await request(app).post('/api/notes').set(authHeaders).send(sampleNote).expect(201);

        const response = await request(app)
            .put(`/api/notes/${created.body._id}`)
            .set(authHeaders)
            .send({ ...sampleNote, title: 'Updated Note Title', status: 'Completed' })
            .expect(200);

        expect(response.body.title).to.equal('Updated Note Title');
        expect(response.body.status).to.equal('Completed');
    });

    it('DELETE /api/notes/:id should soft-delete a note', async () => {
        const created = await request(app).post('/api/notes').set(authHeaders).send(sampleNote).expect(201);

        await request(app)
            .delete(`/api/notes/${created.body._id}`)
            .set(authHeaders)
            .expect(200);

        const listResponse = await request(app).get('/api/notes').set(authHeaders).expect(200);
        expect(listResponse.body).to.have.lengthOf(0);

        const rawNote = await Note.findById(created.body._id);
        expect(rawNote.deletedAt).to.be.instanceOf(Date);
    });

    it('POST /api/notes should reject invalid input', async () => {
        const response = await request(app)
            .post('/api/notes')
            .set(authHeaders)
            .send({ title: '', content: '' })
            .expect(400);

        expect(response.body.message).to.equal('Validation failed.');
        expect(response.body.errors).to.be.an('array').that.is.not.empty;
    });

    it('should prevent users from reading another user\'s note', async () => {
        const created = await request(app).post('/api/notes').set(authHeaders).send(sampleNote).expect(201);

        await request(app)
            .get(`/api/notes/${created.body._id}`)
            .set({ 'x-user-id': 'different-user', 'x-user-email': 'other@example.com' })
            .expect(404);
    });
});
