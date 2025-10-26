const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();
require('dotenv').config();

// Init Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return /json|text|javascript|css|svg/.test(res.getHeader('Content-Type'));
    }
}));
// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
// Init DB
require("./dbs/init.mongodb");
// Init routes
app.use('/', require('./routes'));

// Handle Error
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error',
    });
})

module.exports = app;