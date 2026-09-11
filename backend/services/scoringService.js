/**
 * scoringService.js
 * Converts raw computer vision measurements into normalized quality scores.
 * Kept strictly decoupled from OpenCV image processing per Section 14.
 */

// Target Reference Standards (Section 7.1)
const TARGETS = {
  diameterCm: 8.0,
  thicknessCm: 2.3
};

// Explicit Score Weights (total = 1.0)
// Rationale:
// - Roundness (0.25): Primary circular geometry of steamed idli molds.
// - Diameter (0.20): Indicates correct batter volume and mold fill.
// - Thickness (0.20): Reflects proper batter leavening and rise.
// - Symmetry (0.15): Indicates uniform steaming and heat distribution.
// - Deformity (0.10): Edge stability without batter slumping.
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
    diameterCm = 8.0,
    thicknessCm = 2.3,
    roundnessRaw = 0.85,
    symmetryRaw = 0.80,
    deformityRaw = 0.10,
    holeCount = 12,
    holeDistributionRaw = 0.75
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
  if (diameterDiff > 0.8) {
    detectedIssues.push({
      metric: 'diameter',
      title: diameterCm < TARGETS.diameterCm ? 'Under-Sized Diameter' : 'Over-Spread Diameter',
      detail: `Measured ${diameterCm.toFixed(1)} cm vs ${TARGETS.diameterCm} cm standard. ${diameterCm < TARGETS.diameterCm ? 'Under-filled mold cup.' : 'Excessively thin or watery batter.'}`
    });
  }
  if (thicknessDiff > 0.4) {
    detectedIssues.push({
      metric: 'thickness',
      title: thicknessCm < TARGETS.thicknessCm ? 'Insufficient Rise / Flat Profile' : 'Excessive Dome Thickness',
      detail: `Measured ${thicknessCm.toFixed(1)} cm vs ${TARGETS.thicknessCm} cm standard. ${thicknessCm < TARGETS.thicknessCm ? 'Weak fermentation or dead yeast leavening.' : 'Uneven batter spooning.'}`
    });
  }
  if (roundnessScore < 80) {
    detectedIssues.push({
      metric: 'roundness',
      title: 'Irregular Contour Circularity',
      detail: `Circularity score ${roundnessScore}/100. Non-concentric outer edge detected.`
    });
  }
  if (symmetryScore < 78) {
    detectedIssues.push({
      metric: 'symmetry',
      title: 'Asymmetrical Steaming Drift',
      detail: `Symmetry score ${symmetryScore}/100. Batter shifted unevenly across primary axis.`
    });
  }
  if (deformityScore < 75) {
    detectedIssues.push({
      metric: 'deformity',
      title: 'Perimeter Edge Slump',
      detail: `Edge integrity ${deformityScore}/100. Surface slump or mold sticking defect.`
    });
  }
  if (holeCount < 6) {
    detectedIssues.push({
      metric: 'holeCount',
      title: 'Dense Crumb / Low Aeration Pores',
      detail: `Only ${holeCount} surface pores found. Batter under-fermented without sufficient CO₂ entrapment.`
    });
  } else if (holeDistributionScore < 65) {
    detectedIssues.push({
      metric: 'holeDistribution',
      title: 'Asymmetric Pore Venting',
      detail: `Pore distribution score ${holeDistributionScore}/100. Steam vents concentrated on one quadrant.`
    });
  }

  // Radar chart datasets for Chart.js
  const radarData = {
    labels: ['Diameter', 'Thickness', 'Roundness', 'Symmetry', 'Edge Integrity', 'Aeration'],
    current: [diameterScore, thicknessScore, roundnessScore, symmetryScore, deformityScore, holeDistributionScore],
    ideal: [100, 100, 100, 100, 100, 100]
  };

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
      roundness: { score: roundnessScore, raw: roundnessRaw },
      symmetry: { score: symmetryScore, raw: symmetryRaw },
      deformity: { score: deformityScore, raw: deformityRaw },
      holeCount: { count: holeCount },
      holeDistribution: { score: holeDistributionScore, raw: holeDistributionRaw }
    },
    detectedIssues,
    radarData
  };
}

module.exports = {
  calculateScores,
  getScoreCategory,
  WEIGHTS,
  TARGETS
};
