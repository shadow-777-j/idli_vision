# Idli Vision 🥟

> Computer Vision Quality Analysis & AI Coaching for South Indian Steamed Idlis.

Idli Vision is a full-stack web application designed to evaluate the physical quality of steamed idlis using deterministic OpenCV computer vision analysis, an explainable scoring engine, and an AI coaching conversational layer powered by Google Gemini.

---

## System Architecture

```
Frontend (HTML5, Vanilla CSS, JavaScript)
        │
        ▼
Backend (Node.js, Express, Multer)
        │
        ▼
Computer Vision (Python, OpenCV, NumPy)
        │
        ▼
Scoring Engine (scoringService.js)
        │
        ▼
Gemini AI Layer (geminiService.js & Idli Coach)
```

---

## Phase 1 Status: Foundation

Phase 1 establishes the core structural foundation:
- Clean modular repository structure.
- Node.js / Express backend server (`backend/server.js`) on port 3000.
- Decoupled services architecture (`visionService.js`, `scoringService.js`, `geminiService.js`).
- Dual-perspective upload user interface (`frontend/index.html`, `style.css`, `script.js`) explaining the necessity of both Top-View and Side-View photographs.
- Python OpenCV entry point stub (`vision/analyzer.py`, `vision/requirements.txt`).
- Standardized `.gitignore`, `.env.example`, and health monitoring endpoints.

---

## System Requirements

- **Node.js**: v18.0+ (Tested on v24.16.0)
- **Python**: 3.10+ (Tested on Python 3.13.1)
- **Git**: Installed and initialized

---

## Installation & Setup

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration variables:
- `PORT=3000`
- `PYTHON_PATH=python`
- `GEMINI_API_KEY=` *(Needed for Phase 9/10)*

### 3. Python Environment Setup
Install the vision pipeline dependencies:
```bash
pip install -r vision/requirements.txt
```

---

## Running Locally

To start the backend server:
```bash
npm start
```

Open your browser to:
- **Application UI**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Development Phases

1. [x] **Phase 1: Foundation** — Project scaffolding, Express server, dual-perspective upload UI, service abstractions.
2. [ ] **Phase 2: Upload Pipeline** — End-to-end multipart form data transmission to Python child process.
3. [ ] **Phase 3: Measurement Mat** — Reference mat calibration and pixel-to-cm transformation.
4. [ ] **Phase 4: Idli Detection** — Contour extraction and background segmentation.
5. [ ] **Phase 5: Planar Metrics** — Diameter, roundness, symmetry, and deformity calculation.
6. [ ] **Phase 6: Side-View Thickness** — Vertical rise and mold leavening metrics.
7. [ ] **Phase 7: Hole Detection** — Aeration pore identification and spatial distribution analysis.
8. [ ] **Phase 8: Scoring & Visualizations** — Quality report, categories, and radar charts.
9. [ ] **Phase 9: Gemini Integration** — Backend-only Gemini AI client abstraction.
10. [ ] **Phase 10: Idli Coach** — Measurement-grounded humor, roast, and customized improvement plan.
11. [ ] **Phase 11: Experience & Polish** — Lore explorer, timeline, ingredient dialogue, and fermentation mini-game.
