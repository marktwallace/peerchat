// src/app.js
import express from 'express';
import morgan from 'morgan'; // For logging
import cors from 'cors'; // For Cross-Origin Resource Sharing
import helmet from 'helmet'; // For security headers
import routes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/errorHandlers';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Default logging template for requests
app.use(cors()); // Enable CORS with default options
app.use(helmet()); // Some default API security

// Routes
app.use('/api', routes);

// Handle 404 (Not Found)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
