/**
 * script.js
 * Frontend client logic for Idli Vision.
 * Handles navigation flow, dual perspective image uploads, previews, validation, and API health checks.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    topFile: null,
    sideFile: null,
    isProcessing: false,
    backendHealthy: false
  };

  // DOM Elements - Navigation
  const navButtons = document.querySelectorAll('.nav-step');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const returnToAnalyzerBtn = document.getElementById('returnToAnalyzerBtn');

  // DOM Elements - System Status
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // DOM Elements - Top Upload
  const topDropzone = document.getElementById('topDropzone');
  const topInput = document.getElementById('topImageInput');
  const topDropContent = document.getElementById('topDropContent');
  const topPreviewContainer = document.getElementById('topPreviewContainer');
  const topPreviewImg = document.getElementById('topPreviewImg');
  const removeTopBtn = document.getElementById('removeTopBtn');
  const topMeta = document.getElementById('topMeta');

  // DOM Elements - Side Upload
  const sideDropzone = document.getElementById('sideDropzone');
  const sideInput = document.getElementById('sideImageInput');
  const sideDropContent = document.getElementById('sideDropContent');
  const sidePreviewContainer = document.getElementById('sidePreviewContainer');
  const sidePreviewImg = document.getElementById('sidePreviewImg');
  const removeSideBtn = document.getElementById('removeSideBtn');
  const sideMeta = document.getElementById('sideMeta');

  // DOM Elements - Action Dock
  const uploadStatusPill = document.getElementById('uploadStatusPill');
  const uploadStatusText = document.getElementById('uploadStatusText');
  const analyzeBtn = document.getElementById('analyzeBtn');

  // 1. Navigation Flow Handlers
  function switchTab(targetTabId) {
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === targetTabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      switchTab(targetTabId);
    });
  });

  if (returnToAnalyzerBtn) {
    returnToAnalyzerBtn.addEventListener('click', () => {
      switchTab('tab-analyzer');
    });
  }

  // 2. Health Check
  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('API health returned non-200');
      const data = await res.json();
      state.backendHealthy = true;
      statusDot.className = 'status-indicator online';
      statusText.textContent = `Online: ${data.app} (Phase ${data.phase})`;
    } catch (err) {
      state.backendHealthy = false;
      statusDot.className = 'status-indicator offline';
      statusDot.style.background = '#ef4444';
      statusDot.style.boxShadow = '0 0 10px #ef4444';
      statusText.textContent = 'Backend Offline';
    }
  }

  // 3. Dropzone & File Handling Utilities
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file format. Please choose a JPG, PNG, or WebP photo.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size exceeds the 10MB limit.');
      return false;
    }
    return true;
  }

  function handleFileSelect(file, perspective) {
    if (!validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (perspective === 'top') {
        state.topFile = file;
        topPreviewImg.src = e.target.result;
        topMeta.textContent = `${file.name} (${formatBytes(file.size)})`;
        topDropContent.style.display = 'none';
        topPreviewContainer.classList.remove('hidden');
      } else if (perspective === 'side') {
        state.sideFile = file;
        sidePreviewImg.src = e.target.result;
        sideMeta.textContent = `${file.name} (${formatBytes(file.size)})`;
        sideDropContent.style.display = 'none';
        sidePreviewContainer.classList.remove('hidden');
      }
      updateFormState();
    };
    reader.readAsDataURL(file);
  }

  function clearFile(perspective) {
    if (perspective === 'top') {
      state.topFile = null;
      topInput.value = '';
      topPreviewImg.src = '';
      topMeta.textContent = '';
      topPreviewContainer.classList.add('hidden');
      topDropContent.style.display = 'block';
    } else if (perspective === 'side') {
      state.sideFile = null;
      sideInput.value = '';
      sidePreviewImg.src = '';
      sideMeta.textContent = '';
      sidePreviewContainer.classList.add('hidden');
      sideDropContent.style.display = 'block';
    }
    updateFormState();
  }

  function setupDropzoneEvents(dropzone, input, perspective) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileSelect(files[0], perspective);
      }
    });

    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        handleFileSelect(input.files[0], perspective);
      }
    });
  }

  // Setup handlers for both dropzones
  setupDropzoneEvents(topDropzone, topInput, 'top');
  setupDropzoneEvents(sideDropzone, sideInput, 'side');

  removeTopBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile('top');
  });

  removeSideBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile('side');
  });

  // 4. Update Validation State & Button Readiness
  function updateFormState() {
    const hasTop = Boolean(state.topFile);
    const hasSide = Boolean(state.sideFile);

    if (hasTop && hasSide) {
      uploadStatusPill.className = 'status-pill success';
      uploadStatusPill.textContent = 'Dual Views Ready';
      uploadStatusText.textContent = 'Both required perspectives loaded. Ready to run CV analysis.';
      analyzeBtn.disabled = false;
    } else if (hasTop && !hasSide) {
      uploadStatusPill.className = 'status-pill warn';
      uploadStatusPill.textContent = 'Side View Needed';
      uploadStatusText.textContent = 'Top view ready. Please add side profile view to compute thickness.';
      analyzeBtn.disabled = true;
    } else if (!hasTop && hasSide) {
      uploadStatusPill.className = 'status-pill warn';
      uploadStatusPill.textContent = 'Top View Needed';
      uploadStatusText.textContent = 'Side view ready. Please add top view to compute diameter & circularity.';
      analyzeBtn.disabled = true;
    } else {
      uploadStatusPill.className = 'status-pill warn';
      uploadStatusPill.textContent = 'Awaiting Photos';
      uploadStatusText.textContent = 'Please upload both top and side perspectives to begin analysis.';
      analyzeBtn.disabled = true;
    }
  }

  // 5. Submit Analysis (Phase 1/2 preparation)
  analyzeBtn.addEventListener('click', async () => {
    if (!state.topFile || !state.sideFile) return;

    try {
      analyzeBtn.disabled = true;
      const originalText = analyzeBtn.querySelector('.btn-text').textContent;
      analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing Geometry...';

      const formData = new FormData();
      formData.append('topImage', state.topFile);
      formData.append('sideImage', state.sideFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Computer vision pipeline failed.');
      }

      console.log('Analysis result received:', json);
      alert(`CV Analysis Pipeline Executed Successfully!\n\nScore: ${json.data.scores.overallScore}/100 (${json.data.scores.category})\nDiameter: ${json.data.scores.metrics.diameter.valueCm}cm\nThickness: ${json.data.scores.metrics.thickness.valueCm}cm\nDetected Holes: ${json.data.scores.metrics.holeCount.count}`);
    } catch (err) {
      alert(`Notice: ${err.message}`);
    } finally {
      analyzeBtn.querySelector('.btn-text').textContent = 'Execute Computer Vision Analysis';
      analyzeBtn.disabled = false;
    }
  });

  // Init
  checkBackendHealth();
  updateFormState();
});
