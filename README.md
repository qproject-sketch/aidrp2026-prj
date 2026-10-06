# Student Project Showcase — AI & Digital Readiness Partnership 2026

**Theme:** The Quantum Leap  
**School:** School of Electronics and Info-Comm Technology, ITE College West, Singapore  
**Platform:** Static Web Application (GitHub Pages Compatible)

---

## 🌟 About the Showcase Website

This website is a production-ready digital showcase created for the **AI & Digital Readiness Partnership 2026** event. It allows invited guests, industry partners, educators, and the public to explore student innovations across 5 key technology pillars:

1. **Social Impact**
2. **Automation / AIoT / Robotics / Digital Systems**
3. **Sustainability**
4. **Digital Trust**
5. **AI & Data**

The site is built mobile-first for quick access via QR codes during the event exhibition, and scales gracefully to tablet and desktop screens.

---

## 🚀 Key Features

- **Mobile-First & Touch-Optimized:** Designed for 360px–430px mobile screens with sticky search, smooth category chips, and one-hand tap accessibility.
- **20–30 Second Scannable Presentation:** Implements the *"Scan first. Read more only if interested"* exhibition principle. Each project features an explanatory one-line tagline, *The Challenge*, *The Solution*, visual *How It Works* steps, *What Makes It Different* innovation cards, and *Why It Matters* real-world impact outcomes.
- **Progressive Disclosure Accordion:** Casual visitors can scan the highlights in seconds, while judges, industry partners, and educators can expand the *Full Original Project Documentation* accordion to read unabridged synopses and technical write-ups.
- **Deep Linking for QR Codes:** Every project has a dedicated, permanent hash URL (e.g. `#project=senior-guard-ai`). Scanning a project's QR code opens its detail modal directly.
- **Smart Instant Search:** Forgiving, multi-field search across titles, descriptions, taglines, student names, lecturer mentors, course names, partners, and technical keywords.
- **Deterministic Recommendations:** Automatically calculates related project suggestions inside each project view based on categories, courses, and shared technology keywords.
- **Interactive Lightbox Gallery:** Tap any prototype photo, hardware diagram, or poster to view in full resolution with swipe/arrow key navigation.
- **Curated Media Assets:** Automatically synchronised with the cleaned `Project photos/` directory, containing 51 high-quality, relevant project photos and posters.
- **Strict PDPA & Student Privacy Compliance:** Complies with Singapore Personal Data Protection guidelines. Student names appear strictly in generic project team lists; no face-to-name tags, overlays, or ordered captions are used.
- **Zero Framework Bloat:** 100% vanilla HTML5, CSS3, and JavaScript with no external runtime dependencies, ensuring ultra-fast load times on mobile data networks.

---

## 📁 Project Directory Structure

```text
├── index.html                                        # Main Single-Page Application
├── README.md                                         # Project Documentation
├── css/
│   └── styles.css                                    # Custom Quantum design system & responsive layout
├── js/
│   └── app.js                                        # Application logic, search, filters, modal, routing
├── data/
│   ├── projects.json                                 # Static JSON project dataset
│   └── photo-mapping.json                            # Audit mapping of photos to projects
├── assets/
│   ├── projects/                                     # Optimized web photos organized by project ID
│   │   ├── senior-guard-ai/
│   │   ├── pulse-edge-ai-ecopulse/
│   │   └── ...
│   └── ui/
│       └── project-placeholder.svg                   # Futuristic SVG fallback image
├── scripts/
│   └── extract_projects.py                           # Python data extraction & image optimizer script
├── Project photos/                                   # Original project source photographs
└── Project Showcase - AI n Digital Readiness Partnership v3.xlsx # Source Excel dataset
```

---

## 🛠️ How to Preview Locally

Because web browsers restrict `fetch()` requests on local `file://` URLs for security reasons, run a local static server to preview the site:

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8080
```
Open your browser to: [http://localhost:8080/](http://localhost:8080/)

### Option 2: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🔄 How to Regenerate Data from Excel

To update or re-extract project details and photographs from the Excel workbook:

```bash
python scripts/extract_projects.py
```

### What the script does:
1. Reads `Project Showcase - AI n Digital Readiness Partnership v3.xlsx`.
2. Normalizes text, course titles, lecturer names, and student rosters.
3. Automatically maps and optimizes photographs from `Project photos/` into `assets/projects/<project-id>/` (converts HEIC format to JPG and extracts embedded archives).
4. Generates `data/projects.json` and `data/photo-mapping.json`.
5. Preserves existing `"featured": true/false` statuses during regeneration.

---

## 🏷️ How to Manage Featured Projects

Featured projects appear in the **"Featured Innovations"** showcase section at the top of the homepage.

To mark a project as featured, open `data/projects.json` and set `"featured": true`:

```json
{
  "id": "senior-guard-ai",
  "title": "Senior Guard AI (Edge AI for Safe Aging)",
  "featured": true
}
```

Set `"featured": false` to show it only in the main catalogue.

---

## 🔗 How QR Code Deep Links Work

Each project has a stable URL anchor based on its unique `id`:

| Project Name | Direct QR Code URL |
| :--- | :--- |
| **Kinetics Harvesting Tile (KHT)** | `https://<user>.github.io/<repo>/#project=kinetics-harvesting-tile-green-runway` |
| **Smart Recycling Machine** | `https://<user>.github.io/<repo>/#project=smart-recycling-machine` |
| **AI Beverage** | `https://<user>.github.io/<repo>/#project=ai-beverage` |
| **AI Career Companion** | `https://<user>.github.io/<repo>/#project=ai-career-companion` |
| **Pulse Edge AI with EcoPulse Insight** | `https://<user>.github.io/<repo>/#project=pulse-edge-ai-ecopulse` |
| **ITE Chow (HawkerHub)** | `https://<user>.github.io/<repo>/#project=ite-chow-hawkerhub` |
| **Automated Invoice Processor** | `https://<user>.github.io/<repo>/#project=automated-invoice-processor` |
| **Smart AI Operations Agent** | `https://<user>.github.io/<repo>/#project=smart-ai-operations-agent` |
| **Roadside Warning Robot** | `https://<user>.github.io/<repo>/#project=roadside-warning-robot` |
| **LipReading AI** | `https://<user>.github.io/<repo>/#project=lipreading-ai` |
| **NEA RAG Sustainability Intel** | `https://<user>.github.io/<repo>/#project=nea-rag-sustainability-intel` |
| **Senior Guard AI** | `https://<user>.github.io/<repo>/#project=senior-guard-ai` |
| **Virtual Garden XR** | `https://<user>.github.io/<repo>/#project=virtual-garden-xr` |
| **EcoScan Smart Recycling** | `https://<user>.github.io/<repo>/#project=ecoscan-smart-recycling` |
| **IncluTeach Autism Support** | `https://<user>.github.io/<repo>/#project=incluteach-autism-support` |
| **LearnLoot AI Study Companion** | `https://<user>.github.io/<repo>/#project=learnloot-study-companion` |

---

## 🚢 Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In your repository settings on GitHub, navigate to **Settings** → **Pages**.
3. Under **Branch**, select `main` (or `master`) and the `/ (root)` folder.
4. Click **Save**.
5. Your showcase website will be published at: `https://<your-username>.github.io/<repository-name>/`.
