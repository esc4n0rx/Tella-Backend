const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Middlewares
const { errorHandler } = require('./presentation/middlewares/error-middleware');

// Routes
const authRoutes = require('./presentation/routes/auth-routes');

const app = express();

// Configurações de segurança
app.use(helmet());

// CORS - configuração para React Native
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:19006'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Tella Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl
    });
});

// Error Handler
app.use(errorHandler);

module.exports = app;