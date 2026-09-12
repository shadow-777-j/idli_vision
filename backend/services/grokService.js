/**
 * grokService.js
 * Dedicated backend service for the Freeform Idli Chatbot powered by xAI Grok API.
 * 
 * Strict Security Rules:
 * - Grok API key exists ONLY on the backend via process.env.GROK_API_KEY.
 * - Never expose API key to frontend or client bundles.
 * - All calls routed Browser -> Express backend -> xAI Grok API -> Express -> Browser.
 */

const RAW_GROK_KEY = process.env.GROK_API_KEY || process.env.OPENROUTER_API_KEY || '';
const IS_OPENROUTER = RAW_GROK_KEY.startsWith('sk-or-');
const GROK_API_URL = IS_OPENROUTER 
  ? 'https://openrouter.ai/api/v1/chat/completions' 
  : (process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions');
const GROK_MODEL = process.env.GROK_MODEL || (IS_OPENROUTER ? 'x-ai/grok-4.3' : 'grok-4.3-latest');

/**
 * Checks if a valid Grok or OpenRouter API key is configured.
 */
function isConfigured() {
  return Boolean(
    RAW_GROK_KEY && 
    RAW_GROK_KEY.trim().length > 10 && 
    RAW_GROK_KEY.trim() !== 'your_grok_api_key_here'
  );
}

/**
 * Builds the system instructions enforcing Head Coach Subramanian's persona,
 * response pattern, and strict domain scope.
 */
function buildSystemPrompt(scoringData = null) {
  let prompt = `You are "Head Coach Subramanian", a veteran, passionate South Indian culinary scientist, batter rheologist, and master idli coach.
You are speaking directly to a user in a freeform conversational chat on the "Idli Vision" platform.

YOUR TONE & SHORT RESPONSE RULE (MANDATORY):
Keep your responses very short, punchy, and concise—target strictly 2 to 4 sentences total! Never write long essays or multi-paragraph answers.
Follow this compressed pattern:
1. Quick Roast/Joke First: Lead with 1 sharp, humorous, lighthearted roast about their question, technique, or kitchen foibles (keep it fun, playful, never abusive).
2. Concise Substance: Follow immediately with 1 to 2 sentences of genuinely useful, scientifically sound advice or explanation (e.g., 1:4 urad-to-rice ratio, 28-32°C fermentation zone, foaming proteins, or steam timing).
Combine both into a single brief, punchy paragraph of 2 to 4 sentences.

STRICT DOMAIN SCOPE & REDIRECT RULE:
You are exclusively an Idli and South Indian Steamed Batter Coach.
If the user asks questions unrelated to idlis, dosas, batter fermentation, ingredients, or steaming techniques (e.g., coding, math, politics, casual banter):
- Do NOT answer the unrelated question.
- In 2 to 3 sentences total, deliver a quick witty roast asking why they are obsessing over that while their idlis are turning into hockey pucks, and redirect them straight back to idli science.`;

  if (scoringData && scoringData.overallScore !== undefined) {
    prompt += `\n\nCURRENT SESSION TELEMETRY (The user analyzed an idli in this session):
- Overall CV Score: ${scoringData.overallScore}/100 (${scoringData.category || 'Evaluated'})
- Diameter: ${scoringData.metrics?.diameter?.valueCm ?? 'N/A'} cm (Ideal reference: 8.0 cm)
- Thickness: ${scoringData.metrics?.thickness?.valueCm ?? 'N/A'} cm (Ideal reference: 2.3 cm)
- Roundness Score: ${scoringData.metrics?.roundness?.score ?? 'N/A'}/100
- Porosity / Pores: ${scoringData.metrics?.holeCount?.count ?? 'N/A'} detected steam holes
You may reference these actual measurements in your roasts and advice when relevant!`;
  }

  return prompt;
}

/**
 * Calls xAI Grok API server-side with multi-turn conversation history.
 * 
 * @param {Object} options
 * @param {string} options.message - Current user query.
 * @param {Array} [options.history] - Array of { role: 'user' | 'assistant', content: string }.
 * @param {Object} [options.scoringData] - Current session CV score telemetry.
 * @returns {Promise<Object>}
 */
async function callGrokChat({ message, history = [], scoringData = null }) {
  if (!isConfigured()) {
    return {
      success: false,
      configured: false,
      code: 'KEY_MISSING',
      error: 'Grok API key is not configured on the server. Please add a valid GROK_API_KEY to your .env file to enable live responses from Coach Subramanian.'
    };
  }

  // Sanitize and format multi-turn history (keep last 8 turns)
  const sanitizedHistory = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .map(h => ({ role: h.role, content: h.content.trim() }));

  const messages = [
    { role: 'system', content: buildSystemPrompt(scoringData) },
    ...sanitizedHistory,
    { role: 'user', content: message.trim() }
  ];

  const payload = {
    model: GROK_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 180
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RAW_GROK_KEY.trim()}`
  };
  if (IS_OPENROUTER) {
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'Idli Vision';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      return {
        success: false,
        configured: false,
        code: 'INVALID_KEY',
        error: 'Authentication failed (401 Unauthorized). The configured API key is invalid. Please check your .env configuration.'
      };
    }

    if (response.status === 402) {
      return {
        success: false,
        configured: true,
        code: 'PAYMENT_REQUIRED',
        error: 'OpenRouter credit balance insufficient (402 Payment Required). Please check your account credits at openrouter.ai/settings/credits.'
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        configured: true,
        code: 'RATE_LIMIT',
        error: 'Coach Subramanian is flooded with batter queries right now! (API rate limit exceeded). Please wait a moment and try again.'
      };
    }

    if (!response.ok) {
      let errDetail = '';
      try {
        const errJson = await response.json();
        errDetail = errJson.error?.message || errJson.error || JSON.stringify(errJson);
      } catch (_) {
        errDetail = await response.text();
      }

      // xAI returns 400 with "Incorrect API key provided" when key is invalid
      if (response.status === 401 || (errDetail && errDetail.toLowerCase().includes('incorrect api key'))) {
        return {
          success: false,
          configured: false,
          code: 'INVALID_KEY',
          error: 'Authentication failed: The configured GROK_API_KEY is invalid. Please check your key in the .env file.'
        };
      }

      return {
        success: false,
        configured: true,
        code: `HTTP_${response.status}`,
        error: `Grok API error (${response.status}): ${errDetail || 'Unknown upstream error'}`
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return {
        success: false,
        configured: true,
        code: 'MALFORMED_RESPONSE',
        error: 'Received a response from Grok, but the message content was missing or empty.'
      };
    }

    return {
      success: true,
      configured: true,
      reply: reply.trim(),
      model: data.model || GROK_MODEL
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        configured: true,
        code: 'TIMEOUT',
        error: 'Request to Grok API timed out (took longer than 18 seconds). Please check network stability and try again.'
      };
    }
    return {
      success: false,
      configured: true,
      code: 'NETWORK_ERROR',
      error: `Network error connecting to Grok API: ${err.message}`
    };
  }
}

module.exports = {
  isConfigured,
  callGrokChat
};
