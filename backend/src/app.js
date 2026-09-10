const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const accountsRoutes = require('./routes/accounts.routes');
const journalEntriesRoutes = require('./routes/journalEntries.routes');

const healthCheck = require('./controllers/health.controller');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(hpp());

app.use(morgan('dev'));

app.use(express.json());

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
});


app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Journal Entry API is running. Try /api/health for a health check.'
    });
});

app.get('/api/health', rateLimiter, healthCheck);
app.use('/api/accounts', rateLimiter, accountsRoutes);
app.use('/api/journal-entries', rateLimiter, journalEntriesRoutes);

app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;