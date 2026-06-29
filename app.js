/**
 * @file app.js
 * @description Express application configuration for the Note Taking App.
 */

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs'); // ejs made available
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); // json made available from req.body
app.use(express.urlencoded({ extended: true })); // form-data made available from req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: process.env.SESSION_NAME || 'note_app_sid',
    secret: process.env.SESSION_SECRET || 'development-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: Number(process.env.SESSION_MAX_AGE_MS) || 1000 * 60 * 60 * 24
    }
}));

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_CONNECTION); // connect to mongodb
}

app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/', noteRoutes);

app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found.' });
    }

    return res.status(404).render('errors/error', {
        title: 'Page Not Found',
        statusCode: 404,
        message: 'The requested page was not found.',
        user: req.session ? req.session.user : null
    });
});

app.use(errorHandler);

module.exports = app;
