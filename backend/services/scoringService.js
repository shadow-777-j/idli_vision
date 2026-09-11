/**
 * scoringService.js
 * Converts raw computer vision measurements into normalized quality scores.
 * Kept strictly decoupled from OpenCV image processing per Section 14.
 */

// Target Reference Standards (as defined in Section 7.1)
const TARGETS = {
  diameterCm: 8.0,
  thicknessCm: 2.3
};

// Explicit Score Weights (total = 1.0)
// Rationale:
// - Roundness (0.25): Essential characteristic of traditional idli plate steaming.
// - Diameter (0.20): Indicates correct batter volume and mold fill.
// - Thickness (0.20): Reflects proper batter leavening and rise.
// - Symmetry (0.15): Indicates uniform steaming and heat distribution.
// - Deformity (0.10): Penalizes sagging or irregular edges.
// - Hole Distribution (0.10): Reflects even carbon dioxide aeration from fermentation.
const WEIGHTS = {
  roundness: 0.25,
  diameter: 0.20,
  thickness: 0.20,
  symmetry: 0.15,
  deformity: 0.10,
  holeDistribution: 0.10
};

/**
 * Maps an overall score (0-100) to entertainment/product category per Section 8.1
 * @param {number} score 
 * @returns {string} Category label
 */
function getScoreCategory(score) {
  if (score >= 90) return 'Idli Master';
  if (score >= 80) return 'Pretty Perfect';
  if (score >= 70) return 'Decent Idli';
  if (score >= 50) return 'Needs Work';
  return 'Structural Failure';
}

/**
 * Calculates quality scores from raw vision measurements.
 * @param {Object} rawMeasurements 
 * @returns {Object} Structured scores and evaluation details
 */
function calculateScores(rawMeasurements) {
  const {
    diameterCm = 0,
    thicknessCm = 0,
    roundnessRaw = 0,
    symmetryRaw = 0,
    deformityRaw = 0,
    holeCount = 0,
    holeDistributionRaw = 0
  } = rawMeasurements;

  // Normalized individual scores (0-100)
  // Diameter score: peak at 8.0 cm, penalty for deviation
  const diameterDiff = Math.abs(diameterCm - TARGETS.diameterCm);
  const diameterScore = Math.max(0, Math.round(100 - (diameterDiff / TARGETS.diameterCm) * 100));

  // Thickness score: peak at 2.3 cm, penalty for deviation
  const thicknessDiff = Math.abs(thicknessCm - TARGETS.thicknessCm);
  const thicknessScore = Math.max(0, Math.round(100 - (thicknessDiff / TARGETS.thicknessCm) * 100));

  const roundnessScore = Math.min(100, Math.max(0, Math.round(roundnessRaw * 100)));
  const symmetryScore = Math.min(100, Math.max(0, Math.round(symmetryRaw * 100)));
  const deformityScore = Math.min(100, Math.max(0, Math.round(Math.max(0, 1 - deformityRaw) * 100)));
  const holeDistributionScore = Math.min(100, Math.max(0, Math.round(holeDistributionRaw * 100)));

  // Weighted overall score
  const overallScore = Math.round(
    (roundnessScore * WEIGHTS.roundness) +
    (diameterScore * WEIGHTS.diameter) +
    (thicknessScore * WEIGHTS.thickness) +
    (symmetryScore * WEIGHTS.symmetry) +
    (deformityScore * WEIGHTS.deformity) +
    (holeDistributionScore * WEIGHTS.holeDistribution)
  );

  // Derive detected issues based on actual measurements per Section 8.1
  const detectedIssues = [];
  if (diameterDiff > 1.2) {
    detectedIssues.push(diameterCm < TARGETS.diameterCm 
      ? 'Under-sized diameter (batter may have been under-filled)'
      : 'Over-spread diameter (batter may be overly watery)');
  }
  if (thicknessDiff > 0.6) {
    detectedIssues.push(thicknessCm < TARGETS.thicknessCm
      ? 'Insufficient thickness/rise (indicates low fermentation leavening)'
      : 'Excessive thickness (uneven mold depth)');
  }
  if (roundnessScore < 75) {
    detectedIssues.push('Uneven circular geometry (non-concentric contour)');
  }
  if (symmetryScore < 75) {
    detectedIssues.push('Asymmetrical shape across primary axis');
  }
  if (deformityScore < 70) {
    detectedIssues.push('Noticeable edge deformity or surface irregularity');
  }
  if (holeCount < 5) {
    detectedIssues.push('Sparse surface aeration (low visible steaming pore count)');
  } else if (holeDistributionScore < 60) {
    detectedIssues.push('Aeration pores concentrated unevenly on one side');
  }

  return {
    overallScore,
    category: getScoreCategory(overallScore),
    metrics: {
      diameter: {
        valueCm: Number(diameterCm.toFixed(2)),
        targetCm: TARGETS.diameterCm,
        score: diameterScore
      },
      thickness: {
        valueCm: Number(thicknessCm.toFixed(2)),
        targetCm: TARGETS.thicknessCm,
        score: thicknessScore
      },
      roundness: { score: roundnessScore },
      symmetry: { score: symmetryScore },
      deformity: { score: deformityScore },
      holeCount: { count: holeCount },
      holeDistribution: { score: holeDistributionScore }
    },
    detectedIssues
  };
}

module.exports = {
  calculateScores,
  getScoreCategory,
  WEIGHTS,
  TARGETS
};
