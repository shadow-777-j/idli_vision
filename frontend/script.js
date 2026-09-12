/**
 * script.js
 * Comprehensive Frontend Logic for Idli Vision.
 * Implements Sections 6.1 (Lore), 7.2 (Dual-View Upload), 7.5 (Overlays),
 * 8.1 (Report & Radar), 8.2 (Comparison Mode), and 8.3/Phase 10 (Idli Coach).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  // Application State
  const state = {
    topFile: null,
    sideFile: null,
    topDataUrl: null,
    sideDataUrl: null,
    isProcessing: false,
    analysisResult: null,
    radarChart: null
  };

  // -------------------------------------------------------------
  // 0. Site-Load Intro Video Overlay
  // -------------------------------------------------------------
  const introOverlay = document.getElementById('introVideoOverlay');
  const introVideo = document.getElementById('introVideo');
  const introSkipBtn = document.getElementById('introSkipBtn');

  function dismissIntroVideo() {
    if (!introOverlay || introOverlay.classList.contains('dismissed')) return;
    introOverlay.classList.add('dismissed');
    if (introVideo) {
      introVideo.pause();
    }
    document.body.style.overflow = '';
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 500);
  }

  if (introOverlay && introVideo) {
    document.body.style.overflow = 'hidden';

    // Auto-play muted on load to satisfy browser policy
    introVideo.muted = true;
    const playPromise = introVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log('Intro video autoplay prevented by browser:', e.message);
      });
    }

    // Auto-dismiss on video natural finish
    introVideo.addEventListener('ended', dismissIntroVideo);

    // Dismiss on Skip button click
    if (introSkipBtn) {
      introSkipBtn.addEventListener('click', dismissIntroVideo);
    }
  }

  // -------------------------------------------------------------
  // 0.5 Theme Toggle & Character Shower Transition (Banana Leaf Night)
  // -------------------------------------------------------------
  const themeSwitchBtn = document.getElementById('themeSwitchBtn');
  const THEME_STORAGE_KEY = 'idli_vision_theme';
  let isThemeTransitioning = false;

  const characterImages = [
    '/ui_elements/blush.png',
    '/ui_elements/smile.png',
    '/ui_elements/angry.png'
  ];

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeSwitchBtn) {
        themeSwitchBtn.setAttribute('aria-checked', 'true');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeSwitchBtn) {
        themeSwitchBtn.setAttribute('aria-checked', 'false');
      }
    }
  }

  // Initialize theme from persistence immediately on load
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  function triggerCharacterShower(targetTheme) {
    if (isThemeTransitioning) return;
    isThemeTransitioning = true;

    // Create full-screen shower overlay
    const overlay = document.createElement('div');
    overlay.className = 'character-shower-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // Generate 28 randomized characters
    const count = 28;
    for (let i = 0; i < count; i++) {
      const char = document.createElement('img');
      const randomSrc = characterImages[Math.floor(Math.random() * characterImages.length)];
      char.src = randomSrc;
      char.alt = '';
      char.className = 'shower-char';

      const leftPercent = (Math.random() * 92 + 3).toFixed(1);
      const sizePx = Math.floor(Math.random() * 32 + 40); // 40px to 72px
      const durationMs = Math.floor(Math.random() * 250 + 720); // 720ms to 970ms
      const delayMs = Math.floor(Math.random() * 220); // 0ms to 220ms
      const rotStart = Math.floor(Math.random() * 36 - 18); // -18deg to +18deg
      const rotEnd = rotStart + Math.floor(Math.random() * 28 - 14);

      char.style.left = `${leftPercent}%`;
      char.style.setProperty('--char-size', `${sizePx}px`);
      char.style.setProperty('--rot-start', `${rotStart}deg`);
      char.style.setProperty('--rot-end', `${rotEnd}deg`);
      char.style.animationDuration = `${durationMs}ms`;
      char.style.animationDelay = `${delayMs}ms`;

      overlay.appendChild(char);
    }

    document.body.appendChild(overlay);

    // Swap theme at midway (~380ms) while shower is in full flight
    setTimeout(() => {
      applyTheme(targetTheme);
      setStoredTheme(targetTheme);
    }, 380);

    // Clean up overlay after all characters have passed the screen
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      isThemeTransitioning = false;
    }, 1150);
  }

  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      triggerCharacterShower(targetTheme);
    });
  }

  // -------------------------------------------------------------
  // 1. Navigation Flow Handlers
  // -------------------------------------------------------------
  const headerNavLinks = document.querySelectorAll('.header-nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(targetTabId) {
    headerNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === targetTabId);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });

    // Pause all path videos when leaving Origin & Science tab
    if (targetTabId !== 'tab-story') {
      document.querySelectorAll('.path-video').forEach(vid => vid.pause());
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  headerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      switchTab(link.getAttribute('data-tab'));
    });
  });

  const btnHeaderGetStarted = document.getElementById('btnHeaderGetStarted');
  if (btnHeaderGetStarted) {
    btnHeaderGetStarted.addEventListener('click', () => switchTab('tab-analyzer'));
  }

  const heroBtnGetStarted = document.getElementById('heroBtnGetStarted');
  if (heroBtnGetStarted) {
    heroBtnGetStarted.addEventListener('click', () => switchTab('tab-analyzer'));
  }

  const heroBtnAnalyzeLink = document.getElementById('heroBtnAnalyzeLink');
  if (heroBtnAnalyzeLink) {
    heroBtnAnalyzeLink.addEventListener('click', () => switchTab('tab-analyzer'));
  }

  const heroBtnExploreStory = document.getElementById('heroBtnExploreStory');
  if (heroBtnExploreStory) {
    heroBtnExploreStory.addEventListener('click', () => {
      const target = document.getElementById('storyLoreSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Section 6.1: Origin Story Path Exploration & Video Playback
  // -------------------------------------------------------------
  const pathButtons = document.querySelectorAll('.path-btn');
  const pathContents = document.querySelectorAll('.path-content');
  const pathDisplay = document.getElementById('pathDisplay');

  // Helper function to get currently active path video
  function getActivePathVideo() {
    const activeContent = document.querySelector('.path-content.active');
    return activeContent ? activeContent.querySelector('.path-video') : null;
  }

  // Ensure all path videos start paused until scrolled into view
  document.querySelectorAll('.path-video').forEach(vid => {
    vid.pause();
  });

  // Scroll-triggered playback: plays active video when section enters viewport
  if (pathDisplay && 'IntersectionObserver' in window) {
    const videoSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const activeVid = getActivePathVideo();
        if (!activeVid) return;

        if (entry.isIntersecting) {
          // Section in viewport: start/resume playback of active video
          const playPromise = activeVid.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.log('Path video autoplay deferred:', e.message);
            });
          }
        } else {
          // Section out of viewport: pause playback
          activeVid.pause();
        }
      });
    }, {
      threshold: 0.2 // Trigger when at least 20% of the video section is visible
    });

    videoSectionObserver.observe(pathDisplay);
  }

  pathButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pathButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      pathContents.forEach(c => c.classList.remove('active'));

      // Pause all other path videos and reset playback position
      document.querySelectorAll('.path-video').forEach(vid => {
        vid.pause();
        vid.currentTime = 0;
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('data-path');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.add('active');

        // Play the newly selected path video
        const activeVideo = targetEl.querySelector('.path-video');
        if (activeVideo) {
          activeVideo.currentTime = 0;
          const playPromise = activeVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.log('Path video autoplay prevented:', e.message);
            });
          }
        }
      }
    });
  });


  // -------------------------------------------------------------
  // 3. Sequential Cooking Mini-Game (Spec Item 7)
  // -------------------------------------------------------------
  const cookCardUrad = document.getElementById('cookCardUrad');
  const cookCardRice = document.getElementById('cookCardRice');
  const cookCardWaterSalt = document.getElementById('cookCardWaterSalt');

  const statusIconUrad = document.getElementById('statusIconUrad');
  const statusIconRice = document.getElementById('statusIconRice');
  const statusIconWaterSalt = document.getElementById('statusIconWaterSalt');

  const bowlTrack = document.getElementById('bowlTrack');
  const mixingBowl = document.getElementById('mixingBowl');
  const itemDal = document.getElementById('itemDal');
  const itemRice = document.getElementById('itemRice');
  const itemWater = document.getElementById('itemWater');

  const particleEmitter = document.getElementById('particleEmitter');
  const smokeCloud = document.getElementById('smokeCloud');
  const idliReveal = document.getElementById('idliReveal');
  const btnCook = document.getElementById('btnCook');
  const btnResetCooking = document.getElementById('btnResetCooking');
  const ctaStartAnalysis = document.getElementById('ctaStartAnalysis');

  const cookState = {
    currentStep: 1, // 1: Urad, 2: Rice, 3: Water/Salt, 4: Cook Ready, 5: Revealed
    isAnimating: false
  };

  function triggerFallingParticles(stepNumber, emojis) {
    if (!particleEmitter) return;
    particleEmitter.innerHTML = '';
    const colCenters = { 1: 16.66, 2: 50, 3: 83.33 };
    const centerPercent = colCenters[stepNumber] || 50;

    emojis.forEach((emoji, idx) => {
      const p = document.createElement('span');
      p.className = 'particle-drop';
      p.textContent = emoji;
      const xOffset = (idx - (emojis.length - 1) / 2) * 26;
      p.style.left = `calc(${centerPercent}% + ${xOffset}px)`;
      p.style.top = '10px';
      p.style.animationDelay = `${idx * 120}ms`;
      particleEmitter.appendChild(p);
    });

    setTimeout(() => {
      particleEmitter.innerHTML = '';
    }, 800);
  }

  // Step 1: Add Urad Dal
  if (cookCardUrad) {
    cookCardUrad.addEventListener('click', () => {
      if (cookState.currentStep !== 1 || cookState.isAnimating) return;
      cookState.isAnimating = true;

      triggerFallingParticles(1, ['🫘', '✨', '🫘']);

      setTimeout(() => {
        if (itemDal) itemDal.classList.remove('hidden');

        // Mark Urad completed
        cookCardUrad.classList.remove('active');
        cookCardUrad.classList.add('completed');
        cookCardUrad.disabled = true;
        cookCardUrad.setAttribute('aria-label', 'Step 1: Urad Dal (Added to Bowl)');
        if (statusIconUrad) statusIconUrad.textContent = '✅ Added';
        const prompt1 = cookCardUrad.querySelector('.cook-prompt');
        if (prompt1) prompt1.textContent = '✓ Added to Bowl';

        // Slide bowl to Step 2
        if (mixingBowl) mixingBowl.className = 'mixing-bowl pos-step-2';

        setTimeout(() => {
          // Unlock Rice
          cookState.currentStep = 2;
          cookCardRice.classList.remove('locked');
          cookCardRice.classList.add('active');
          cookCardRice.disabled = false;
          cookCardRice.setAttribute('aria-label', 'Step 2: Add Parboiled Rice');
          if (statusIconRice) statusIconRice.textContent = '⏳ Active';
          const prompt2 = cookCardRice.querySelector('.cook-prompt');
          if (prompt2) prompt2.textContent = 'Click to Add ↓';
          cookState.isAnimating = false;
        }, 650);
      }, 550);
    });
  }

  // Step 2: Add Parboiled Rice
  if (cookCardRice) {
    cookCardRice.addEventListener('click', () => {
      if (cookState.currentStep !== 2 || cookState.isAnimating) return;
      cookState.isAnimating = true;

      triggerFallingParticles(2, ['🌾', '🍚', '🌾']);

      setTimeout(() => {
        if (itemRice) itemRice.classList.remove('hidden');

        // Mark Rice completed
        cookCardRice.classList.remove('active');
        cookCardRice.classList.add('completed');
        cookCardRice.disabled = true;
        cookCardRice.setAttribute('aria-label', 'Step 2: Parboiled Rice (Added to Bowl)');
        if (statusIconRice) statusIconRice.textContent = '✅ Added';
        const prompt2 = cookCardRice.querySelector('.cook-prompt');
        if (prompt2) prompt2.textContent = '✓ Added to Bowl';

        // Slide bowl to Step 3
        if (mixingBowl) mixingBowl.className = 'mixing-bowl pos-step-3';

        setTimeout(() => {
          // Unlock Water & Salt
          cookState.currentStep = 3;
          cookCardWaterSalt.classList.remove('locked');
          cookCardWaterSalt.classList.add('active');
          cookCardWaterSalt.disabled = false;
          cookCardWaterSalt.setAttribute('aria-label', 'Step 3: Add Water and Salt');
          if (statusIconWaterSalt) statusIconWaterSalt.textContent = '⏳ Active';
          const prompt3 = cookCardWaterSalt.querySelector('.cook-prompt');
          if (prompt3) prompt3.textContent = 'Click to Add ↓';
          cookState.isAnimating = false;
        }, 650);
      }, 550);
    });
  }

  // Step 3: Add Water and Salt
  if (cookCardWaterSalt) {
    cookCardWaterSalt.addEventListener('click', () => {
      if (cookState.currentStep !== 3 || cookState.isAnimating) return;
      cookState.isAnimating = true;

      triggerFallingParticles(3, ['💧', '🧂', '🫧']);

      setTimeout(() => {
        if (itemWater) itemWater.classList.remove('hidden');

        // Mark Water & Salt completed
        cookCardWaterSalt.classList.remove('active');
        cookCardWaterSalt.classList.add('completed');
        cookCardWaterSalt.disabled = true;
        cookCardWaterSalt.setAttribute('aria-label', 'Step 3: Water and Salt (Added to Bowl)');
        if (statusIconWaterSalt) statusIconWaterSalt.textContent = '✅ Added';
        const prompt3 = cookCardWaterSalt.querySelector('.cook-prompt');
        if (prompt3) prompt3.textContent = '✓ Added to Bowl';

        // Ingredient sequence complete -> reveal Cook button
        cookState.currentStep = 4;
        if (btnCook) {
          btnCook.classList.remove('hidden');
          btnCook.focus();
        }
        cookState.isAnimating = false;
      }, 550);
    });
  }

  // Cook Action
  if (btnCook) {
    btnCook.addEventListener('click', () => {
      if (cookState.currentStep !== 4 || cookState.isAnimating) return;
      cookState.isAnimating = true;
      btnCook.disabled = true;

      // 1. Bowl visibly shakes
      if (mixingBowl) mixingBowl.classList.add('shaking');

      // 2. Smoke / steam cloud transition
      setTimeout(() => {
        if (smokeCloud) smokeCloud.classList.remove('hidden');
      }, 450);

      // 3. Reveal finished idli as smoke rolls
      setTimeout(() => {
        if (mixingBowl) mixingBowl.classList.remove('shaking');
        if (bowlTrack) bowlTrack.style.display = 'none';
        btnCook.classList.add('hidden');
        if (idliReveal) idliReveal.classList.remove('hidden');
      }, 850);

      // 4. Clear smoke & show Reset button
      setTimeout(() => {
        if (smokeCloud) smokeCloud.classList.add('hidden');
        if (btnResetCooking) {
          btnResetCooking.classList.remove('hidden');
          btnResetCooking.focus();
        }
        cookState.currentStep = 5;
        cookState.isAnimating = false;
      }, 1250);
    });
  }

  // Reset Kitchen Action
  if (btnResetCooking) {
    btnResetCooking.addEventListener('click', () => {
      cookState.currentStep = 1;
      cookState.isAnimating = false;

      // Hide reveal and controls
      if (idliReveal) idliReveal.classList.add('hidden');
      if (smokeCloud) smokeCloud.classList.add('hidden');
      btnResetCooking.classList.add('hidden');
      if (btnCook) {
        btnCook.classList.add('hidden');
        btnCook.disabled = false;
      }

      // Restore bowl
      if (bowlTrack) bowlTrack.style.display = '';
      if (mixingBowl) mixingBowl.className = 'mixing-bowl pos-step-1';
      if (itemDal) itemDal.classList.add('hidden');
      if (itemRice) itemRice.classList.add('hidden');
      if (itemWater) itemWater.classList.add('hidden');

      // Reset Card 1 (Urad Dal)
      if (cookCardUrad) {
        cookCardUrad.className = 'cook-card active';
        cookCardUrad.disabled = false;
        cookCardUrad.setAttribute('aria-label', 'Step 1: Add Urad Dal');
        if (statusIconUrad) statusIconUrad.textContent = '⏳ Active';
        const prompt1 = cookCardUrad.querySelector('.cook-prompt');
        if (prompt1) prompt1.textContent = 'Click to Add ↓';
      }

      // Reset Card 2 (Parboiled Rice)
      if (cookCardRice) {
        cookCardRice.className = 'cook-card locked';
        cookCardRice.disabled = true;
        cookCardRice.setAttribute('aria-label', 'Step 2: Add Parboiled Rice (Locked)');
        if (statusIconRice) statusIconRice.textContent = '🔒 Locked';
        const prompt2 = cookCardRice.querySelector('.cook-prompt');
        if (prompt2) prompt2.textContent = 'Locked';
      }

      // Reset Card 3 (Water & Salt)
      if (cookCardWaterSalt) {
        cookCardWaterSalt.className = 'cook-card locked';
        cookCardWaterSalt.disabled = true;
        cookCardWaterSalt.setAttribute('aria-label', 'Step 3: Add Water and Salt (Locked)');
        if (statusIconWaterSalt) statusIconWaterSalt.textContent = '🔒 Locked';
        const prompt3 = cookCardWaterSalt.querySelector('.cook-prompt');
        if (prompt3) prompt3.textContent = 'Locked';
      }
    });
  }

  // CTA to Analyzer
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
  const reportEmptyState = document.getElementById('reportEmptyState');
  const scoreHeroCard = document.getElementById('scoreHeroCard');
  const analyticsRow = document.getElementById('analyticsRow');
  const issuesCard = document.getElementById('issuesCard');
  const btnReportGoToAnalyzer = document.getElementById('btnReportGoToAnalyzer');

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

  function updateQualityReportDisplay() {
    const hasRealData = Boolean(state.analysisResult);
    if (reportEmptyState) {
      reportEmptyState.style.display = hasRealData ? 'none' : 'flex';
    }
    if (scoreHeroCard) {
      scoreHeroCard.style.display = hasRealData ? 'flex' : 'none';
    }
    if (analyticsRow) {
      analyticsRow.style.display = hasRealData ? 'grid' : 'none';
    }
    if (issuesCard) {
      issuesCard.style.display = hasRealData ? 'block' : 'none';
    }
  }

  // Initialize Quality Report display (defaults to empty/pending state)
  updateQualityReportDisplay();

  if (btnReportGoToAnalyzer) {
    btnReportGoToAnalyzer.addEventListener('click', () => {
      switchTab('tab-analyzer');
    });
  }

  function renderQualityReport(data) {
    updateQualityReportDisplay();
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

  // -------------------------------------------------------------
  // 9. Freeform Idli Chatbot (Grok API Integration)
  // -------------------------------------------------------------
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatTyping = document.getElementById('chatTyping');
  const chatEngineStatus = document.getElementById('chatEngineStatus');
  const chatSuggestions = document.getElementById('chatSuggestions');

  const chatSessionHistory = [];

  function formatTimeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatCoachReply(text) {
    if (!text) return '';
    // Split into paragraphs by double newlines or single newlines
    const rawParagraphs = text.split(/\n\s*\n/);
    return rawParagraphs.map(p => {
      const clean = escapeHtml(p.trim());
      // Convert markdown-style bullet points
      if (clean.includes('\n- ') || clean.includes('\n* ') || clean.startsWith('- ') || clean.startsWith('* ')) {
        const lines = clean.split('\n');
        let html = '';
        let inList = false;
        lines.forEach(l => {
          const trimmed = l.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) { html += '<ul style="margin: 0.5rem 0 0.5rem 1.25rem;">'; inList = true; }
            html += `<li>${trimmed.substring(2)}</li>`;
          } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `${trimmed}<br/>`;
          }
        });
        if (inList) html += '</ul>';
        return `<p>${html}</p>`;
      }
      return `<p>${clean.replace(/\n/g, '<br/>')}</p>`;
    }).join('');
  }

  function appendChatMessage(role, text, isError = false) {
    if (!chatMessages) return;

    const msgEl = document.createElement('div');
    const timeStr = formatTimeNow();

    if (role === 'user') {
      msgEl.className = 'chat-msg user';
      msgEl.innerHTML = `
        <div class="msg-avatar" aria-hidden="true">👤</div>
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-author">You</span>
          </div>
          <div class="msg-bubble">
            <p>${escapeHtml(text)}</p>
          </div>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    } else if (isError) {
      msgEl.className = 'chat-msg coach error-msg';
      msgEl.innerHTML = `
        <div class="msg-avatar" aria-hidden="true">⚠️</div>
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-author">Coach Subramanian Notice</span>
            <span class="msg-tag" style="background: rgba(244, 63, 94, 0.2); color: #fda4af;">Service Alert</span>
          </div>
          <div class="msg-bubble">
            <div class="error-title">
              <span>⚠️ Could Not Reach Coach Subramanian</span>
            </div>
            <div class="error-detail">
              ${escapeHtml(text)}
            </div>
          </div>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    } else {
      msgEl.className = 'chat-msg coach';
      msgEl.innerHTML = `
        <div class="msg-avatar" aria-hidden="true">👨‍🍳</div>
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-author">Head Coach Subramanian</span>
            <span class="msg-tag">Batter Master</span>
          </div>
          <div class="msg-bubble">
            ${formatCoachReply(text)}
          </div>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    }

    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function checkGrokStatus() {
    try {
      const res = await fetch('/api/chat/status');
      if (!res.ok) return;
      const data = await res.json();
      if (chatEngineStatus) {
        if (data.grokConfigured) {
          chatEngineStatus.innerHTML = '<span class="engine-dot" style="background: #10b981; box-shadow: 0 0 8px #10b981;"></span> Grok AI Active';
          chatEngineStatus.style.color = '#10b981';
          chatEngineStatus.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        } else {
          chatEngineStatus.innerHTML = '<span class="engine-dot" style="background: #f59e0b; box-shadow: 0 0 8px #f59e0b;"></span> Grok Key Unset';
          chatEngineStatus.style.color = '#f59e0b';
          chatEngineStatus.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          chatEngineStatus.title = 'Add GROK_API_KEY to your .env file to enable live AI responses.';
        }
      }
    } catch (_) {
      // Ignore background check failure
    }
  }

  async function sendFreeformChatMessage(userText) {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();

    // 1. Append User Message
    appendChatMessage('user', cleanText);
    chatSessionHistory.push({ role: 'user', content: cleanText });

    // 2. UI Loading State
    if (chatInput) {
      chatInput.value = '';
      chatInput.disabled = true;
    }
    if (chatSendBtn) {
      chatSendBtn.disabled = true;
      chatSendBtn.querySelector('.btn-text').textContent = 'Sending...';
    }
    if (chatTyping) {
      chatTyping.classList.remove('hidden');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: chatSessionHistory.slice(-8),
          scoringData: state.analysisResult?.scores || null
        })
      });

      const payload = await res.json().catch(() => ({}));

      if (chatTyping) chatTyping.classList.add('hidden');

      if (!res.ok || !payload.success) {
        const errMessage = payload.error || `Server responded with status ${res.status}`;
        appendChatMessage('coach', errMessage, true);
      } else {
        appendChatMessage('coach', payload.reply);
        chatSessionHistory.push({ role: 'assistant', content: payload.reply });
      }
    } catch (err) {
      if (chatTyping) chatTyping.classList.add('hidden');
      appendChatMessage(
        'coach',
        `Network connection failed: ${err.message}. Please check that the server is running.`,
        true
      );
    } finally {
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
      if (chatSendBtn) {
        chatSendBtn.disabled = false;
        chatSendBtn.querySelector('.btn-text').textContent = 'Send';
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInput) {
        sendFreeformChatMessage(chatInput.value);
      }
    });
  }

  // Quick suggestion chips
  document.querySelectorAll('.chat-chip[data-prompt]').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        sendFreeformChatMessage(prompt);
      }
    });
  });

  // Check initial Grok config status
  checkGrokStatus();
});

