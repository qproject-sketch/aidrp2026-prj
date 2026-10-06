/**
 * AI & Digital Readiness Partnership 2026 — "The Quantum Leap"
 * Student Project Showcase Application
 * School of Electronics and Info-Comm Technology, ITE College West
 */

(function () {
  'use strict';

  // Application State
  const state = {
    projects: [],
    filteredProjects: [],
    activeCategory: 'All',
    searchQuery: '',
    currentProjectId: null,
    savedScrollPosition: 0,
    lightboxPhotos: [],
    lightboxIndex: 0,
  };

  // DOM Elements Cache
  const elements = {
    heroProjectCount: document.getElementById('hero-project-count'),
    categoryChipsContainer: document.getElementById('category-chips-container'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    resultsCount: document.getElementById('results-count'),
    featuredSection: document.getElementById('featured-section'),
    featuredGrid: document.getElementById('featured-grid'),
    allProjectsGrid: document.getElementById('all-projects-grid'),
    emptyState: document.getElementById('empty-state'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    
    // Modal Elements
    projectModal: document.getElementById('project-modal'),
    modalDialog: document.getElementById('modal-dialog'),
    modalBackBtn: document.getElementById('modal-back-btn'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalScrollBody: document.getElementById('modal-scroll-body'),
    
    // Lightbox Elements
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxCounter: document.getElementById('lightbox-counter'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
  };

  // 5 Canonical Categories
  const CATEGORIES = [
    'All',
    'Social Impact',
    'Automation / AIoT / Robotics / Digital Systems',
    'Sustainability',
    'Digital Trust',
    'AI & Data',
  ];

  /**
   * Helper: Escape HTML to avoid XSS
   */
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper: Get CSS category tag class
   */
  function getCategoryClass(cat) {
    if (!cat) return 'tag-social';
    const lower = cat.toLowerCase();
    if (lower.includes('social')) return 'tag-social';
    if (lower.includes('automation') || lower.includes('robotics')) return 'tag-automation';
    if (lower.includes('sustain')) return 'tag-sustainability';
    if (lower.includes('trust')) return 'tag-trust';
    if (lower.includes('ai') || lower.includes('data')) return 'tag-aidata';
    return 'tag-social';
  }

  /**
   * Helper: Normalize search text
   */
  function normalizeText(text) {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .replace(/[\-\_\–\—\(\)\/\,\.\:\;\'\"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Initialize Application
   */
  async function init() {
    setupEventListeners();
    await loadProjectData();
    handleUrlRouting();
  }

  /**
   * Load JSON Data
   */
  async function loadProjectData() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      state.projects = data;
      state.filteredProjects = [...data];

      renderHeroStats();
      renderCategoryChips();
      applyFiltersAndRender();
    } catch (err) {
      console.error('Failed to load project data:', err);
      showDataLoadError();
    }
  }

  /**
   * Show Error State if JSON fails
   */
  function showDataLoadError() {
    if (elements.allProjectsGrid) {
      elements.allProjectsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="empty-state-title">Unable to load project showcase</h3>
          <p class="empty-state-desc">We are unable to load the projects right now. Please check your connection and refresh the page.</p>
          <button class="reset-filters-btn" onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      `;
    }
  }

  /**
   * Render Hero Statistics
   */
  function renderHeroStats() {
    if (elements.heroProjectCount) {
      elements.heroProjectCount.textContent = `${state.projects.length} Innovations`;
    }
  }

  /**
   * Render Category Chips with Live Counts
   */
  function renderCategoryChips() {
    if (!elements.categoryChipsContainer) return;

    // Calculate count per category
    const counts = { All: state.projects.length };
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = state.projects.filter((p) => p.category === cat).length;
    });

    elements.categoryChipsContainer.innerHTML = CATEGORIES.map((cat) => {
      const isActive = state.activeCategory === cat;
      const count = counts[cat] || 0;
      return `
        <button 
          type="button" 
          class="filter-chip ${isActive ? 'active' : ''}" 
          data-category="${escapeHTML(cat)}"
          aria-pressed="${isActive}"
        >
          <span>${escapeHTML(cat)}</span>
          <span class="chip-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Apply Search and Category Filters
   */
  function applyFiltersAndRender() {
    const query = normalizeText(state.searchQuery);
    const category = state.activeCategory;

    state.filteredProjects = state.projects.filter((project) => {
      // Category check
      if (category !== 'All' && project.category !== category) {
        return false;
      }

      // Search query check
      if (!query) return true;

      const display = project.display || {};
      const howItWorksText = (display.howItWorks || []).map((h) => `${h.title} ${h.description}`).join(' ');
      const innovationPointsText = (display.innovationPoints || []).map((i) => `${i.title} ${i.description}`).join(' ');
      const impactPointsText = (display.impactPoints || []).map((im) => `${im.title} ${im.description}`).join(' ');

      const searchableFields = [
        project.title,
        project.shortTitle,
        project.synopsis,
        project.shortSynopsis,
        project.innovation,
        project.benefit,
        display.tagline,
        display.problem,
        display.solution,
        howItWorksText,
        innovationPointsText,
        impactPointsText,
        display.highlightMetric,
        project.course,
        project.partner,
        project.category,
        ...(project.students || []),
        ...(project.lecturers || []),
        ...(project.keywords || []),
        ...(display.technologyTags || []),
      ];

      const fullSearchCorpus = normalizeText(searchableFields.filter(Boolean).join(' '));
      
      // Multi-word search matching (every word in query must be found)
      const queryWords = query.split(' ').filter(Boolean);
      return queryWords.every((word) => fullSearchCorpus.includes(word));
    });

    renderProjectCatalogue();
    renderResultsCounter();
  }

  /**
   * Render Results Counter
   */
  function renderResultsCounter() {
    if (!elements.resultsCount) return;

    const count = state.filteredProjects.length;
    let text = `${count} project${count === 1 ? '' : 's'}`;

    if (state.activeCategory !== 'All') {
      text += ` in ${state.activeCategory}`;
    }
    if (state.searchQuery) {
      text += ` for "${state.searchQuery}"`;
    }

    elements.resultsCount.textContent = text;
  }

  /**
   * Render Main Project Catalogue and Featured Section
   */
  function renderProjectCatalogue() {
    const hasQueryOrFilter = state.activeCategory !== 'All' || state.searchQuery.trim() !== '';

    // Render Featured Projects Section (only show when browsing All or when featured matches filter)
    const featuredProjects = state.filteredProjects.filter((p) => p.featured);
    if (elements.featuredSection && elements.featuredGrid) {
      if (featuredProjects.length > 0 && !hasQueryOrFilter) {
        elements.featuredSection.style.display = 'block';
        elements.featuredGrid.innerHTML = featuredProjects.map(renderProjectCard).join('');
      } else {
        elements.featuredSection.style.display = 'none';
      }
    }

    // Render All Projects Grid
    if (elements.allProjectsGrid) {
      if (state.filteredProjects.length > 0) {
        elements.allProjectsGrid.style.display = 'grid';
        if (elements.emptyState) elements.emptyState.style.display = 'none';
        elements.allProjectsGrid.innerHTML = state.filteredProjects.map(renderProjectCard).join('');
      } else {
        elements.allProjectsGrid.style.display = 'none';
        if (elements.emptyState) elements.emptyState.style.display = 'block';
      }
    }

    initScrollAnimations();
  }

  /**
   * Render a Single Project Card HTML
   */
  function renderProjectCard(project) {
    const catClass = getCategoryClass(project.category);
    const heroImg = project.heroPhoto || './assets/ui/project-placeholder.svg';
    const altText = `Project showcase for ${project.shortTitle || project.title}`;
    const display = project.display || {};
    const tagline = display.tagline || project.shortSynopsis || project.synopsis;
    const techTags = (display.technologyTags || project.keywords || []).slice(0, 3);

    return `
      <article 
        class="project-card ${project.featured ? 'featured-card' : ''}" 
        data-project-id="${escapeHTML(project.id)}"
        tabindex="0"
        role="button"
        aria-label="View project details for ${escapeHTML(project.shortTitle || project.title)}"
      >
        <div class="card-media-wrapper">
          <img 
            src="${escapeHTML(heroImg)}" 
            alt="${escapeHTML(altText)}" 
            class="card-img" 
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null; this.src='./assets/ui/project-placeholder.svg';"
          />
          <div class="card-badges-top">
            <span class="category-tag ${catClass}">
              ${escapeHTML(project.category)}
            </span>
            ${
              project.featured
                ? `<span class="featured-sparkle-badge" title="Featured Innovation">★ Featured</span>`
                : ''
            }
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-title">${escapeHTML(project.shortTitle || project.title)}</h3>
          <p class="card-synopsis">${escapeHTML(tagline)}</p>
          
          ${
            techTags.length > 0
              ? `
            <div class="card-tech-chips">
              ${techTags.map((t) => `<span class="card-tech-badge">${escapeHTML(t)}</span>`).join('')}
            </div>
          `
              : ''
          }

          <div class="card-footer-action">
            <span class="card-partner-label">${escapeHTML(project.partner ? `Partner: ${project.partner}` : project.course || '')}</span>
            <span class="card-cta-btn">
              Explore
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Open Project Modal by ID
   */
  function openProjectModal(projectId, updateHash = true) {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;

    state.currentProjectId = projectId;
    state.savedScrollPosition = window.scrollY;

    renderModalContent(project);

    if (elements.projectModal) {
      elements.projectModal.classList.add('active');
      elements.projectModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }

    if (updateHash) {
      history.pushState(null, '', `#project=${encodeURIComponent(projectId)}`);
    }

    // Scroll modal content to top
    if (elements.modalScrollBody) {
      elements.modalScrollBody.scrollTop = 0;
    }

    // Focus close button for accessibility
    setTimeout(() => {
      if (elements.modalCloseBtn) {
        elements.modalCloseBtn.focus();
      }
    }, 100);
  }

  /**
   * Close Project Modal
   */
  function closeProjectModal(updateHash = true) {
    if (!state.currentProjectId) return;

    if (elements.projectModal) {
      elements.projectModal.classList.remove('active');
      elements.projectModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    state.currentProjectId = null;

    if (updateHash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    // Restore background scroll position
    window.scrollTo({
      top: state.savedScrollPosition,
      behavior: 'instant',
    });
  }

  /**
   * Calculate Related Projects Deterministically
   */
  function getRelatedProjects(currentProject, count = 3) {
    const others = state.projects.filter((p) => p.id !== currentProject.id);

    const scored = others.map((candidate) => {
      let score = 0;
      if (candidate.category === currentProject.category) score += 5;
      if (candidate.course && currentProject.course && candidate.course === currentProject.course) score += 3;
      if (candidate.keywords && currentProject.keywords) {
        const shared = candidate.keywords.filter((kw) => currentProject.keywords.includes(kw));
        score += shared.length * 2;
      }
      return { project: candidate, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((item) => item.project);
  }

  /**
   * Render Modal Inner Content (Visual Exhibition Storytelling)
   */
  function renderModalContent(project) {
    if (!elements.modalScrollBody) return;

    const catClass = getCategoryClass(project.category);
    const relatedProjects = getRelatedProjects(project);
    const display = project.display || {};
    const galleryPhotos = project.photos || [];

    elements.modalScrollBody.innerHTML = `
      <!-- Header Block -->
      <div class="modal-header-block">
        <div class="modal-badges-row">
          <span class="category-tag ${catClass}">
            ${escapeHTML(project.category)}
          </span>
          ${
            project.course
              ? `<span class="hero-stat-badge" style="background: var(--bg-secondary); border-color: var(--border-light);">${escapeHTML(project.course)}</span>`
              : ''
          }
          ${
            display.highlightMetric
              ? `<span class="highlight-metric-badge">★ ${escapeHTML(display.highlightMetric)}</span>`
              : ''
          }
        </div>

        <h2 class="modal-title">${escapeHTML(project.title)}</h2>

        ${
          display.tagline
            ? `
          <div class="modal-tagline-callout">
            ${escapeHTML(display.tagline)}
          </div>
        `
            : ''
        }

        ${
          project.heroPhoto
            ? `
          <div class="modal-hero-image-wrap">
            <img 
              src="${escapeHTML(project.heroPhoto)}" 
              alt="Showcase photo for ${escapeHTML(project.title)}" 
              class="modal-hero-img"
              onerror="this.onerror=null; this.src='./assets/ui/project-placeholder.svg';"
            />
          </div>
        `
            : ''
        }
      </div>

      <!-- The Challenge & The Solution Cards -->
      ${
        display.problem && display.solution
          ? `
        <div class="story-cards-grid">
          <div class="story-card story-card-problem">
            <div class="story-card-header">
              <svg class="story-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h4 class="story-title">The Challenge</h4>
            </div>
            <p class="story-text">${escapeHTML(display.problem)}</p>
          </div>

          <div class="story-card story-card-solution">
            <div class="story-card-header">
              <svg class="story-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <h4 class="story-title">The Solution</h4>
            </div>
            <p class="story-text">${escapeHTML(display.solution)}</p>
          </div>
        </div>
      `
          : ''
      }

      <!-- How It Works (Step Flow) -->
      ${
        display.howItWorks && display.howItWorks.length > 0
          ? `
        <div class="content-section">
          <h4 class="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            How It Works
          </h4>
          <div class="how-it-works-grid">
            ${display.howItWorks
              .map(
                (step, idx) => `
              <div class="step-card">
                <span class="step-pill">${idx + 1}</span>
                <div class="step-title">${escapeHTML(step.title)}</div>
                <div class="step-desc">${escapeHTML(step.description)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- What Makes It Different (Key Innovations) -->
      ${
        display.innovationPoints && display.innovationPoints.length > 0
          ? `
        <div class="content-section">
          <h4 class="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            What Makes It Different
          </h4>
          <div class="innovation-cards-grid">
            ${display.innovationPoints
              .map(
                (diff) => `
              <div class="diff-card">
                <div class="diff-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--quantum-teal);">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                  </svg>
                  ${escapeHTML(diff.title)}
                </div>
                <div class="diff-desc">${escapeHTML(diff.description)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- Why It Matters (Impact Outcomes) -->
      ${
        display.impactPoints && display.impactPoints.length > 0
          ? `
        <div class="content-section">
          <h4 class="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Why It Matters
          </h4>
          <div class="impact-cards-grid">
            ${display.impactPoints
              .map(
                (impact) => `
              <div class="outcome-card">
                <div class="outcome-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--quantum-purple);">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  ${escapeHTML(impact.title)}
                </div>
                <div class="outcome-desc">${escapeHTML(impact.description)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- Project Metadata Grid (Team, Mentors, Partner) -->
      <div class="modal-meta-grid">
        ${
          project.students && project.students.length > 0
            ? `
          <div class="meta-item">
            <span class="meta-label">Project Team</span>
            <div class="team-names-list">
              ${project.students
                .map(
                  (student) =>
                    `<span class="team-student-name">${escapeHTML(student)}</span>`
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          project.lecturers && project.lecturers.length > 0
            ? `
          <div class="meta-item">
            <span class="meta-label">Lecturer Mentor(s)</span>
            <div class="meta-value">
              ${project.lecturers.map((lec) => `<div>${escapeHTML(lec)}</div>`).join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          project.partner
            ? `
          <div class="meta-item">
            <span class="meta-label">Industry / Agency Partner</span>
            <div class="meta-value" style="color: var(--quantum-teal); font-weight: 700;">
              ${escapeHTML(project.partner)}
            </div>
          </div>
        `
            : ''
        }

        ${
          project.keywords && project.keywords.length > 0
            ? `
          <div class="meta-item">
            <span class="meta-label">Focus Areas &amp; Technologies</span>
            <div class="meta-value" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.2rem;">
              ${project.keywords
                .map(
                  (kw) =>
                    `<span style="font-size: 0.75rem; background: #ffffff; padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid var(--border-light);">${escapeHTML(kw)}</span>`
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Photo Gallery -->
      ${
        galleryPhotos.length > 0
          ? `
        <div class="content-section">
          <h4 class="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Project Photographs &amp; Materials
          </h4>
          <div class="gallery-grid">
            ${galleryPhotos
              .map(
                (photo, idx) => `
              <div 
                class="gallery-thumbnail-card" 
                data-gallery-idx="${idx}"
                tabindex="0"
                role="button"
                aria-label="View enlarged photo: ${escapeHTML(photo.caption)}"
              >
                <img 
                  src="${escapeHTML(photo.url)}" 
                  alt="${escapeHTML(photo.caption)}" 
                  class="gallery-thumb-img" 
                  loading="lazy"
                />
                <div class="gallery-overlay-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- Progressive Disclosure: Full Documentation Accordion -->
      <div class="full-docs-accordion" id="docs-accordion">
        <button type="button" class="accordion-toggle-btn" id="accordion-toggle" aria-expanded="false">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            View Full Original Project Documentation
          </span>
          <svg class="accordion-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div class="accordion-content">
          ${
            project.synopsis
              ? `
            <div class="content-section">
              <h5 class="section-label" style="font-size: 0.95rem;">Full Synopsis</h5>
              <div class="section-prose">
                ${project.synopsis
                  .split('\n\n')
                  .map((p) => `<p>${escapeHTML(p)}</p>`)
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          ${
            project.innovation
              ? `
            <div class="content-section">
              <h5 class="section-label" style="font-size: 0.95rem;">Key Innovation Details</h5>
              <div class="section-prose">
                ${project.innovation
                  .split('\n\n')
                  .map((p) => `<p>${escapeHTML(p)}</p>`)
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          ${
            project.benefit
              ? `
            <div class="content-section">
              <h5 class="section-label" style="font-size: 0.95rem;">Benefits &amp; Real-World Impact Breakdown</h5>
              <div class="section-prose">
                ${project.benefit
                  .split('\n\n')
                  .map((p) => `<p>${escapeHTML(p)}</p>`)
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Related Projects -->
      ${
        relatedProjects.length > 0
          ? `
        <div class="content-section" style="margin-top: 1rem;">
          <h4 class="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Related Innovations
          </h4>
          <div class="related-projects-grid">
            ${relatedProjects
              .map(
                (rel) => `
              <div 
                class="related-card" 
                data-project-id="${escapeHTML(rel.id)}"
                tabindex="0"
                role="button"
                aria-label="Switch to project: ${escapeHTML(rel.shortTitle || rel.title)}"
              >
                <span class="related-cat">${escapeHTML(rel.category)}</span>
                <span class="related-title">${escapeHTML(rel.shortTitle || rel.title)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }
    `;

    // Attach accordion toggle event
    const accordion = elements.modalScrollBody.querySelector('#docs-accordion');
    const toggleBtn = elements.modalScrollBody.querySelector('#accordion-toggle');
    if (accordion && toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = accordion.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Attach gallery click events
    state.lightboxPhotos = galleryPhotos;
    const thumbCards = elements.modalScrollBody.querySelectorAll('.gallery-thumbnail-card');
    thumbCards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-gallery-idx'), 10);
        openLightbox(idx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.getAttribute('data-gallery-idx'), 10);
          openLightbox(idx);
        }
      });
    });

    // Attach related projects click events
    const relCards = elements.modalScrollBody.querySelectorAll('.related-card');
    relCards.forEach((rc) => {
      rc.addEventListener('click', () => {
        const id = rc.getAttribute('data-project-id');
        openProjectModal(id, true);
      });
      rc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = rc.getAttribute('data-project-id');
          openProjectModal(id, true);
        }
      });
    });
  }

  /**
   * Lightbox / Fullscreen Image Viewer
   */
  function openLightbox(index) {
    if (!state.lightboxPhotos || state.lightboxPhotos.length === 0) return;
    state.lightboxIndex = (index + state.lightboxPhotos.length) % state.lightboxPhotos.length;
    renderLightbox();

    if (elements.lightboxModal) {
      elements.lightboxModal.classList.add('active');
      elements.lightboxModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeLightbox() {
    if (elements.lightboxModal) {
      elements.lightboxModal.classList.remove('active');
      elements.lightboxModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderLightbox() {
    const photo = state.lightboxPhotos[state.lightboxIndex];
    if (!photo) return;

    if (elements.lightboxImg) {
      elements.lightboxImg.src = photo.url;
      elements.lightboxImg.alt = photo.caption || 'Project demonstration';
    }
    if (elements.lightboxCaption) {
      elements.lightboxCaption.textContent = photo.caption || 'Project demonstration';
    }
    if (elements.lightboxCounter) {
      elements.lightboxCounter.textContent = `${state.lightboxIndex + 1} / ${state.lightboxPhotos.length}`;
    }
  }

  function lightboxNext() {
    openLightbox(state.lightboxIndex + 1);
  }

  function lightboxPrev() {
    openLightbox(state.lightboxIndex - 1);
  }

  /**
   * URL Routing via Hash (#project=project-id)
   */
  function handleUrlRouting() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#project=')) {
      const projectId = decodeURIComponent(hash.replace('#project=', ''));
      const projectExists = state.projects.some((p) => p.id === projectId);
      if (projectExists) {
        openProjectModal(projectId, false);
      }
    } else if (state.currentProjectId) {
      closeProjectModal(false);
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Window Hash Change (Handles Browser Back/Forward buttons)
    window.addEventListener('hashchange', () => {
      handleUrlRouting();
    });

    // Category Filter Chips
    if (elements.categoryChipsContainer) {
      elements.categoryChipsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        const selectedCat = btn.getAttribute('data-category');
        state.activeCategory = selectedCat;
        renderCategoryChips();
        applyFiltersAndRender();
      });
    }

    // Search Input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (elements.searchClearBtn) {
          elements.searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
        }
        applyFiltersAndRender();
      });
    }

    // Clear Search Button
    if (elements.searchClearBtn) {
      elements.searchClearBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (elements.searchInput) {
          elements.searchInput.value = '';
          elements.searchInput.focus();
        }
        elements.searchClearBtn.classList.remove('visible');
        applyFiltersAndRender();
      });
    }

    // Reset Filters Button (Empty State)
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.activeCategory = 'All';
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.searchClearBtn) elements.searchClearBtn.classList.remove('visible');
        renderCategoryChips();
        applyFiltersAndRender();
      });
    }

    // Main Projects Grid Click Delegation
    const handleGridCardClick = (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      const id = card.getAttribute('data-project-id');
      if (id) {
        openProjectModal(id, true);
      }
    };

    if (elements.allProjectsGrid) {
      elements.allProjectsGrid.addEventListener('click', handleGridCardClick);
      elements.allProjectsGrid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.project-card');
          if (card) {
            e.preventDefault();
            const id = card.getAttribute('data-project-id');
            if (id) openProjectModal(id, true);
          }
        }
      });
    }

    if (elements.featuredGrid) {
      elements.featuredGrid.addEventListener('click', handleGridCardClick);
      elements.featuredGrid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.project-card');
          if (card) {
            e.preventDefault();
            const id = card.getAttribute('data-project-id');
            if (id) openProjectModal(id, true);
          }
        }
      });
    }

    // Modal Close / Back Controls
    if (elements.modalBackBtn) {
      elements.modalBackBtn.addEventListener('click', () => closeProjectModal(true));
    }
    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener('click', () => closeProjectModal(true));
    }

    // Click Outside Modal Dialog to Close
    if (elements.projectModal) {
      elements.projectModal.addEventListener('click', (e) => {
        if (e.target === elements.projectModal) {
          closeProjectModal(true);
        }
      });
    }

    // Lightbox Controls
    if (elements.lightboxCloseBtn) {
      elements.lightboxCloseBtn.addEventListener('click', closeLightbox);
    }
    if (elements.lightboxNextBtn) {
      elements.lightboxNextBtn.addEventListener('click', lightboxNext);
    }
    if (elements.lightboxPrevBtn) {
      elements.lightboxPrevBtn.addEventListener('click', lightboxPrev);
    }
    if (elements.lightboxModal) {
      elements.lightboxModal.addEventListener('click', (e) => {
        if (e.target === elements.lightboxModal) {
          closeLightbox();
        }
      });
    }

    // Keyboard Shortcuts (Escape to Close, Left/Right for Lightbox)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.lightboxModal && elements.lightboxModal.classList.contains('active')) {
          closeLightbox();
        } else if (elements.projectModal && elements.projectModal.classList.contains('active')) {
          closeProjectModal(true);
        }
      } else if (elements.lightboxModal && elements.lightboxModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
      }
    });
  }

  /**
   * IntersectionObserver for Smooth Card Reveal
   */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.project-card:not(.observed)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    cards.forEach((card) => {
      card.classList.add('observed');
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1), transform 350ms cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(card);
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
