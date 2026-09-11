/**
 * script.js
 * Comprehensive Frontend Logic for Idli Vision.
 * Implements Sections 6.1 (Lore), 7.2 (Dual-View Upload), 7.5 (Overlays),
 * 8.1 (Report & Radar), 8.2 (Comparison Mode), and 8.3/Phase 10 (Idli Coach).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    topFile: null,
    sideFile: null,
    topDataUrl: null,
    sideDataUrl: null,
    isProcessing: false,
    analysisResult: null,
    radarChart: null,
    fermentProgress: 35,
    fermentTemp: 30
  };

  // -------------------------------------------------------------
  // 1. Navigation Flow Handlers
  // -------------------------------------------------------------
  const navButtons = document.querySelectorAll('.nav-step');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(targetTabId) {
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // -------------------------------------------------------------
  // 2. Health & Backend Status Check
  // -------------------------------------------------------------
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error();
      const data = await res.json();
      statusDot.className = 'status-indicator online';
      statusText.textContent = `Online: ${data.app}`;
    } catch {
      statusDot.className = 'status-indicator offline';
      statusDot.style.background = '#ef4444';
      statusDot.style.boxShadow = '0 0 10px #ef4444';
      statusText.textContent = 'Backend Offline';
    }
  }
  checkBackendHealth();

  // -------------------------------------------------------------
  // 3. Section 6.1: Interactive Origin Story & Fermentation Game
  // -------------------------------------------------------------
  // Feature A: Choose-Your-Path Navigation
  const pathButtons = document.querySelectorAll('.path-btn');
  const pathContents = document.querySelectorAll('.path-content');

  pathButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pathButtons.forEach(b => b.classList.remove('active'));
      pathContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-path');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // Feature B: Evolution Timeline
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const eraDetailTitle = document.getElementById('eraDetailTitle');
  const eraDetailDesc = document.getElementById('eraDetailDesc');

  const eraData = {
    'era-ancient': {
      title: "920 CE — Sivakotiacharya's Vaddaradhane",
      desc: "Oldest recorded mention of 'Iddalige'. Batter of pure urad dal soaked in spiced buttermilk and steamed in cloth, creating a rich ceremonial cake."
    },
    'era-medieval': {
      title: "1130 CE — King Someshvara III's Manasollasa",
      desc: "Recorded as 'Iddarika'. Culinary evolution incorporated fine-milled rice grits, giving the crumb its distinct dual-phase cellular structure."
    },
    'era-modern': {
      title: "20th Century — Precision Stainless Steel Molds",
      desc: "Standardization of concentric circular tiered steamer plates. Creation of the iconic 8.0 cm circular diameter mold used across South India."
    },
    'era-ai': {
      title: "Present Day — Computer Vision & AI-Judged Idli",
      desc: "Deterministic OpenCV contour telemetry meets culinary engineering. Pixel-calibrated diameter, symmetry axis, and aeration analysis."
    }
  };

  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      timelineSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      const eraKey = step.getAttribute('data-era');
      if (eraData[eraKey]) {
        eraDetailTitle.textContent = eraData[eraKey].title;
        eraDetailDesc.textContent = eraData[eraKey].desc;
      }
    });
  });

  // Feature C: Ingredient Personalities
  const ingredientCards = document.querySelectorAll('.ingredient-card');
  const ingQuoteText = document.getElementById('ingQuoteText');
  const ingAuthorText = document.getElementById('ingAuthorText');

  const ingredientQuotes = {
    'urad': {
      quote: '"Look at me. I am Urad Gota. Without my globulins and arabinogalactan mucilage, you don\'t have an idli — you have an edible doorstop. I trap every single CO₂ bubble with my life!"',
      author: '— Urad Dal, Chief Fluffiness Officer'
    },
    'rice': {
      quote: '"Urad dal talks big, but without my parboiled amylose starch scaffolding, your idli would collapse into a puddle. I provide the structural crystalline backbone!"',
      author: '— Parboiled Rice, Lead Structural Engineer'
    },
    'fenugreek': {
      quote: '"You only need a teaspoon of me, but my galactomannan polysaccharides stabilize your foam bubbles and catalyze rapid wild yeast multiplication. Respect the methi!"',
      author: '— Fenugreek (Methi), Biochemical Catalyst'
    },
    'water': {
      quote: '"Use ice-cold water during grinding to keep protein bonds cool and airy. Add non-iodized sea salt to nurture lactic acid bacteria while holding rogue fungi at bay!"',
      author: '— Water & Sea Salt, Microbial Mediators'
    }
  };

  ingredientCards.forEach(card => {
    card.addEventListener('click', () => {
      ingredientCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const ingKey = card.getAttribute('data-ingredient');
      if (ingredientQuotes[ingKey]) {
        ingQuoteText.textContent = ingredientQuotes[ingKey].quote;
        ingAuthorText.textContent = ingredientQuotes[ingKey].author;
      }
    });
  });

  // Feature D: Fermentation Mini-Game
  const batterLiquid = document.getElementById('batterLiquid');
  const fermentPercent = document.getElementById('fermentPercent');
  const floraStatus = document.getElementById('floraStatus');
  const batterStatus = document.getElementById('batterStatus');
  const tempSlider = document.getElementById('tempSlider');
  const tempDisplay = document.getElementById('tempDisplay');
  const advanceFermentBtn = document.getElementById('advanceFermentBtn');
  const resetFermentBtn = document.getElementById('resetFermentBtn');
  const fermentCelebration = document.getElementById('fermentCelebration');
  const transitionToAnalyzerBtn = document.getElementById('transitionToAnalyzerBtn');
  const ctaStartAnalysis = document.getElementById('ctaStartAnalysis');

  function updateFermentDisplay() {
    batterLiquid.style.height = `${state.fermentProgress}%`;
    fermentPercent.textContent = `${state.fermentProgress}%`;

    const temp = state.fermentTemp;
    if (temp < 22) {
      tempDisplay.textContent = `${temp}°C (Too Cold — Bacteria Sluggish)`;
      floraStatus.textContent = 'Leuconostoc Dormant';
      batterStatus.textContent = 'Stalled';
    } else if (temp > 38) {
      tempDisplay.textContent = `${temp}°C (Too Hot — Microbes Stressed)`;
      floraStatus.textContent = 'Acid Overproduction';
      batterStatus.textContent = 'Sour / Risk of Collapse';
    } else {
      tempDisplay.textContent = `${temp}°C (Optimal Fermentation)`;
      floraStatus.textContent = 'Leuconostoc & Lactobacillus Active';
      batterStatus.textContent = state.fermentProgress >= 90 ? 'Double Volume Reached!' : 'Actively Leavening';
    }

    if (state.fermentProgress >= 90) {
      fermentCelebration.classList.remove('hidden');
    } else {
      fermentCelebration.classList.add('hidden');
    }
  }

  tempSlider.addEventListener('input', (e) => {
    state.fermentTemp = parseInt(e.target.value, 10);
    updateFermentDisplay();
  });

  advanceFermentBtn.addEventListener('click', () => {
    let increment = 25;
    if (state.fermentTemp < 22) increment = 8;
    else if (state.fermentTemp > 38) increment = 12;

    state.fermentProgress = Math.min(100, state.fermentProgress + increment);
    updateFermentDisplay();
  });

  resetFermentBtn.addEventListener('click', () => {
    state.fermentProgress = 25;
    updateFermentDisplay();
  });

  if (transitionToAnalyzerBtn) {
    transitionToAnalyzerBtn.addEventListener('click', () => switchTab('tab-analyzer'));
  }
  if (ctaStartAnalysis) {
    ctaStartAnalysis.addEventListener('click', () => switchTab('tab-analyzer'));
  }

  // -------------------------------------------------------------
  // 4. Section 7.2: Dual-Perspective Upload & Client Previews
  // -------------------------------------------------------------
  const topDropzone = document.getElementById('topDropzone');
  const topInput = document.getElementById('topImageInput');
  const topDropContent = document.getElementById('topDropContent');
  const topPreviewContainer = document.getElementById('topPreviewContainer');
  const topPreviewImg = document.getElementById('topPreviewImg');
  const removeTopBtn = document.getElementById('removeTopBtn');
  const topMeta = document.getElementById('topMeta');

  const sideDropzone = document.getElementById('sideDropzone');
  const sideInput = document.getElementById('sideImageInput');
  const sideDropContent = document.getElementById('sideDropContent');
  const sidePreviewContainer = document.getElementById('sidePreviewContainer');
  const sidePreviewImg = document.getElementById('sidePreviewImg');
  const removeSideBtn = document.getElementById('removeSideBtn');
  const sideMeta = document.getElementById('sideMeta');

  const uploadStatusPill = document.getElementById('uploadStatusPill');
  const uploadStatusText = document.getElementById('uploadStatusText');
  const analyzeBtn = document.getElementById('analyzeBtn');

  function formatBytes(bytes, decimals = 1) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  function handleFileSelect(file, perspective) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file format. Please upload JPG, PNG, or WebP images.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (perspective === 'top') {
        state.topFile = file;
        state.topDataUrl = e.target.result;
        topPreviewImg.src = e.target.result;
        topMeta.textContent = `${file.name} (${formatBytes(file.size)})`;
        topDropContent.style.display = 'none';
        topPreviewContainer.classList.remove('hidden');
      } else {
        state.sideFile = file;
        state.sideDataUrl = e.target.result;
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
      state.topDataUrl = null;
      topInput.value = '';
      topPreviewImg.src = '';
      topPreviewContainer.classList.add('hidden');
      topDropContent.style.display = 'block';
    } else {
      state.sideFile = null;
      state.sideDataUrl = null;
      sideInput.value = '';
      sidePreviewImg.src = '';
      sidePreviewContainer.classList.add('hidden');
      sideDropContent.style.display = 'block';
    }
    updateFormState();
  }

  function setupDropzone(dropzone, input, perspective) {
    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0], perspective);
      }
    });

    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        handleFileSelect(input.files[0], perspective);
      }
    });
  }

  setupDropzone(topDropzone, topInput, 'top');
  setupDropzone(sideDropzone, sideInput, 'side');

  removeTopBtn.addEventListener('click', (e) => { e.stopPropagation(); clearFile('top'); });
  removeSideBtn.addEventListener('click', (e) => { e.stopPropagation(); clearFile('side'); });

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
      uploadStatusText.textContent = 'Top view loaded. Please add side profile to measure thickness.';
      analyzeBtn.disabled = true;
    } else if (!hasTop && hasSide) {
      uploadStatusPill.className = 'status-pill warn';
      uploadStatusPill.textContent = 'Top View Needed';
      uploadStatusText.textContent = 'Side view loaded. Please add top view to measure diameter & symmetry.';
      analyzeBtn.disabled = true;
    } else {
      uploadStatusPill.className = 'status-pill warn';
      uploadStatusPill.textContent = 'Awaiting Photos';
      uploadStatusText.textContent = 'Please upload both top and side perspectives to begin analysis.';
      analyzeBtn.disabled = true;
    }
  }

  // Sample Presets Loader (Section 16)
  async function loadSamplePreset(topPath, sidePath, label) {
    try {
      const topBlob = await fetch(topPath).then(r => r.blob());
      const sideBlob = await fetch(sidePath).then(r => r.blob());
      const topFile = new File([topBlob], `${label}_top.jpg`, { type: 'image/jpeg' });
      const sideFile = new File([sideBlob], `${label}_side.jpg`, { type: 'image/jpeg' });
      handleFileSelect(topFile, 'top');
      handleFileSelect(sideFile, 'side');
    } catch (e) {
      console.warn('Could not load preset files:', e);
    }
  }

  document.getElementById('presetPerfect').addEventListener('click', () => {
    loadSamplePreset('/samples/perfect_top.jpg', '/samples/perfect_side.jpg', 'perfect');
  });
  document.getElementById('presetFlat').addEventListener('click', () => {
    loadSamplePreset('/samples/flat_top.jpg', '/samples/flat_side.jpg', 'flat');
  });
  document.getElementById('presetUneven').addEventListener('click', () => {
    loadSamplePreset('/samples/uneven_top.jpg', '/samples/uneven_side.jpg', 'uneven');
  });

  // -------------------------------------------------------------
  // 5. Execute Analysis Pipeline (Multipart POST)
  // -------------------------------------------------------------
  const analysisProgressCard = document.getElementById('analysisProgressCard');
  const progressTicker = document.getElementById('progressTicker');

  analyzeBtn.addEventListener('click', async () => {
    if (!state.topFile || !state.sideFile || state.isProcessing) return;

    state.isProcessing = true;
    analyzeBtn.disabled = true;
    analysisProgressCard.classList.remove('hidden');

    const tickerSteps = [
      "OpenCV: Preprocessing & Gaussian smoothing...",
      "OpenCV: Segmenting outer boundary & fitting contour...",
      "OpenCV: Calibrating diameter against 8.0 cm reference standard...",
      "OpenCV: Computing principal inertia moments & symmetry axis...",
      "OpenCV: Measuring side vertical peak rise against 2.3 cm standard...",
      "OpenCV: Detecting steam aeration pores & spatial dispersion...",
      "Scoring Engine: Calculating normalized IdliQ scores..."
    ];
    let tickerIdx = 0;
    const tickerInterval = setInterval(() => {
      progressTicker.textContent = tickerSteps[tickerIdx % tickerSteps.length];
      tickerIdx++;
    }, 450);

    try {
      const formData = new FormData();
      formData.append('topImage', state.topFile);
      formData.append('sideImage', state.sideFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Computer vision pipeline failed.');
      }

      state.analysisResult = payload.data;
      renderQualityReport(payload.data);
      switchTab('tab-report');
    } catch (err) {
      alert(`Notice: ${err.message}`);
    } finally {
      clearInterval(tickerInterval);
      analysisProgressCard.classList.add('hidden');
      state.isProcessing = false;
      analyzeBtn.disabled = false;
    }
  });

  // -------------------------------------------------------------
  // 6. Section 8.1: Render Quality Report & Radar Chart
  // -------------------------------------------------------------
  const overallScoreVal = document.getElementById('overallScoreVal');
  const scoreRingFill = document.getElementById('scoreRingFill');
  const categoryBadge = document.getElementById('categoryBadge');
  const scoreTitle = document.getElementById('scoreTitle');
  const scoreSummary = document.getElementById('scoreSummary');

  const overlayTopImg = document.getElementById('overlayTopImg');
  const overlaySideImg = document.getElementById('overlaySideImg');
  const origTopImg = document.getElementById('origTopImg');
  const origSideImg = document.getElementById('origSideImg');
  const btnShowOverlay = document.getElementById('btnShowOverlay');
  const btnShowOriginal = document.getElementById('btnShowOriginal');

  const metricDiaVal = document.getElementById('metricDiaVal');
  const barDia = document.getElementById('barDia');
  const scoreDia = document.getElementById('scoreDia');

  const metricThickVal = document.getElementById('metricThickVal');
  const barThick = document.getElementById('barThick');
  const scoreThick = document.getElementById('scoreThick');

  const metricRoundVal = document.getElementById('metricRoundVal');
  const barRound = document.getElementById('barRound');
  const scoreRound = document.getElementById('scoreRound');

  const metricSymmVal = document.getElementById('metricSymmVal');
  const barSymm = document.getElementById('barSymm');
  const scoreSymm = document.getElementById('scoreSymm');

  const metricDefVal = document.getElementById('metricDefVal');
  const barDef = document.getElementById('barDef');
  const scoreDef = document.getElementById('scoreDef');

  const metricPoresVal = document.getElementById('metricPoresVal');
  const barPores = document.getElementById('barPores');
  const scorePores = document.getElementById('scorePores');

  const issuesList = document.getElementById('issuesList');

  function renderQualityReport(data) {
    const { measurements, scores } = data;
    const { overallScore, category, metrics, detectedIssues = [], radarData } = scores;

    // Overall Score & Ring Animation
    overallScoreVal.textContent = overallScore;
    categoryBadge.textContent = category;
    
    // Circle circumference = 2 * pi * 50 = 314
    const offset = 314 - (314 * (overallScore / 100));
    scoreRingFill.style.strokeDashoffset = offset;

    if (overallScore >= 90) {
      scoreTitle.textContent = "Idli Master — Structural Precision";
      scoreSummary.textContent = "Your idli matches standard geometry with remarkable fidelity. Optimal leavening rise, concentric circularity, and even aeration.";
    } else if (overallScore >= 80) {
      scoreTitle.textContent = "Pretty Perfect — Fine Culinary Craft";
      scoreSummary.textContent = "Strong circular contour and solid vertical loft. Minor opportunities to refine edge tension and pore uniformity.";
    } else if (overallScore >= 70) {
      scoreTitle.textContent = "Decent Idli — Good Everyday Breakfast";
      scoreSummary.textContent = "Solid flavor expected, though geometry exhibits moderate drift from target diameter or leavening loft.";
    } else if (overallScore >= 50) {
      scoreTitle.textContent = "Needs Work — Leavening or Mold Variation";
      scoreSummary.textContent = "Detectable slump or flat profile. Needs attention to urad dal aeration and fermentation time.";
    } else {
      scoreTitle.textContent = "Structural Failure — Flat or Distorted";
      scoreSummary.textContent = "Significant deviation from reference target. Batter likely unfermented or water ratio disrupted.";
    }

    // Overlays
    overlayTopImg.src = data.annotatedImages.top || state.topDataUrl;
    overlaySideImg.src = data.annotatedImages.side || state.sideDataUrl;
    origTopImg.src = state.topDataUrl;
    origSideImg.src = state.sideDataUrl;

    // Metrics Cards
    metricDiaVal.textContent = `${metrics.diameter.valueCm} cm`;
    barDia.style.width = `${metrics.diameter.score}%`;
    scoreDia.textContent = `${metrics.diameter.score}/100`;

    metricThickVal.textContent = `${metrics.thickness.valueCm} cm`;
    barThick.style.width = `${metrics.thickness.score}%`;
    scoreThick.textContent = `${metrics.thickness.score}/100`;

    metricRoundVal.textContent = (measurements.roundnessRaw || 0.88).toFixed(2);
    barRound.style.width = `${metrics.roundness.score}%`;
    scoreRound.textContent = `${metrics.roundness.score}/100`;

    metricSymmVal.textContent = (measurements.symmetryRaw || 0.82).toFixed(2);
    barSymm.style.width = `${metrics.symmetry.score}%`;
    scoreSymm.textContent = `${metrics.symmetry.score}/100`;

    metricDefVal.textContent = `${metrics.deformity.score}%`;
    barDef.style.width = `${metrics.deformity.score}%`;
    scoreDef.textContent = `${metrics.deformity.score}/100`;

    metricPoresVal.textContent = `${metrics.holeCount.count} Pores`;
    barPores.style.width = `${metrics.holeDistribution.score}%`;
    scorePores.textContent = `${metrics.holeDistribution.score}/100`;

    // Detected Issues List (Section 8.1)
    issuesList.innerHTML = '';
    if (detectedIssues.length === 0) {
      issuesList.innerHTML = `
        <div class="issue-item good">
          <span class="issue-icon">✅</span>
          <div class="issue-body">
            <strong>Optimal Physical Conformance</strong>
            <p>No critical defects detected. Diameter, thickness, circularity, and porosity all align closely with standard targets.</p>
          </div>
        </div>`;
    } else {
      detectedIssues.forEach(issue => {
        issuesList.innerHTML += `
          <div class="issue-item">
            <span class="issue-icon">⚠️</span>
            <div class="issue-body">
              <strong>${issue.title}</strong>
              <p>${issue.detail}</p>
            </div>
          </div>`;
      });
    }

    // Chart.js Radar Chart
    renderRadarChart(radarData || {
      labels: ['Diameter', 'Thickness', 'Roundness', 'Symmetry', 'Edge Integrity', 'Aeration'],
      current: [metrics.diameter.score, metrics.thickness.score, metrics.roundness.score, metrics.symmetry.score, metrics.deformity.score, metrics.holeDistribution.score],
      ideal: [100, 100, 100, 100, 100, 100]
    });

    // Automatically synchronize Coach preview data
    syncCoachWithScores(data.scores);
  }

  // Toggle Overlays View Mode
  btnShowOverlay.addEventListener('click', () => {
    btnShowOverlay.classList.add('active');
    btnShowOriginal.classList.remove('active');
    overlayTopImg.classList.remove('hidden');
    overlaySideImg.classList.remove('hidden');
    origTopImg.classList.add('hidden');
    origSideImg.classList.add('hidden');
  });

  btnShowOriginal.addEventListener('click', () => {
    btnShowOriginal.classList.add('active');
    btnShowOverlay.classList.remove('active');
    overlayTopImg.classList.add('hidden');
    overlaySideImg.classList.add('hidden');
    origTopImg.classList.remove('hidden');
    origSideImg.classList.remove('hidden');
  });

  // Radar Chart Initializer
  function renderRadarChart(chartData) {
    const ctx = document.getElementById('idliRadarChart').getContext('2d');
    if (state.radarChart) {
      state.radarChart.destroy();
    }

    state.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Measured Idli',
            data: chartData.current,
            backgroundColor: 'rgba(245, 158, 11, 0.25)',
            borderColor: '#f59e0b',
            borderWidth: 2.5,
            pointBackgroundColor: '#fbbf24',
            pointBorderColor: '#fff',
            pointHoverRadius: 6
          },
          {
            label: 'IdliQ Target (100)',
            data: chartData.ideal,
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 }
            },
            ticks: {
              display: false,
              min: 0,
              max: 100,
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#cbd5e1',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 }
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 7. Sections 8.3 & Phase 10: The Idli Coach (Gemini AI)
  // -------------------------------------------------------------
  const coachRoast = document.getElementById('coachRoast');
  const coachExplanation = document.getElementById('coachExplanation');
  const coachAdviceList = document.getElementById('coachAdviceList');
  const trajCurrentScore = document.getElementById('trajCurrentScore');
  const trajTargetScore = document.getElementById('trajTargetScore');
  const coachEngineMode = document.getElementById('coachEngineMode');
  const consultCoachBtn = document.getElementById('consultCoachBtn');
  const btnAnalyzeAnother = document.getElementById('btnAnalyzeAnother');

  if (consultCoachBtn) {
    consultCoachBtn.addEventListener('click', () => switchTab('tab-coach'));
  }

  if (btnAnalyzeAnother) {
    btnAnalyzeAnother.addEventListener('click', () => {
      clearFile('top');
      clearFile('side');
      switchTab('tab-analyzer');
    });
  }

  async function requestCoachFeedback(question = null) {
    if (!state.analysisResult) return;

    coachRoast.textContent = "Consulting Head Coach Subramanian...";
    coachExplanation.textContent = "Analyzing structural contour deviations and leavening physics...";

    try {
      const res = await fetch('/api/coach/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoringData: state.analysisResult.scores,
          question
        })
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to receive coaching response.');

      const { coach } = payload;
      coachRoast.textContent = `"${coach.roast}"`;
      coachExplanation.textContent = coach.explanation;
      
      coachAdviceList.innerHTML = '';
      (coach.actionableAdvice || []).forEach(item => {
        coachAdviceList.innerHTML += `<li>${item}</li>`;
      });

      trajCurrentScore.textContent = coach.currentScore || state.analysisResult.scores.overallScore;
      trajTargetScore.textContent = coach.targetScore || Math.min(100, (coach.currentScore || 80) + 12);
      
      coachEngineMode.textContent = coach.mode === 'gemini-live' 
        ? "Engine: Gemini 2.0 Live" 
        : "Engine: Deterministic Expert Mode";
    } catch (e) {
      coachRoast.textContent = "A solid attempt! Keep the flame constant.";
      coachExplanation.textContent = e.message;
    }
  }

  function syncCoachWithScores(scores) {
    trajCurrentScore.textContent = scores.overallScore;
    trajTargetScore.textContent = Math.min(100, scores.overallScore + 12);
    requestCoachFeedback();
  }

  // Quick Question buttons
  document.querySelectorAll('.q-btn[data-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-q');
      requestCoachFeedback(question);
    });
  });

  document.getElementById('btnMakeBetter').addEventListener('click', () => {
    requestCoachFeedback("What are my top three prioritized recipe and technique improvements?");
  });

  // -------------------------------------------------------------
  // 8. Section 8.2: Comparison Mode Modal
  // -------------------------------------------------------------
  const comparisonModal = document.getElementById('comparisonModal');
  const compareModeBtn = document.getElementById('compareModeBtn');
  const closeComparisonBtn = document.getElementById('closeComparisonBtn');
  const compScoreA = document.getElementById('compScoreA');
  const compDiaA = document.getElementById('compDiaA');
  const compThickA = document.getElementById('compThickA');
  const compRoundA = document.getElementById('compRoundA');
  const compPoresA = document.getElementById('compPoresA');
  const verdictText = document.getElementById('verdictText');

  if (compareModeBtn) {
    compareModeBtn.addEventListener('click', () => {
      if (!state.analysisResult) return;
      const { scores } = state.analysisResult;
      compScoreA.textContent = scores.overallScore;
      compDiaA.textContent = `${scores.metrics.diameter.valueCm} cm`;
      compThickA.textContent = `${scores.metrics.thickness.valueCm} cm`;
      compRoundA.textContent = `${scores.metrics.roundness.score}%`;
      compPoresA.textContent = scores.metrics.holeCount.count;

      if (scores.overallScore >= 90) {
        verdictText.textContent = "Your Idli achieved Master status! Within 5% tolerance of the theoretical IdliQ benchmark.";
      } else {
        verdictText.textContent = `Your Idli scored ${scores.overallScore}/100 vs 100 Benchmark. Key delta lies in ${scores.detectedIssues[0]?.title || 'profile rise and pore uniformity'}.`;
      }
      comparisonModal.classList.remove('hidden');
    });
  }

  if (closeComparisonBtn) {
    closeComparisonBtn.addEventListener('click', () => {
      comparisonModal.classList.add('hidden');
    });
  }
});
