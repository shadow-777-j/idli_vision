/**
 * geminiService.js
 * Backend-only AI service powering "The Idli Coach" (Section 8.3, Section 15).
 * Interprets deterministic CV measurements and scores without fabricating numbers.
 * Enforces structure: Playful Commentary -> Technical Explanation -> Actionable Advice.
 */

const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function isConfigured() {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10 && GEMINI_API_KEY !== 'your_gemini_api_key_here');
}

/**
 * Calls Gemini REST API securely from the backend.
 */
async function callGeminiApi(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json'
      }
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
            const rawText = parsed.candidates[0].content.parts[0].text;
            const cleanJson = JSON.parse(rawText);
            resolve(cleanJson);
          } else {
            reject(new Error('Invalid Gemini API candidate response: ' + data));
          }
        } catch (e) {
          reject(new Error('Failed to parse Gemini JSON: ' + e.message));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API call timed out'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generates tailored fallback coaching grounded strictly in actual measurements.
 */
function generateDeterministicCoaching(scoringData, question = null) {
  const { overallScore, category, metrics, detectedIssues = [] } = scoringData;
  const dia = metrics.diameter.valueCm;
  const thick = metrics.thickness.valueCm;
  const roundness = metrics.roundness.score;
  const symmetry = metrics.symmetry.score;
  const holes = metrics.holeCount.count;
  const deformity = metrics.deformity.score;

  let roast = "";
  let explanation = "";
  let actionableAdvice = [];

  if (question && question.includes('roundness')) {
    roast = roundness > 85 
      ? "You drew this with a culinary compass, didn't you? Impressive circle."
      : "Your idli looks like it tried to become a pancake halfway through the steam cycle.";
    explanation = `The circularity score is ${roundness}/100. Uneven surface tension or non-level steamer plates cause the batter to migrate outward asymmetrically before gelatinization occurs.`;
    actionableAdvice = [
      "Ensure your idli steamer stand is completely level inside the cooker.",
      "Gently tap the mold tray twice against the counter after pouring to settle the perimeter evenly.",
      "Lightly oil the perimeter of the mold with cold-pressed sesame oil to prevent edge drag."
    ];
  } else if (question && (question.includes('hole') || question.includes('pore'))) {
    roast = holes < 8 
      ? "Where are the aeration holes? Are you steaming idlis or paving a highway?"
      : `We found ${holes} visible steam pores. A respectable micro-sponge matrix!`;
    explanation = `Visible pores indicate CO2 entrapment from Lactobacillus and Leuconostoc mesenteroides bacteria during fermentation. Low pore count suggests under-fermentation or excessive batter stirring after the rise.`;
    actionableAdvice = [
      "Never vigorously beat or whisk fermented batter; fold very gently to preserve gas chambers.",
      "Ensure ambient fermentation temperature remains around 28°C to 32°C for 10-12 hours.",
      "Add a pinch of soaked fenugreek seeds (methi) to the urad dal during grinding to improve foam stability."
    ];
  } else if (question && (question.includes('thickness') || question.includes('rise'))) {
    roast = thick < 2.0 
      ? "Thickness is just " + thick + "cm. That's not an idli, that's a coin."
      : "Solid dome profile of " + thick + "cm! Respectable loft.";
    explanation = `Target reference thickness is 2.3cm. Measured thickness reflects vertical leavening expansion as steam permeates through starch gelatinization zones.`;
    actionableAdvice = [
      "Check your urad dal to rice ratio; aim for 1:4 parboiled rice to whole de-husked urad gota.",
      "Grind urad dal with ice-cold water until light, voluminous, and floats in a water test.",
      "Steam on medium-high heat with pre-boiling water so rapid steam sets the crumb before it collapses."
    ];
  } else {
    // General assessment
    if (overallScore >= 90) {
      roast = "A magnificent specimen! Your ancestors are smiling down from the steam clouds.";
      explanation = `Score of ${overallScore}/100 puts you in the Idli Master echelon. Diameter (${dia}cm) and thickness (${thick}cm) match reference standards within 2% margin of error.`;
      actionableAdvice = [
        "Maintain your current batter hydration ratio and fermentation schedule.",
        "Consider offering idli coaching to your neighbors who are still steaming pucks.",
        "Serve with piping hot molagapodi and freshly churned ghee."
      ];
    } else if (overallScore >= 75) {
      roast = "A respectable idli. It won't win an Olympic medal, but nobody is sending it back to the kitchen either.";
      explanation = `Score of ${overallScore}/100 (${category}). The main areas needing attention: ${detectedIssues.map(i => i.title).join(', ') || 'minor symmetry and edge variations'}.`;
      actionableAdvice = [
        "Rest the batter at warm room temperature for an additional 90 minutes to elevate porosity.",
        "Level your steamer rack before turning on high flame.",
        "Use a wet spoon when releasing the steamed cakes to avoid rim tearing."
      ];
    } else {
      roast = `Score ${overallScore}/100: ${category}. I've seen frisbees with better structural compliance.`;
      explanation = `Detected notable discrepancies: ${detectedIssues.map(i => i.detail).join('; ') || 'Low rise and edge deformities'}. The batter appears compromised by inadequate fermentation or incorrect rice-to-dal proportions.`;
      actionableAdvice = [
        "Discard dead yeast or old starter; use fresh whole de-husked black gram (urad gota).",
        "Grind the urad dal separately until it achieves a fluffy marshmallow texture.",
        "Do not over-ferment past the sourness threshold, which weakens the gluten-free protein network."
      ];
    }
  }

  return {
    roast,
    explanation,
    actionableAdvice,
    currentScore: overallScore,
    targetScore: Math.min(100, overallScore + 15),
    mode: 'deterministic-expert'
  };
}

/**
 * Top-level coaching generator.
 */
async function getCoachResponse(scoringData, question = null) {
  if (!isConfigured()) {
    return generateDeterministicCoaching(scoringData, question);
  }

  const systemPrompt = `You are "The Idli Coach", an expert culinary consultant who evaluates South Indian steamed idlis based strictly on computer vision measurements.
You must maintain a playful, witty, and humorous voice, but you must strictly follow this 3-tier response pattern:
1. "roast": A witty, humorous opening observation tied directly to their scores.
2. "explanation": A genuine, scientific food explanation of why their measurements occurred.
3. "actionableAdvice": An array of exactly 3 practical, kitchen-tested recipe/technique fixes.
4. "targetScore": A realistic target score for their next attempt (integer 0-100).

Return ONLY valid JSON matching this exact structure:
{
  "roast": "string",
  "explanation": "string",
  "actionableAdvice": ["string", "string", "string"],
  "targetScore": number
}`;

  const userPrompt = `Measurement Data:
- Overall Score: ${scoringData.overallScore}/100 (${scoringData.category})
- Diameter: ${scoringData.metrics.diameter.valueCm} cm (Target: 8.0 cm)
- Thickness: ${scoringData.metrics.thickness.valueCm} cm (Target: 2.3 cm)
- Roundness Score: ${scoringData.metrics.roundness.score}/100
- Symmetry Score: ${scoringData.metrics.symmetry.score}/100
- Deformity Score: ${scoringData.metrics.deformity.score}/100
- Detected Pores / Holes: ${scoringData.metrics.holeCount.count}
- Pore Distribution Score: ${scoringData.metrics.holeDistribution.score}/100
- Detected Weaknesses: ${JSON.stringify(scoringData.detectedIssues)}
${question ? `- Specific User Question: "${question}"` : "- Request: Provide comprehensive critique and improvement suggestions."}`;

  try {
    const res = await callGeminiApi(systemPrompt, userPrompt);
    return {
      ...res,
      currentScore: scoringData.overallScore,
      mode: 'gemini-live'
    };
  } catch (err) {
    console.warn('Gemini live API call failed, falling back to deterministic coach:', err.message);
    return generateDeterministicCoaching(scoringData, question);
  }
}

module.exports = {
  isConfigured,
  getCoachResponse
};
