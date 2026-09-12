<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# Idli Vision


## Basic Details
### Team Name: Simplex


### Team Members
- Team Lead: Joel Antony - Toc H Institute of Science and Technology
- Member 2: Kaliraj - Toc H Institute of Science and Technology

### Project Description
Idli Vision is a analyzer that checks the roundness, thickness, diameter, number of pores/deformity, symmetry and egde integrity of the idli that the user uploads. It then passes that information to idli coach who then gives tips on how to improve the idli

### The Problem (that doesn't exist)
[What ridiculous problem are you solving?]

### The Solution (that nobody asked for)
[How are you solving it? Keep it fun!]

## Technical Details
### Technologies/Components Used
For Software:
- [Languages used]
- [Frameworks used]
- [Libraries used]
- [Tools used]

For Hardware:
- [List main components]
- [List specifications]
- [List tools required]

### Implementation
For Software:
# Installation
[commands]

# Run
[commands]

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*

For Hardware:

# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Known Limitations
- **Pore & Cavity Detection Sensitivity & Parameter Tuning**: Surface aeration pore identification combines Morphological Black-Hat depression filtering with local adaptive Gaussian thresholding, followed by non-maximum suppression (NMS) distance deduplication:
  - **Tuned Parameter Baseline**:
    - `k_bh`: `(15, 15)` elliptical structuring element for depression isolation.
    - `min_contrast_floor`: `8` (prevents low-contrast flat crumb grain noise from triggering).
    - `adaptive_c_val`: `-5` (ensures detected depressions meaningfully contrast with surrounding dome curvature).
    - `area range`: `4` to `220` pixels (filters single-pixel noise and macroscopic tears).
    - `circularity`: $\ge 0.22$ (admits natural micro-cavities while rejecting linear scratches).
    - `NMS suppression distance`: $\min\_dist = 10\text{ px}$ (suppresses nested or overlapping concentric circle detections across scales).
  - **Lighting & Micro-Shadow Dependence**: Detection relies on natural or oblique side lighting that creates micro-shadows within pores. Under direct overhead flash or extreme front-lighting, surface micro-shadows are washed out, resulting in fewer detected pores. Conversely, high-contrast directional raking light may accentuate shallower surface grain.
  - **Batter Texture & Fermentation Variance**: Coarse or un-milled batter (e.g. rava idli, rustic stone-ground batter) exhibits higher surface grain density than smooth, highly-fermented rice/urad batter, affecting relative pore counts.
- **Monocular 2D Calibration**: Diameter, thickness, roundness, and symmetry calibrations assume the camera is positioned reasonably perpendicular to the food plane without extreme optical fish-eye perspective distortion.


## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)


