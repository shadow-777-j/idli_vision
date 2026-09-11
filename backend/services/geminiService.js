/**
 * geminiService.js
 * Backend-only integration with Gemini API for the "Idli Coach".
 * Adheres to Section 8.3 & Section 10 (Security):
 * - Never called directly from client
 * - Interprets structured measurement data, never fabricates measurements
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Checks if Gemini service is configured with an API key.
 * @returns {boolean}
 */
function isConfigured() {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');
}

/**
 * Generates coaching commentary based on structured score data.
 * Adheres to the required structure:
 * Playful commentary -> Genuine technical explanation -> Practical actionable advice
 * @param {Object} scoringData 
 * @returns {Promise<Object>} Coaching response
 */
async function generateCoachFeedback(scoringData) {
  if (!isConfigured()) {
    // Graceful fallback when API key is not yet set
    return {
      roast: "A solid attempt! But the kitchen gods demand slightly crisper edges.",
      explanation: `Your idli scored ${scoringData.overallScore}/100. Key areas identified: ${scoringData.detectedIssues.join(', ') || 'overall balance is good'}.`,
      actionableAdvice: [
        "Ensure urad dal to rice ratio is precisely 1:4 by volume.",
        "Ferment for a minimum of 8 hours at 28-32°C for optimal leavening pores.",
        "Grease the idli mold lightly with gingelly oil to prevent edge distortion."
      ],
      currentScore: scoringData.overallScore,
      targetScore: Math.min(100, scoringData.overallScore + 15),
      mode: 'fallback'
    };
  }

  // To be fully implemented in Phase 9/10 with @google/genai SDK
  throw new Error('Gemini live integration is scheduled for Phase 9/10.');
}

module.exports = {
  isConfigured,
  generateCoachFeedback
};
