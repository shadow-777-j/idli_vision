/**
 * visionService.js
 * Bridges Node.js backend with Python OpenCV vision analyzer.
 * Adheres to Section 7.3 & Section 15: deterministic measurements only.
 */

const { spawn } = require('child_process');
const path = require('path');

const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const ANALYZER_SCRIPT = path.join(__dirname, '../../vision/analyzer.py');

/**
 * Runs the Python computer vision analyzer on top and side images.
 * @param {string} topImagePath Path to the top-view image
 * @param {string} sideImagePath Path to the side-view image
 * @returns {Promise<Object>} Structured measurement results
 */
async function analyzeImages(topImagePath, sideImagePath) {
  return new Promise((resolve, reject) => {
    const args = [
      ANALYZER_SCRIPT,
      '--top', topImagePath,
      '--side', sideImagePath
    ];

    const pyProcess = spawn(PYTHON_PATH, args);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Vision pipeline exited with code ${code}: ${stderrData || stdoutData}`));
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse vision pipeline JSON output: ${err.message}. Raw output: ${stdoutData}`));
      }
    });

    pyProcess.on('error', (err) => {
      reject(new Error(`Failed to execute Python process (${PYTHON_PATH}): ${err.message}`));
    });
  });
}

module.exports = {
  analyzeImages
};
