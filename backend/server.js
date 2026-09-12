/**
 * server.js
 * Main entry point for the Idli Vision Express backend.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const analyzeRouter = require('./routes/analyze');
const coachRouter = require('./routes/coach');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Serve ui_elements video assets
const uiElementsPath = path.join(__dirname, '../ui_elements');
app.use('/ui_elements', express.static(uiElementsPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Idli Vision API',
    phase: 'All Phases Active (2-11)',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/coach', coachRouter);
app.use('/api/chat', chatRouter);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found'
  });
});

// Fallback to index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler (Section 11: no raw stack traces to users)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'An unexpected internal server error occurred.'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` Idli Vision Server running on port ${PORT}`);
    console.log(` Frontend: http://localhost:${PORT}`);
    console.log(` Health:   http://localhost:${PORT}/api/health`);
    console.log(` Phase 1:  Foundation Ready`);
    console.log(`========================================`);
  });
}

module.exports = app;
