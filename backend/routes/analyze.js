/**
 * analyze.js
 * Routes for uploading images and running CV analysis.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { analyzeImages } = require('../services/visionService');
const { calculateScores } = require('../services/scoringService');

// Configure Multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File validation per Section 11: jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const extValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  }
  cb(new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const uploadFields = upload.fields([
  { name: 'topImage', maxCount: 1 },
  { name: 'sideImage', maxCount: 1 }
]);

/**
 * POST /api/analyze
 * Receives top and side view images, runs pipeline, returns quality report.
 */
router.post('/', (req, res) => {
  uploadFields(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image file size exceeds the 10MB limit.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Validate that both required images are present
      if (!req.files || !req.files['topImage'] || !req.files['sideImage']) {
        return res.status(400).json({
          error: 'Both top-view and side-view images are required for complete analysis.'
        });
      }

      const topFile = req.files['topImage'][0];
      const sideFile = req.files['sideImage'][0];

      // Execute vision pipeline
      const rawMeasurements = await analyzeImages(topFile.path, sideFile.path);

      // Score raw measurements
      const scoreReport = calculateScores(rawMeasurements);

      // Construct final structured response
      const responsePayload = {
        success: true,
        data: {
          measurements: rawMeasurements,
          scores: scoreReport,
          annotatedImages: {
            top: rawMeasurements.annotatedTopBase64 || null,
            side: rawMeasurements.annotatedSideBase64 || null
          }
        }
      };

      // Cleanup uploaded files after processing per Section 11
      try {
        if (fs.existsSync(topFile.path)) fs.unlinkSync(topFile.path);
        if (fs.existsSync(sideFile.path)) fs.unlinkSync(sideFile.path);
      } catch (cleanupErr) {
        console.warn('Warning: Could not remove temporary upload file:', cleanupErr.message);
      }

      return res.json(responsePayload);
    } catch (procErr) {
      console.error('Analysis error:', procErr.message);
      return res.status(500).json({
        error: 'Computer vision analysis failed. Please ensure the image is clear and the idli is fully visible.'
      });
    }
  });
});

module.exports = router;
