/**
 * chat.js
 * Express router for Freeform Idli Chatbot (powered by Grok API).
 */

const express = require('express');
const router = express.Router();
const { callGrokChat, isConfigured } = require('../services/grokService');

/**
 * GET /api/chat/status
 * Check if Grok is configured with a valid API key.
 */
router.get('/status', (req, res) => {
  res.json({
    grokConfigured: isConfigured(),
    service: 'Grok API (xAI)',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/chat
 * Freeform chat endpoint with Coach Subramanian.
 * Body: { message: string, history?: Array, scoringData?: Object }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history, scoringData } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message to ask Coach Subramanian.'
      });
    }

    const result = await callGrokChat({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      scoringData: scoringData || null
    });

    if (!result.success) {
      // Return structured error information gracefully without crashing
      const httpStatus = result.code === 'KEY_MISSING' || result.code === 'INVALID_KEY' ? 503 : 502;
      return res.status(httpStatus).json({
        success: false,
        code: result.code,
        error: result.error
      });
    }

    res.json({
      success: true,
      reply: result.reply,
      model: result.model
    });
  } catch (err) {
    console.error('Chat endpoint unhandled error:', err.message);
    res.status(500).json({
      success: false,
      error: 'An unexpected internal error occurred while consulting Coach Subramanian.'
    });
  }
});

module.exports = router;
