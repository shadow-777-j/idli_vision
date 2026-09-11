/**
 * coach.js
 * Express routes for interacting with The Idli Coach (Phases 9 & 10).
 */

const express = require('express');
const router = express.Router();
const { getCoachResponse, isConfigured } = require('../services/geminiService');

/**
 * GET /api/coach/status
 * Check if Gemini is configured with a real API key.
 */
router.get('/status', (req, res) => {
  res.json({
    geminiLive: isConfigured(),
    mode: isConfigured() ? 'gemini-live' : 'deterministic-expert'
  });
});

/**
 * POST /api/coach/ask
 * Ask the coach a question about the analysis results.
 */
router.post('/ask', async (req, res) => {
  try {
    const { scoringData, question } = req.body;
    if (!scoringData) {
      return res.status(400).json({ error: 'scoringData is required to provide coaching.' });
    }

    const feedback = await getCoachResponse(scoringData, question || null);
    res.json({
      success: true,
      coach: feedback
    });
  } catch (err) {
    console.error('Coach error:', err.message);
    res.status(500).json({ error: 'The Idli Coach encountered an error processing your request.' });
  }
});

/**
 * POST /api/coach/improve
 * "Make My Idli Better" action requesting ranked top-3 fixes tied to weaknesses.
 */
router.post('/improve', async (req, res) => {
  try {
    const { scoringData } = req.body;
    if (!scoringData) {
      return res.status(400).json({ error: 'scoringData is required.' });
    }

    const feedback = await getCoachResponse(scoringData, 'What are my top three prioritized recipe and technique improvements?');
    res.json({
      success: true,
      plan: feedback
    });
  } catch (err) {
    console.error('Improve error:', err.message);
    res.status(500).json({ error: 'Could not generate improvement plan.' });
  }
});

module.exports = router;
