/**
 * Scholarship & Fee Waiver Finder - Master Engine & SaaS Application Controller
 */

// Global Application State
const state = {
  currentView: 'home',
  scholarships: JSON.parse(localStorage.getItem('scholarships')) || MOCK_SCHOLARSHIPS,
  feeWaivers: MOCK_FEE_WAIVERS,
  studentProfile: JSON.parse(localStorage.getItem('studentProfile')) || DEFAULT_STUDENT_PROFILE,
  applications: JSON.parse(localStorage.getItem('applications')) || INITIAL_APPLICATIONS,
  documents: JSON.parse(localStorage.getItem('documents')) || REQUIRED_DOCUMENTS_MASTER,
  notifications: SAMPLE_NOTIFICATIONS,
  bookmarkedIds: JSON.parse(localStorage.getItem('bookmarkedIds')) || ['sch-001', 'sch-003'],
  comparisonIds: [],
  reports: [],
  filters: {
    searchKeyword: '',
    educationLevel: 'All',
    state: 'All',
    category: 'All',
    providerType: 'All',
    gender: 'All',
    maxIncome: 1500000,
    sortOption: 'relevant'
  },
  theme: localStorage.getItem('theme') || 'light',
  heroStep: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
  renderCurrentView();
  updateNotificationBadge();
  startHeroVisualizerAnimation();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  showToast(`Switched to ${state.theme.toUpperCase()} theme 🌙`);
}

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper for Deadline Status Display
function getDeadlineStatusHtml(deadlineStr) {
  if (!deadlineStr || deadlineStr === "-" || deadlineStr === "") {
    return `<span style="color:var(--text-muted); font-weight:600;">⚪ Deadline information unavailable</span>`;
  }
  const diffDays = Math.ceil((new Date(deadlineStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return `<span style="color:var(--brand-red); font-weight:700;">🔴 Deadline passed</span>`;
  } else if (diffDays <= 30) {
    return `<span style="color:var(--brand-amber); font-weight:700;">🟠 Deadline in ${diffDays} days</span>`;
  } else {
    return `<span style="color:var(--brand-green); font-weight:700;">🟢 Open / Upcoming (${diffDays} days left)</span>`;
  }
}

// Helper for Source Badge Display
function getSourceBadgeHtml(s) {
  if (s.sourceType === "Official" || s.dataStatus === "Verified") {
    return `<span class="badge-real-data">🟢 OFFICIAL / VERIFIED</span>`;
  } else if (s.sourceType === "Provider") {
    return `<span class="badge-sample-data" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">🟡 PROVIDER DATA</span>`;
  } else {
    return `<span class="badge-sample-data">⚪ INFORMATION NEEDS VERIFICATION</span>`;
  }
}

// ==========================================================================
// 1. DYNAMIC WEIGHTED MATCH ENGINE
// ==========================================================================
function calculateMatchScore(scholarship, profile) {
  let score = 0;
  const whyPoints = [];
  const missingPoints = [];
  const breakdownDetails = [];

  // Criterion 1: State / Domicile (20 Points)
  if (!scholarship.states || scholarship.states.length === 0 || scholarship.states.includes('All India') || scholarship.states.includes(profile.domicileState)) {
    score += 20;
    whyPoints.push(`${profile.domicileState} State Domicile Verified`);
    breakdownDetails.push({ name: 'State / Domicile', student: profile.domicileState, req: scholarship.states ? scholarship.states.join(', ') : 'All India', matched: true });
  } else {
    missingPoints.push(`Restricted to ${scholarship.states.join(', ')} residents`);
    breakdownDetails.push({ name: 'State / Domicile', student: profile.domicileState, req: scholarship.states.join(', '), matched: false });
  }

  // Criterion 2: Education Level (20 Points)
  if (!scholarship.educationLevel || scholarship.educationLevel.length === 0 || scholarship.educationLevel.includes('All') || scholarship.educationLevel.includes(profile.educationLevel)) {
    score += 20;
    whyPoints.push(`Matches your ${profile.educationLevel} education level`);
    breakdownDetails.push({ name: 'Education Level', student: profile.educationLevel, req: scholarship.educationLevel ? scholarship.educationLevel.join('/') : 'All', matched: true });
  } else {
    missingPoints.push(`Requires ${scholarship.educationLevel.join('/')} level`);
    breakdownDetails.push({ name: 'Education Level', student: profile.educationLevel, req: scholarship.educationLevel.join('/'), matched: false });
  }

  // Criterion 3: Course / Stream (15 Points)
  if (!scholarship.courses || scholarship.courses.length === 0 || scholarship.courses.includes('All') || scholarship.courses.some(c => profile.course.includes(c) || c.includes(profile.course) || c === 'All')) {
    score += 15;
    whyPoints.push(`Enrolled in eligible course (${profile.course})`);
    breakdownDetails.push({ name: 'Course / Stream', student: profile.course, req: scholarship.courses ? scholarship.courses.join(', ') : 'All', matched: true });
  } else {
    missingPoints.push(`Targeted for ${scholarship.courses.join(', ')} streams`);
    breakdownDetails.push({ name: 'Course / Stream', student: profile.course, req: scholarship.courses.join(', '), matched: false });
  }

  // Criterion 4: Family Income Limit (20 Points)
  if (!scholarship.maxIncome || scholarship.maxIncome === 0 || profile.familyIncome <= scholarship.maxIncome) {
    score += 20;
    const limitText = scholarship.maxIncome ? `≤ ₹${(scholarship.maxIncome/100000).toFixed(1)}L` : 'No Limit Specified';
    whyPoints.push(`Family Income (₹${(profile.familyIncome/100000).toFixed(1)}L) within limit (${limitText})`);
    breakdownDetails.push({ name: 'Family Income', student: `₹${(profile.familyIncome/100000).toFixed(1)}L`, req: limitText, matched: true });
  } else {
    missingPoints.push(`Income exceeds limit (Max: ₹${(scholarship.maxIncome/100000).toFixed(1)} Lakhs)`);
    breakdownDetails.push({ name: 'Family Income', student: `₹${(profile.familyIncome/100000).toFixed(1)}L`, req: `≤ ₹${(scholarship.maxIncome/100000).toFixed(1)}L`, matched: false });
  }

  // Criterion 5: Category Reservation (10 Points)
  if (!scholarship.category || scholarship.category.length === 0 || scholarship.category.includes('All') || scholarship.category.includes(profile.category)) {
    score += 10;
    whyPoints.push(`Eligible under ${profile.category} category reservation`);
    breakdownDetails.push({ name: 'Category', student: profile.category, req: scholarship.category ? scholarship.category.join('/') : 'All', matched: true });
  } else {
    missingPoints.push(`Reserved for ${scholarship.category.join('/')} categories`);
    breakdownDetails.push({ name: 'Category', student: profile.category, req: scholarship.category.join('/'), matched: false });
  }

  // Criterion 6: Academic Percentage / Marks (10 Points)
  const requiredScore = scholarship.minPercentage || 0;
  if (requiredScore === 0 || profile.percentage >= requiredScore) {
    score += 10;
    const reqText = requiredScore > 0 ? `≥ ${requiredScore}%` : 'No Min Threshold';
    whyPoints.push(`Academic score (${profile.percentage}%) satisfies requirement (${reqText})`);
    breakdownDetails.push({ name: 'Academic Marks', student: `${profile.percentage}%`, req: reqText, matched: true });
  } else {
    missingPoints.push(`Requires minimum ${requiredScore}% academic score`);
    breakdownDetails.push({ name: 'Academic Marks', student: `${profile.percentage}%`, req: `≥ ${requiredScore}%`, matched: false });
  }

  // Criterion 7: Gender Eligibility (5 Points)
  if (!scholarship.gender || scholarship.gender === 'All' || scholarship.gender === profile.gender) {
    score += 5;
    whyPoints.push(`Meets gender criterion (${profile.gender})`);
    breakdownDetails.push({ name: 'Gender Requirement', student: profile.gender, req: scholarship.gender || 'All', matched: true });
  } else {
    missingPoints.push(`Exclusive for ${scholarship.gender} candidates`);
    breakdownDetails.push({ name: 'Gender Requirement', student: profile.gender, req: scholarship.gender, matched: false });
  }

  // Document Readiness Warning Check
  const incomeDoc = state.documents.find(d => d.name.toLowerCase().includes("income"));
  if (incomeDoc && incomeDoc.status !== "Uploaded" && scholarship.maxIncome > 0) {
    missingPoints.push("⚠ Income Certificate renewal required for claim submission");
  }

  let matchLabel = "Low Match";
  let matchColorClass = "match-badge-low";
  if (score >= 95) {
    matchLabel = "Excellent Match";
    matchColorClass = "match-badge-excellent";
  } else if (score >= 80) {
    matchLabel = "Strong Match";
    matchColorClass = "match-badge-strong";
  } else if (score >= 60) {
    matchLabel = "Possible Match";
    matchColorClass = "match-badge-possible";
  }

  const matchedCount = breakdownDetails.filter(b => b.matched).length;

  return {
    score,
    matchLabel,
    matchColorClass,
    whyPoints,
    missingPoints,
    breakdownDetails,
    matchedCount,
    totalCriteria: breakdownDetails.length,
    reqDocs: scholarship.requiredDocuments || []
  };
}

// Reverse Connection: Find which matched scholarships require a specific document
function getScholarshipsRequiringDocument(docName) {
  const matched = state.scholarships.filter(s => calculateMatchScore(s, state.studentProfile).score >= 60);
  return matched.filter(s => {
    if (!s.requiredDocuments) return false;
    return s.requiredDocuments.some(d => d.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(d.toLowerCase()));
  });
}

// Calculate Dynamic Readiness Rating Breakdown
function getReadinessBreakdown() {
  const profileFields = ['name', 'age', 'gender', 'state', 'educationLevel', 'course', 'percentage', 'familyIncome', 'category'];
  const filledFields = profileFields.filter(f => state.studentProfile[f] !== undefined && state.studentProfile[f] !== "");
  const profilePct = Math.round((filledFields.length / profileFields.length) * 100);

  const uploadedDocs = state.documents.filter(d => d.status === 'Uploaded').length;
  const docsPct = Math.round((uploadedDocs / state.documents.length) * 100);

  const matched = state.scholarships.filter(s => calculateMatchScore(s, state.studentProfile).score >= 80);
  const eligibilityPct = matched.length > 0 ? 100 : 60;

  const overallReadiness = Math.round((profilePct * 0.4) + (docsPct * 0.4) + (eligibilityPct * 0.2));

  return { profilePct, docsPct, eligibilityPct, overallReadiness };
}

// Calculate Financial Aid Summary
function getPotentialFinancialSupport() {
  const matched = state.scholarships.filter(s => calculateMatchScore(s, state.studentProfile).score >= 80);
  const scholarshipSum = matched.filter(s => s.type === 'scholarship').reduce((acc, s) => acc + (s.amount || 0), 0);
  const waiverSum = matched.filter(s => s.type === 'fee_waiver').reduce((acc, s) => acc + (s.amount || 0), 0);
  const collegeAssistance = 20000;
  return {
    scholarshipSum,
    waiverSum,
    collegeAssistance,
    total: scholarshipSum + waiverSum + collegeAssistance
  };
}

// Filter Engine
function getFilteredScholarships() {
  const f = state.filters;
  let results = state.scholarships.filter(s => {
    if (f.searchKeyword) {
      const q = f.searchKeyword.toLowerCase();
      const matchText = (s.title + ' ' + s.provider + ' ' + (s.courses ? s.courses.join(' ') : '') + ' ' + (s.states ? s.states.join(' ') : '') + ' ' + (s.category ? s.category.join(' ') : '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (f.educationLevel !== 'All' && s.educationLevel && !s.educationLevel.includes('All') && !s.educationLevel.includes(f.educationLevel)) return false;
    if (f.state !== 'All' && s.states && !s.states.includes('All India') && !s.states.includes(f.state)) return false;
    if (f.category !== 'All' && s.category && !s.category.includes('All') && !s.category.includes(f.category)) return false;
    if (f.providerType !== 'All' && s.providerType !== f.providerType) return false;
    if (f.gender !== 'All' && s.gender && s.gender !== 'All' && s.gender !== f.gender) return false;
    if (s.maxIncome > 0 && f.maxIncome < s.maxIncome) return false;
    return true;
  });

  if (f.sortOption === 'relevant') {
    results.sort((a, b) => calculateMatchScore(b, state.studentProfile).score - calculateMatchScore(a, state.studentProfile).score);
  } else if (f.sortOption === 'deadline') {
    results.sort((a, b) => new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31'));
  } else if (f.sortOption === 'amount_high') {
    results.sort((a, b) => (b.amount || 0) - (a.amount || 0));
  } else if (f.sortOption === 'newest') {
    results.sort((a, b) => b.id.localeCompare(a.id));
  }

  return results;
}

// Navigation Controller
function switchView(viewName) {
  state.currentView = viewName;
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(el => {
    if (el.dataset.view === viewName) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

function renderCurrentView() {
  const container = document.getElementById('view-container');
  if (!container) return;

  switch (state.currentView) {
    case 'home': container.innerHTML = renderHomePage(); break;
    case 'checker': container.innerHTML = renderEligibilityCheckerPage(); bindCheckerEvents(); break;
    case 'finder': container.innerHTML = renderScholarshipFinderPage(); break;
    case 'waivers': container.innerHTML = renderFeeWaiversPage(); break;
    case 'ai-matches': container.innerHTML = renderAiMatchesPage(); break;
    case 'dashboard': container.innerHTML = renderDashboardPage(); break;
    case 'documents': container.innerHTML = renderDocumentsPage(); break;
    case 'admin': container.innerHTML = renderAdminDashboardPage(); break;
    case 'about': container.innerHTML = renderAboutPage(); break;
    case 'contact': container.innerHTML = renderContactPage(); break;
    default: container.innerHTML = renderHomePage();
  }
}

// Hero Demo Visualizer Animation Loop
function startHeroVisualizerAnimation() {
  setInterval(() => {
    state.heroStep = (state.heroStep + 1) % 4;
    const stepLabel = document.getElementById('hero-step-label');
    const stepTitle = document.getElementById('hero-step-title');
    const stepPreview = document.getElementById('hero-step-preview');
    if (stepLabel && stepTitle && stepPreview) {
      const steps = [
        { label: "Step 1/4: Student Profile Scanned", title: "Aarav Sharma • B.Tech CSE • EWS • Income ₹2.5L", preview: "✓ Maharashtra Domicile verified<br/>✓ CAP Admission Allotment verified" },
        { label: "Step 2/4: Checking Real Scheme Criteria", title: "Comparing Against Official Schemes", preview: "🟢 Validating Income threshold <= ₹8 Lakhs<br/>🟢 Caste & Domicile documents checked" },
        { label: "Step 3/4: Weighted Match Engine", title: "Applying 7-Point Weighted Scoring", preview: "🎯 State: 20/20 | Income: 20/20 | Course: 15/15<br/>🎯 Marks: 10/10 | Category: 10/10" },
        { label: "Step 4/4: Match Score Generated!", title: "Rajarshi Shahu Maharaj Fee Waiver", preview: "<span style='color:#10b981; font-weight:800; font-size:1.1rem;'>🎯 95% Excellent Match</span><br/>💰 Benefit: 100% Tuition Fee Concession" }
      ];
      const cur = steps[state.heroStep];
      stepLabel.innerHTML = cur.label;
      stepTitle.innerHTML = cur.title;
      stepPreview.innerHTML = cur.preview;
    }
  }, 3000);
}

// ==========================================================================
// 2. PAGE TEMPLATES & UI RENDERERS
// ==========================================================================

// 1. Home Page
function renderHomePage() {
  const topMatches = state.scholarships.slice(0, 3);
  
  return `
    <section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div>
            <div class="hero-badge">
              <span>⚡ One Profile → Multiple Financial Aid Matches</span>
            </div>
            <h1 class="hero-title">Find the Financial Support You Deserve</h1>
            <p class="hero-subtitle">
              Discover verified scholarships and tuition fee waivers matched specifically to your education, category, income, and academic profile.
            </p>
            <div class="hero-actions">
              <button class="btn btn-accent btn-lg" onclick="switchView('finder')">
                🔍 Find My Scholarships
              </button>
              <button class="btn btn-secondary btn-lg" style="background:rgba(255,255,255,0.15); color:white; border-color:rgba(255,255,255,0.3);" onclick="switchView('checker')">
                ⚡ Check Eligibility
              </button>
            </div>
            
            <div style="background:var(--bg-surface); border-radius:var(--radius-lg); padding:0.5rem; display:flex; gap:0.5rem; align-items:center;">
              <input type="text" id="hero-search-input" class="form-input" style="border:none; background:transparent;" placeholder="Search real schemes by course, state, category (e.g. Engineering, Maharashtra, SC)..." />
              <button class="btn btn-primary" onclick="handleHeroSearch()">Search</button>
            </div>
          </div>

          <div>
            <div class="hero-visualizer">
              <div class="visualizer-step-bar">
                <span id="hero-step-label">Step 1/4: Student Profile Scanned</span>
                <span class="badge-real-data">🟢 OFFICIAL / VERIFIED DATA</span>
              </div>
              
              <div class="demo-card-preview active-highlight">
                <h3 id="hero-step-title" style="font-size:1.1rem; color:white; margin-bottom:0.5rem;">Aarav Sharma • B.Tech CSE • EWS</h3>
                <p id="hero-step-preview" style="font-size:0.9rem; color:rgba(255,255,255,0.85); line-height:1.5;">
                  ✓ Maharashtra Domicile verified<br/>✓ CAP Admission Allotment verified
                </p>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:rgba(255,255,255,0.6);">
                <span>Matching Engine: Weighted 100-Point Rule</span>
                <span>Active Dataset Schemes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <section class="stats-bar">
      <div class="container">
        <div style="text-align:center; margin-bottom:1rem;">
          <span class="freshness-pill">🟢 Calculated from current active dataset (${state.scholarships.length} Verified Real Schemes)</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${state.scholarships.length}</div>
            <div class="stat-label">Real Schemes in Dataset</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${state.scholarships.filter(s=>s.providerType==='Government').length}</div>
            <div class="stat-label">Government Schemes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${state.scholarships.filter(s=>s.providerType==='Private').length}</div>
            <div class="stat-label">Corporate CSR Grants</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${state.scholarships.filter(s=>s.type==='fee_waiver').length}</div>
            <div class="stat-label">Tuition Fee Waivers</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Core Value Proposition</span>
          <h2 class="section-title">One Profile → Multiple Scholarship Matches</h2>
          <p class="section-desc">Enter your information once. Our matching engine compares your profile with scholarship and fee-waiver eligibility rules and identifies relevant opportunities.</p>
        </div>

        <div class="flow-grid">
          <div class="flow-card">
            <div class="flow-step-num">1</div>
            <div class="flow-icon">📝</div>
            <div class="flow-title">Create Profile</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Enter academic & income details</div>
          </div>

          <div class="flow-card">
            <div class="flow-step-num">2</div>
            <div class="flow-icon">⚡</div>
            <div class="flow-title">Check Eligibility</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Automated rule evaluation</div>
          </div>

          <div class="flow-card">
            <div class="flow-step-num">3</div>
            <div class="flow-icon">🤖</div>
            <div class="flow-title">Smart Matching</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Weighted score calculation</div>
          </div>

          <div class="flow-card">
            <div class="flow-step-num">4</div>
            <div class="flow-icon">🎯</div>
            <div class="flow-title">Recommendations</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">View ranked matches</div>
          </div>

          <div class="flow-card">
            <div class="flow-step-num">5</div>
            <div class="flow-icon">🚀</div>
            <div class="flow-title">Apply</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Direct official portal links</div>
          </div>

          <div class="flow-card">
            <div class="flow-step-num">6</div>
            <div class="flow-icon">⏰</div>
            <div class="flow-title">Track Deadline</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Urgency alerts & status</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-surface);">
      <div class="container">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 class="section-title" style="text-align:left; margin:0;">Top Matched Schemes</h2>
            <p style="color:var(--text-secondary); font-size:0.95rem;">Calculated for profile: ${state.studentProfile.name}</p>
          </div>
          <button class="btn btn-secondary" onclick="switchView('finder')">View All Schemes (${state.scholarships.length}) →</button>
        </div>

        <div class="scholarships-grid">
          ${topMatches.map(s => renderScholarshipCardHtml(s)).join('')}
        </div>
      </div>
    </section>
  `;
}

// Render Individual Scholarship Card
function renderScholarshipCardHtml(s) {
  const matchInfo = calculateMatchScore(s, state.studentProfile);
  const isBookmarked = state.bookmarkedIds.includes(s.id);
  const isCompared = state.comparisonIds.includes(s.id);
  const sourceBadgeHtml = getSourceBadgeHtml(s);
  const deadlineStatusHtml = getDeadlineStatusHtml(s.deadline);

  return `
    <div class="scholarship-card">
      <div>
        <div class="card-header-flex">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <span class="provider-tag">${s.providerType || 'Government'} • ${s.type === 'fee_waiver' ? 'Fee Waiver' : 'Scholarship'}</span>
            ${sourceBadgeHtml}
          </div>
          <button class="btn-icon" style="width:2rem; height:2rem; font-size:1rem;" onclick="toggleBookmark('${s.id}')" title="Bookmark">
            ${isBookmarked ? '⭐' : '☆'}
          </button>
        </div>

        <h3 class="card-title">${s.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem;">Provider: ${s.provider || 'Information unavailable'}</p>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
          <span class="match-badge ${matchInfo.matchColorClass}">🎯 Match: ${matchInfo.score}% (${matchInfo.matchLabel})</span>
          <span style="font-size:0.85rem; font-weight:800; color:var(--brand-blue-light);">${s.amountDisplay || (s.amount ? `₹${s.amount.toLocaleString()}` : 'Information unavailable')}</span>
        </div>

        <div class="tags-row">
          <span class="tag-pill">🎓 ${s.educationLevel ? s.educationLevel.join('/') : 'All'}</span>
          <span class="tag-pill">📍 ${s.states ? s.states.join(', ') : 'All India'}</span>
          <span class="tag-pill">🏷️ ${s.category ? s.category.join('/') : 'All'}</span>
          ${s.isMaharashtraScheme ? `<span class="tag-pill" style="background:#fef3c7; color:#92400e;">MH CAP Scheme</span>` : ''}
          ${s.isNspScheme ? `<span class="tag-pill" style="background:#e0f2fe; color:#0369a1;">NSP Scheme</span>` : ''}
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${s.eligibilitySummary || s.description || 'Information unavailable'}
        </p>
      </div>

      <div>
        <div class="card-footer-flex">
          <div class="deadline-text">${deadlineStatusHtml}</div>
          <div style="display:flex; align-items:center; gap:0.35rem;">
            <label style="font-size:0.75rem; color:var(--text-secondary); cursor:pointer;">
              <input type="checkbox" ${isCompared ? 'checked' : ''} onchange="toggleCompare('${s.id}')" /> Compare
            </label>
            <button class="btn btn-secondary btn-sm" onclick="openScholarshipDetails('${s.id}')">View Details</button>
            ${s.officialSourceUrl || s.applicationUrl ?
              `<button class="btn btn-primary btn-sm" onclick="window.open('${s.applicationUrl || s.officialSourceUrl}', '_blank'); updateAppStatus('${s.id}', 'Applied');">Official Application ↗</button>` :
              `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.6;">Link Unavailable</button>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

// 2. Eligibility Checker Page
function renderEligibilityCheckerPage() {
  const p = state.studentProfile;

  return `
    <section class="section">
      <div class="container" style="max-width:900px;">
        <div class="section-header">
          <span class="section-tag">Profile Engine</span>
          <h2 class="section-title">Student Profile & Eligibility Checker</h2>
          <p class="section-desc">Enter your personal, academic, admission, and socio-economic details to run our weighted match engine.</p>
        </div>

        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2rem;">
          <form id="checker-form" onsubmit="handleCheckerSubmit(event)">
            
            <h3 style="font-size:1.15rem; margin-bottom:1rem; color:var(--brand-blue-light); border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              👤 Personal Information
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="filter-label">Full Name</label>
                <input type="text" id="p-name" class="form-input" value="${p.name}" required />
              </div>
              <div>
                <label class="filter-label">Age</label>
                <input type="number" id="p-age" class="form-input" value="${p.age}" required />
              </div>
              <div>
                <label class="filter-label">Gender</label>
                <select id="p-gender" class="form-select">
                  <option value="Boys" ${p.gender==='Boys'?'selected':''}>Boy / Male</option>
                  <option value="Girls" ${p.gender==='Girls'?'selected':''}>Girl / Female</option>
                  <option value="Other" ${p.gender==='Other'?'selected':''}>Other</option>
                </select>
              </div>
              <div>
                <label class="filter-label">State of Domicile</label>
                <select id="p-state" class="form-select">
                  <option value="Maharashtra" ${p.state==='Maharashtra'?'selected':''}>Maharashtra</option>
                  <option value="Karnataka" ${p.state==='Karnataka'?'selected':''}>Karnataka</option>
                  <option value="Delhi" ${p.state==='Delhi'?'selected':''}>Delhi</option>
                  <option value="Tamil Nadu" ${p.state==='Tamil Nadu'?'selected':''}>Tamil Nadu</option>
                  <option value="Uttar Pradesh" ${p.state==='Uttar Pradesh'?'selected':''}>Uttar Pradesh</option>
                  <option value="All India" ${p.state==='All India'?'selected':''}>Other State</option>
                </select>
              </div>
            </div>

            <h3 style="font-size:1.15rem; margin-bottom:1rem; color:var(--brand-blue-light); border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              🎓 Academic & Admission Details
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="filter-label">Education Level</label>
                <select id="p-edlevel" class="form-select">
                  <option value="School" ${p.educationLevel==='School'?'selected':''}>School (Class 9-12)</option>
                  <option value="Diploma" ${p.educationLevel==='Diploma'?'selected':''}>Diploma / Polytechnic</option>
                  <option value="Undergraduate" ${p.educationLevel==='Undergraduate'?'selected':''}>Undergraduate (UG)</option>
                  <option value="Postgraduate" ${p.educationLevel==='Postgraduate'?'selected':''}>Postgraduate (PG)</option>
                </select>
              </div>
              <div>
                <label class="filter-label">Course / Stream</label>
                <input type="text" id="p-course" class="form-input" value="${p.course}" />
              </div>
              <div>
                <label class="filter-label">Admission Type</label>
                <select id="p-admission" class="form-select">
                  <option value="CAP Round Allotment" ${p.admissionType==='CAP Round Allotment'?'selected':''}>Centralized Admission (CAP Round)</option>
                  <option value="Direct Management Quota" ${p.admissionType==='Direct Management Quota'?'selected':''}>Management / Direct Quota</option>
                  <option value="Institute Merit" ${p.admissionType==='Institute Merit'?'selected':''}>Institutional Merit</option>
                </select>
              </div>
              <div>
                <label class="filter-label">Academic Percentage / CGPA</label>
                <input type="number" step="0.1" id="p-percentage" class="form-input" value="${p.percentage}" required />
              </div>
            </div>

            <h3 style="font-size:1.15rem; margin-bottom:1rem; color:var(--brand-blue-light); border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              💰 Socio-Economic Details
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
              <div>
                <label class="filter-label">Annual Family Income (INR ₹)</label>
                <input type="number" id="p-income" class="form-input" value="${p.familyIncome}" required />
              </div>
              <div>
                <label class="filter-label">Category</label>
                <select id="p-category" class="form-select">
                  <option value="General" ${p.category==='General'?'selected':''}>General</option>
                  <option value="OBC" ${p.category==='OBC'?'selected':''}>OBC</option>
                  <option value="SC" ${p.category==='SC'?'selected':''}>SC</option>
                  <option value="ST" ${p.category==='ST'?'selected':''}>ST</option>
                  <option value="EWS" ${p.category==='EWS'?'selected':''}>EWS</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end;">
              <button type="submit" class="btn btn-accent btn-lg">
                ⚡ Calculate Smart Matches
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function handleCheckerSubmit(e) {
  e.preventDefault();
  state.studentProfile = {
    ...state.studentProfile,
    name: document.getElementById('p-name').value,
    age: parseInt(document.getElementById('p-age').value) || 19,
    gender: document.getElementById('p-gender').value,
    state: document.getElementById('p-state').value,
    domicileState: document.getElementById('p-state').value,
    educationLevel: document.getElementById('p-edlevel').value,
    course: document.getElementById('p-course').value,
    admissionType: document.getElementById('p-admission').value,
    percentage: parseFloat(document.getElementById('p-percentage').value) || 75,
    familyIncome: parseInt(document.getElementById('p-income').value) || 250000,
    category: document.getElementById('p-category').value
  };

  localStorage.setItem('studentProfile', JSON.stringify(state.studentProfile));
  showToast('Profile updated! Matching engine recalculated.', 'success');
  switchView('ai-matches');
}

// 3. Scholarship Finder Page
function renderScholarshipFinderPage() {
  const filtered = getFilteredScholarships();

  return `
    <section class="section">
      <div class="container">
        <div style="margin-bottom:2rem;">
          <h2 class="section-title" style="text-align:left;">Find Scholarships & Fee Waivers</h2>
          <p style="color:var(--text-secondary);">Search verified schemes filtered by education, income, state, and category.</p>
        </div>

        <div class="finder-layout">
          <aside class="filter-card">
            <h3 style="font-size:1.1rem; margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between;">
              <span>⚡ Filters</span>
              <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset</button>
            </h3>

            <div class="filter-group">
              <label class="filter-label">Search Keyword</label>
              <input type="text" class="form-input" value="${state.filters.searchKeyword}" placeholder="Course, provider, state..." oninput="updateFilter('searchKeyword', this.value)" />
            </div>

            <div class="filter-group">
              <label class="filter-label">Education Level</label>
              <select class="form-select" onchange="updateFilter('educationLevel', this.value)">
                <option value="All">All Education Levels</option>
                <option value="School" ${state.filters.educationLevel==='School'?'selected':''}>School (Class 9-12)</option>
                <option value="Diploma" ${state.filters.educationLevel==='Diploma'?'selected':''}>Diploma / Polytechnic</option>
                <option value="Undergraduate" ${state.filters.educationLevel==='Undergraduate'?'selected':''}>Undergraduate (UG)</option>
                <option value="Postgraduate" ${state.filters.educationLevel==='Postgraduate'?'selected':''}>Postgraduate (PG)</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">State</label>
              <select class="form-select" onchange="updateFilter('state', this.value)">
                <option value="All">All States (Inc. All India)</option>
                <option value="Maharashtra" ${state.filters.state==='Maharashtra'?'selected':''}>Maharashtra</option>
                <option value="Karnataka" ${state.filters.state==='Karnataka'?'selected':''}>Karnataka</option>
                <option value="Delhi" ${state.filters.state==='Delhi'?'selected':''}>Delhi</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select class="form-select" onchange="updateFilter('category', this.value)">
                <option value="All">All Categories</option>
                <option value="General" ${state.filters.category==='General'?'selected':''}>General</option>
                <option value="OBC" ${state.filters.category==='OBC'?'selected':''}>OBC</option>
                <option value="SC" ${state.filters.category==='SC'?'selected':''}>SC</option>
                <option value="ST" ${state.filters.category==='ST'?'selected':''}>ST</option>
                <option value="EWS" ${state.filters.category==='EWS'?'selected':''}>EWS</option>
              </select>
            </div>
          </aside>

          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; background:var(--bg-surface); padding:1rem 1.25rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
              <div style="font-weight:600; font-size:0.95rem;">
                Showing <span style="color:var(--brand-blue-light);">${filtered.length}</span> Opportunities
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <label style="font-size:0.85rem; color:var(--text-secondary);">Sort By:</label>
                <select class="form-select" style="width:auto;" onchange="updateFilter('sortOption', this.value)">
                  <option value="relevant" ${state.filters.sortOption==='relevant'?'selected':''}>Most Relevant (Match %)</option>
                  <option value="deadline" ${state.filters.sortOption==='deadline'?'selected':''}>Deadline Soon</option>
                  <option value="amount_high" ${state.filters.sortOption==='amount_high'?'selected':''}>Highest Benefit Amount</option>
                  <option value="newest" ${state.filters.sortOption==='newest'?'selected':''}>Recently Added</option>
                </select>
              </div>
            </div>

            ${filtered.length === 0 ? `
              <div style="text-align:center; padding:4rem 1rem; background:var(--bg-surface); border-radius:var(--radius-xl); border:1px solid var(--border-color);">
                <div style="font-size:3rem; margin-bottom:1rem;">🔎</div>
                <h3>No Exact Matches Found</h3>
                <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Try expanding your state, category, or income filters.</p>
                <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
              </div>
            ` : `
              <div class="scholarships-grid">
                ${filtered.map(s => renderScholarshipCardHtml(s)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    </section>
  `;
}

function updateFilter(key, val) {
  state.filters[key] = val;
  renderCurrentView();
}

function resetFilters() {
  state.filters = { searchKeyword: '', educationLevel: 'All', state: 'All', category: 'All', providerType: 'All', gender: 'All', maxIncome: 1500000, sortOption: 'relevant' };
  renderCurrentView();
}

// 4. Fee Waiver Finder Page
function renderFeeWaiversPage() {
  const waivers = state.scholarships.filter(s => s.type === 'fee_waiver');

  return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Tuition Fee Waivers & Freeships</span>
          <h2 class="section-title">Fee Waiver Finder</h2>
          <p class="section-desc">Explore verified 100% Tuition Fee Waiver (TFW) schemes, EWS fee concessions, and government reimbursements.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; margin-bottom:3rem;">
          ${MOCK_FEE_WAIVERS.map(fw => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                  <span class="status-pill status-applied">${fw.type}</span>
                  <span class="badge-real-data">🟢 OFFICIAL / VERIFIED</span>
                </div>
                <h3 style="font-size:1.2rem; margin-bottom:0.5rem;">${fw.title}</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">Provider: ${fw.provider}</p>
                <div style="background:var(--brand-green-soft); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-md); padding:0.75rem; margin-bottom:1rem;">
                  <span style="font-size:0.75rem; color:var(--brand-green); font-weight:700;">POTENTIAL BENEFIT:</span>
                  <div style="font-weight:700; font-size:1.05rem; color:var(--brand-green);">${fw.benefit}</div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary);">${fw.description}</p>
              </div>
              <button class="btn btn-secondary btn-sm" style="margin-top:1rem;" onclick="switchView('finder')">View Related Fee Waivers →</button>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size:1.5rem; margin-bottom:1.5rem;">All Real Fee Waiver Schemes</h3>
        <div class="scholarships-grid">
          ${waivers.map(s => renderScholarshipCardHtml(s)).join('')}
        </div>
      </div>
    </section>
  `;
}

// 5. AI Recommendations Page
function renderAiMatchesPage() {
  const p = state.studentProfile;
  const scored = state.scholarships.map(s => ({
    ...s,
    matchInfo: calculateMatchScore(s, p)
  })).sort((a, b) => b.matchInfo.score - a.matchInfo.score);

  return `
    <section class="section">
      <div class="container">
        <div style="background:linear-gradient(135deg, #1e3a8a, #047857); border-radius:var(--radius-xl); padding:2.5rem; color:white; margin-bottom:2.5rem; box-shadow:var(--shadow-lg);">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.35rem 0.85rem; background:rgba(255,255,255,0.2); border-radius:var(--radius-full); font-size:0.85rem; font-weight:600; margin-bottom:0.75rem;">
            🤖 Weighted Match Engine Active
          </div>
          <h2 style="font-size:2.2rem; color:white; margin-bottom:0.5rem;">Top Scheme Match: ${scored[0].matchInfo.score}% (${scored[0].matchInfo.matchLabel})</h2>
          <p style="color:rgba(255,255,255,0.9); font-size:1rem;">
            Profile: <strong>${p.name}</strong> (${p.educationLevel}, ${p.category}, Income ₹${(p.familyIncome/100000).toFixed(1)}L, ${p.domicileState})
          </p>
        </div>

        <h3 style="font-size:1.5rem; margin-bottom:1.5rem;">Scholarship Eligibility Analysis</h3>
        <div style="display:flex; flex-direction:column; gap:2rem;">
          ${scored.map(s => {
            const m = s.matchInfo;
            const sourceBadgeHtml = getSourceBadgeHtml(s);

            return `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="provider-tag">${s.providerType || 'Government'} • ${s.type === 'fee_waiver' ? 'Fee Waiver' : 'Scholarship'}</span>
                    ${sourceBadgeHtml}
                  </div>
                  <span class="match-badge ${m.matchColorClass}">🎯 Match Score: ${m.score}% (${m.matchLabel})</span>
                </div>

                <h3 style="font-size:1.35rem; margin-bottom:0.35rem;">${s.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.25rem;">Provider: ${s.provider || 'Information unavailable'}</p>

                ${s.nspOtrNotice ? `
                  <div style="background:#e0f2fe; border:1px solid #bae6fd; color:#0369a1; padding:0.65rem 1rem; border-radius:var(--radius-md); font-size:0.85rem; font-weight:600; margin-bottom:1rem;">
                    ℹ️ ${s.nspOtrNotice}
                  </div>
                ` : ''}

                <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1rem; margin-bottom:1.25rem;">
                  <h4 style="font-size:0.95rem; margin-bottom:0.75rem; color:var(--brand-blue-light); font-weight:700;">
                    Your Eligibility Analysis (${m.matchedCount}/${m.totalCriteria} criteria satisfied)
                  </h4>
                  <div class="table-responsive">
                    <table class="custom-table" style="font-size:0.85rem;">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          <th>Your Profile</th>
                          <th>Scheme Requirement</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${m.breakdownDetails.map(b => `
                          <tr>
                            <td><strong>${b.name}</strong></td>
                            <td>${b.student}</td>
                            <td>${b.req}</td>
                            <td>
                              ${b.matched ?
                                `<span style="color:var(--brand-green); font-weight:700;">✓ Match</span>` :
                                `<span style="color:var(--brand-amber); font-weight:700;">⚠ Mismatch</span>`
                              }
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-bottom:1.25rem;">
                  <div style="background:var(--brand-green-soft); border-radius:var(--radius-md); padding:1rem;">
                    <h4 style="font-size:0.85rem; color:var(--brand-green); margin-bottom:0.5rem; font-weight:700;">✓ WHY YOU MATCH:</h4>
                    <ul style="list-style:none; font-size:0.85rem; color:var(--text-primary); display:flex; flex-direction:column; gap:0.35rem;">
                      ${m.whyPoints.map(pt => `<li>✓ ${pt}</li>`).join('')}
                    </ul>
                  </div>

                  ${m.missingPoints.length > 0 ? `
                    <div style="background:var(--brand-amber-soft); border-radius:var(--radius-md); padding:1rem;">
                      <h4 style="font-size:0.85rem; color:var(--brand-amber); margin-bottom:0.5rem; font-weight:700;">⚠ MISSING / ACTION ITEMS:</h4>
                      <ul style="list-style:none; font-size:0.85rem; color:var(--text-primary); display:flex; flex-direction:column; gap:0.35rem;">
                        ${m.missingPoints.map(pt => `<li>${pt}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>

                <div style="display:flex; align-items:center; justify-content:space-between; padding-top:1rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem;">
                  <div style="font-weight:700; color:var(--brand-blue-light); font-size:1.1rem;">
                    Benefit: ${s.amountDisplay || (s.amount ? `₹${s.amount.toLocaleString()}` : 'Information unavailable')}
                  </div>
                  <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-secondary" onclick="openScholarshipDetails('${s.id}')">View Details</button>
                    ${s.applicationUrl || s.officialSourceUrl ?
                      `<button class="btn btn-primary" onclick="window.open('${s.applicationUrl || s.officialSourceUrl}', '_blank'); updateAppStatus('${s.id}', 'Applied');">Official Application ↗</button>` :
                      `<button class="btn btn-secondary" disabled style="opacity:0.6;">Link Unavailable</button>`
                    }
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

// 6. SaaS Student Dashboard Page
function renderDashboardPage() {
  const p = state.studentProfile;
  const readiness = getReadinessBreakdown();
  const supportEst = getPotentialFinancialSupport();

  return `
    <section class="section">
      <div class="container">
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem; margin-bottom:2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 style="font-size:1.6rem; margin-bottom:0.2rem;">Good morning 👋, ${p.name}!</h2>
            <p style="color:var(--text-secondary); font-size:0.9rem;">
              ${p.educationLevel} (${p.course}) • ${p.category} Category • Income: ₹${(p.familyIncome/100000).toFixed(1)}L
            </p>
          </div>
          <button class="btn btn-secondary" onclick="switchView('checker')">Edit Student Profile</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.5rem;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
              <h3 style="font-size:1.1rem; color:var(--brand-blue-light);">💰 Your Potential Financial Support</h3>
              <span class="freshness-pill">🟢 Calculated from active dataset</span>
            </div>
            <div style="font-size:2.2rem; font-weight:800; color:var(--brand-green); margin-bottom:0.5rem;">
              ₹${supportEst.total.toLocaleString()}
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">
              Based on active matching schemes in dataset. Actual benefits depend on official approval.
            </p>
            <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.25rem;">
              <div>• Scholarships: ₹${supportEst.scholarshipSum.toLocaleString()}</div>
              <div>• Tuition Fee Waivers: ₹${supportEst.waiverSum.toLocaleString()}</div>
              <div>• Institutional Support: ₹${supportEst.collegeAssistance.toLocaleString()}</div>
            </div>
          </div>

          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.5rem;">
            <h3 style="font-size:1.1rem; color:var(--brand-blue-light); margin-bottom:0.75rem;">🚀 Application Readiness Score</h3>
            <div style="display:flex; align-items:center; justify-content:space-between; font-weight:700; margin-bottom:0.5rem;">
              <span>Overall Readiness Rating:</span>
              <span style="color:var(--brand-blue-light); font-size:1.2rem;">${readiness.overallReadiness}%</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width:${readiness.overallReadiness}%;"></div>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.75rem; display:flex; justify-content:space-between;">
              <span>Profile: ${readiness.profilePct}%</span>
              <span>Documents: ${readiness.docsPct}%</span>
              <span>Eligibility: ${readiness.eligibilityPct}%</span>
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-top:0.75rem; width:100%;" onclick="switchView('documents')">Manage Documents Checklist →</button>
          </div>
        </div>

        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem; margin-bottom:2.5rem;">
          <h3 style="font-size:1.35rem; margin-bottom:1rem;">⏰ Application & Deadline Tracker</h3>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Scholarship Name</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Application Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.applications.map(app => {
                  const sch = state.scholarships.find(s => s.id === app.scholarshipId) || state.scholarships[0];
                  const deadlineHtml = getDeadlineStatusHtml(sch.deadline);

                  return `
                    <tr>
                      <td>
                        <strong>${sch.title}</strong><br/>
                        <span style="font-size:0.8rem; color:var(--text-secondary);">${sch.provider}</span>
                      </td>
                      <td>${sch.deadline || 'Information unavailable'}</td>
                      <td>${deadlineHtml}</td>
                      <td>
                        <select class="form-select" style="width:auto; padding:0.35rem 0.65rem; font-size:0.85rem;" onchange="updateAppStatus('${app.scholarshipId}', this.value)">
                          <option value="Not Applied" ${app.status==='Not Applied'?'selected':''}>Not Applied</option>
                          <option value="Preparing" ${app.status==='Preparing'?'selected':''}>Preparing</option>
                          <option value="Applied" ${app.status==='Applied'?'selected':''}>Applied</option>
                          <option value="Approved" ${app.status==='Approved'?'selected':''}>Approved 🎉</option>
                          <option value="Rejected" ${app.status==='Rejected'?'selected':''}>Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm" onclick="openScholarshipDetails('${sch.id}')">Details</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function updateAppStatus(schId, newStatus) {
  const existing = state.applications.find(a => a.scholarshipId === schId);
  if (existing) {
    existing.status = newStatus;
  } else {
    state.applications.push({
      scholarshipId: schId,
      status: newStatus,
      appliedDate: new Date().toISOString().split('T')[0],
      notes: 'Updated via dashboard'
    });
  }
  localStorage.setItem('applications', JSON.stringify(state.applications));
  showToast(`Application status updated to "${newStatus}"!`, 'success');
  renderCurrentView();
}

// 7. Document Intelligence & Reverse Mapping Page
function renderDocumentsPage() {
  const uploadedCount = state.documents.filter(d => d.status === 'Uploaded').length;
  const requiredCount = state.documents.filter(d => d.status === 'Required').length;

  return `
    <section class="section">
      <div class="container" style="max-width:960px;">
        <div class="section-header">
          <span class="section-tag">Document Intelligence</span>
          <h2 class="section-title">Personalized Document Checklist</h2>
          <p class="section-desc">Keep your 17 standardized certificates updated. Click any document to inspect which matched scholarships require it.</p>
        </div>

        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
            <div style="font-weight:700; font-size:1.05rem;">
              Status Summary: <span style="color:var(--brand-green);">${uploadedCount} Available</span> • <span style="color:var(--brand-amber);">${requiredCount} Required</span> (${state.documents.length} Total Documents)
            </div>
            <button class="btn btn-primary btn-sm" onclick="showToast('Document Uploader Triggered', 'info')">
              📤 Upload Certificate
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${state.documents.map(doc => {
              const reqSchemes = getScholarshipsRequiringDocument(doc.name);

              return `
                <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
                  <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:0.5rem;">
                    <div style="display:flex; align-items:center; gap:1rem;">
                      <div style="font-size:1.75rem;">📄</div>
                      <div>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          <h4 style="font-size:1.05rem;">${doc.name}</h4>
                          <span class="status-pill status-${doc.status.toLowerCase()}">${doc.status}</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.2rem;">${doc.description}</p>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="toggleDocStatus('${doc.id}')">
                      ${doc.status === 'Uploaded' ? 'Mark Required' : 'Mark Available ✓'}
                    </button>
                  </div>

                  <!-- Reverse Mapping: Connected Matched Schemes -->
                  <div style="background:var(--bg-surface); padding:0.65rem 0.85rem; border-radius:var(--radius-md); border:1px dashed var(--border-color); font-size:0.8rem; margin-top:0.5rem;">
                    <strong>Scheme Connections:</strong> 
                    ${reqSchemes.length > 0 ?
                      `Required by <span style="color:var(--brand-blue-light); font-weight:700;">${reqSchemes.length} matched schemes</span>: ${reqSchemes.map(s => s.title).join(', ')}` :
                      `<span style="color:var(--text-muted);">Not specifically required by currently active matches</span>`
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function toggleDocStatus(docId) {
  const d = state.documents.find(item => item.id === docId);
  if (d) {
    d.status = d.status === 'Uploaded' ? 'Required' : 'Uploaded';
    localStorage.setItem('documents', JSON.stringify(state.documents));
    showToast(`Updated document status for ${d.name}!`, 'info');
    renderCurrentView();
  }
}

// 8. SaaS Admin Dashboard Page
function renderAdminDashboardPage() {
  return `
    <section class="section">
      <div class="container">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 class="section-title" style="text-align:left; margin:0;">Admin Dataset Management</h2>
            <p style="color:var(--text-secondary);">Manage active dataset schemes, verify student submissions, and view metrics.</p>
          </div>
          <button class="btn btn-primary" onclick="showToast('Add New Scheme Form', 'info')">➕ Add Scheme</button>
        </div>

        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem;">
          <h3 style="font-size:1.25rem; margin-bottom:1rem;">Manage Dataset Records</h3>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Provider</th>
                  <th>Source Type</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.scholarships.map(s => `
                  <tr>
                    <td><strong>${s.title}</strong></td>
                    <td>${s.provider || 'Information unavailable'}</td>
                    <td>${getSourceBadgeHtml(s)}</td>
                    <td>${s.deadline || 'Information unavailable'}</td>
                    <td><span class="status-pill status-uploaded">${s.dataStatus || 'Verified'}</span></td>
                    <td>
                      <button class="btn btn-secondary btn-sm" style="color:var(--brand-red);" onclick="deleteScholarship('${s.id}')">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function deleteScholarship(id) {
  if (confirm("Are you sure you want to remove this scheme from dataset?")) {
    state.scholarships = state.scholarships.filter(s => s.id !== id);
    localStorage.setItem('scholarships', JSON.stringify(state.scholarships));
    showToast("Scheme removed!", "info");
    renderCurrentView();
  }
}

// 9. About Page
function renderAboutPage() {
  return `
    <section class="section">
      <div class="container" style="max-width:900px;">
        <div class="section-header">
          <span class="section-tag">About The Platform</span>
          <h2 class="section-title">Bridging the Financial Aid Gap</h2>
        </div>
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2rem; line-height:1.8;">
          <h3 style="color:var(--brand-blue-light); margin-bottom:0.5rem;">The Problem</h3>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
            Students often have to search dozens of government and foundation portals individually, missing out on financial aid opportunities for which they are eligible.
          </p>

          <h3 style="color:var(--brand-blue-light); margin-bottom:0.5rem;">Our Solution</h3>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
            <strong>One Profile → Multiple Financial Aid Matches</strong>. Enter your profile once and let our weighted matching engine compare your details against real scholarship eligibility rules.
          </p>
        </div>
      </div>
    </section>
  `;
}

// 10. Contact Page
function renderContactPage() {
  return `
    <section class="section">
      <div class="container" style="max-width:800px;">
        <div class="section-header">
          <span class="section-tag">Support Center</span>
          <h2 class="section-title">Contact Support</h2>
        </div>

        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2rem;">
          <form onsubmit="event.preventDefault(); showToast('Support ticket submitted!', 'success');">
            <div style="margin-bottom:1rem;">
              <label class="filter-label">Student Name</label>
              <input type="text" class="form-input" value="${state.studentProfile.name}" required />
            </div>
            <div style="margin-bottom:1rem;">
              <label class="filter-label">Email Address</label>
              <input type="email" class="form-input" placeholder="student@example.com" required />
            </div>
            <div style="margin-bottom:1.5rem;">
              <label class="filter-label">Message / Inquiry</label>
              <textarea class="form-input" rows="4" placeholder="Describe your question..." required></textarea>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <button class="btn btn-secondary" onclick="openReportModal('general')">⚠ Report Issue</button>
              <button type="submit" class="btn btn-primary">Submit Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

// ==========================================================================
// 3. SCHOLARSHIP DETAILS MODAL & UTILITIES
// ==========================================================================

function openScholarshipDetails(id) {
  const s = state.scholarships.find(item => item.id === id);
  if (!s) return;
  
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !body) return;

  const matchInfo = calculateMatchScore(s, state.studentProfile);
  const sourceBadgeHtml = getSourceBadgeHtml(s);
  const deadlineStatusHtml = getDeadlineStatusHtml(s.deadline);

  body.innerHTML = `
    <!-- Official Warning Notice -->
    <div class="disclaimer-banner">
      ⚠️ <strong>Important:</strong> Scholarship information can change. Always verify eligibility, documents, deadlines and application instructions on the official scholarship website before applying.
    </div>

    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
      <div>
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
          <span class="provider-tag">${s.providerType || 'Government'} • ${s.type === 'fee_waiver' ? 'Fee Waiver' : 'Scholarship'}</span>
          ${sourceBadgeHtml}
        </div>
        <h2 style="font-size:1.6rem;">${s.title}</h2>
        <p style="color:var(--text-secondary); font-size:0.95rem;">Provider: <strong>${s.provider || 'Information unavailable'}</strong></p>
      </div>
      <div style="text-align:right;">
        <span class="match-badge ${matchInfo.matchColorClass}">🎯 Match Score: ${matchInfo.score}% (${matchInfo.matchLabel})</span>
        <div style="font-size:1.4rem; font-weight:800; color:var(--brand-blue-light); margin-top:0.5rem;">
          ${s.amountDisplay || (s.amount ? `₹${s.amount.toLocaleString()}` : 'Information unavailable')}
        </div>
      </div>
    </div>

    <hr style="border:0; border-top:1px solid var(--border-color); margin:1.25rem 0;" />

    <h4 style="font-size:1.1rem; color:var(--brand-blue-light); margin-bottom:0.5rem;">Description</h4>
    <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:1.5rem;">
      ${s.description || 'Information unavailable'}
    </p>

    <!-- Eligibility Breakdown Table -->
    <h4 style="font-size:1.1rem; color:var(--brand-blue-light); margin-bottom:0.5rem;">Your Eligibility Analysis (${matchInfo.matchedCount}/${matchInfo.totalCriteria} criteria satisfied)</h4>
    <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1rem; margin-bottom:1.5rem;">
      <div class="table-responsive">
        <table class="custom-table" style="font-size:0.85rem;">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Your Profile</th>
              <th>Requirement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${matchInfo.breakdownDetails.map(b => `
              <tr>
                <td><strong>${b.name}</strong></td>
                <td>${b.student}</td>
                <td>${b.req}</td>
                <td>
                  ${b.matched ?
                    `<span style="color:var(--brand-green); font-weight:700;">✓ Match</span>` :
                    `<span style="color:var(--brand-amber); font-weight:700;">⚠ Mismatch</span>`
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Required Documents Checklist -->
    <h4 style="font-size:1.1rem; color:var(--brand-blue-light); margin-bottom:0.5rem;">Required Documents Checklist</h4>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.5rem; margin-bottom:1.5rem;">
      ${s.requiredDocuments && s.requiredDocuments.length > 0 ?
        s.requiredDocuments.map(doc => `<div style="background:var(--bg-primary); padding:0.65rem 0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.85rem;">📄 ${doc}</div>`).join('') :
        `<span style="color:var(--text-muted);">Information unavailable</span>`
      }
    </div>

    <!-- Application Steps -->
    ${s.applicationSteps && s.applicationSteps.length > 0 ? `
      <h4 style="font-size:1.1rem; color:var(--brand-blue-light); margin-bottom:0.5rem;">Application Process</h4>
      <ol style="padding-left:1.25rem; color:var(--text-secondary); font-size:0.92rem; margin-bottom:1.5rem;">
        ${s.applicationSteps.map(step => `<li style="margin-bottom:0.35rem;">${step}</li>`).join('')}
      </ol>
    ` : ''}

    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem;">
      <div>${deadlineStatusHtml}</div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" onclick="openReportModal('${s.id}')">⚠ Report Issue</button>
        ${s.applicationUrl || s.officialSourceUrl ?
          `<button class="btn btn-primary" onclick="window.open('${s.applicationUrl || s.officialSourceUrl}', '_blank'); updateAppStatus('${s.id}', 'Applied');">Official Application ↗</button>` :
          `<span style="color:var(--text-muted); font-size:0.85rem; display:inline-block; padding:0.5rem;">Official application link unavailable.</span>`
        }
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function openReportModal(id) {
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <h2 style="font-size:1.5rem; margin-bottom:1rem;">Report Incorrect Information</h2>
    <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">
      Help us maintain dataset accuracy. Select the problem type below:
    </p>

    <form onsubmit="event.preventDefault(); showToast('Report submitted to admin review log!', 'success'); closeModal('detail-modal');">
      <div style="margin-bottom:1rem;">
        <label class="filter-label">Issue Category</label>
        <select class="form-select">
          <option>Incorrect Deadline</option>
          <option>Incorrect Eligibility Requirements</option>
          <option>Incorrect Benefit Amount</option>
          <option>Broken Application Link</option>
          <option>Other Problem</option>
        </select>
      </div>

      <div style="margin-bottom:1.5rem;">
        <label class="filter-label">Describe Problem</label>
        <textarea class="form-input" rows="4" placeholder="Provide details..." required></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('detail-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Report</button>
      </div>
    </form>
  `;
  modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function toggleBookmark(id) {
  if (state.bookmarkedIds.includes(id)) {
    state.bookmarkedIds = state.bookmarkedIds.filter(i => i !== id);
    showToast('Removed from saved bookmarks', 'info');
  } else {
    state.bookmarkedIds.push(id);
    showToast('Saved to your bookmarks! ⭐', 'success');
  }
  localStorage.setItem('bookmarkedIds', JSON.stringify(state.bookmarkedIds));
  renderCurrentView();
}

function toggleCompare(id) {
  if (state.comparisonIds.includes(id)) {
    state.comparisonIds = state.comparisonIds.filter(i => i !== id);
  } else {
    if (state.comparisonIds.length >= 3) {
      showToast('You can compare up to 3 scholarships at a time', 'warning');
      return;
    }
    state.comparisonIds.push(id);
  }
  updateComparisonBar();
  renderCurrentView();
}

function updateComparisonBar() {
  const bar = document.getElementById('comparison-bar');
  if (!bar) return;
  
  if (state.comparisonIds.length > 0) {
    bar.style.display = 'flex';
    bar.innerHTML = `
      <span>⚖️ <strong>${state.comparisonIds.length}</strong> selected for comparison</span>
      <button class="btn btn-primary btn-sm" onclick="openComparisonModal()">Compare Side-by-Side</button>
      <button class="btn btn-secondary btn-sm" onclick="clearCompare()">Clear</button>
    `;
  } else {
    bar.style.display = 'none';
  }
}

function clearCompare() {
  state.comparisonIds = [];
  updateComparisonBar();
  renderCurrentView();
}

function openComparisonModal() {
  const items = state.scholarships.filter(s => state.comparisonIds.includes(s.id));
  if (items.length === 0) return;

  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <h2 style="font-size:1.6rem; margin-bottom:1.5rem;">Scholarship Side-by-Side Comparison</h2>
    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Criteria</th>
            ${items.map(s => `<th>${s.title}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Data Source</strong></td>
            ${items.map(s => `<td>${getSourceBadgeHtml(s)}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Provider</strong></td>
            ${items.map(s => `<td>${s.provider || 'Information unavailable'}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Match Score</strong></td>
            ${items.map(s => {
              const m = calculateMatchScore(s, state.studentProfile);
              return `<td style="font-weight:700;">${m.score}% (${m.matchLabel})</td>`;
            }).join('')}
          </tr>
          <tr>
            <td><strong>Benefit Amount</strong></td>
            ${items.map(s => `<td style="color:var(--brand-blue-light); font-weight:700;">${s.amountDisplay || (s.amount ? `₹${s.amount.toLocaleString()}` : 'Information unavailable')}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Deadline</strong></td>
            ${items.map(s => `<td>${s.deadline || 'Information unavailable'}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
  modal.classList.add('active');
}

function handleHeroSearch() {
  const input = document.getElementById('hero-search-input');
  if (input && input.value) {
    state.filters.searchKeyword = input.value;
    switchView('finder');
  }
}

function toggleFaq(idx) {
  const ans = document.getElementById(`faq-ans-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (ans.style.display === 'none') {
    ans.style.display = 'block';
    icon.innerText = '▲';
  } else {
    ans.style.display = 'none';
    icon.innerText = '▼';
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge');
  if (badge) {
    const unread = state.notifications.filter(n => !n.read).length;
    badge.style.display = unread > 0 ? 'block' : 'none';
  }
}

function toggleNotificationDropdown() {
  const popover = document.getElementById('notif-popover');
  if (popover) {
    popover.style.display = popover.style.display === 'block' ? 'none' : 'block';
    popover.innerHTML = `
      <div style="padding:1rem; border-bottom:1px solid var(--border-color); font-weight:700; display:flex; justify-content:space-between;">
        <span>🔔 Notifications</span>
        <span style="font-size:0.75rem; color:var(--brand-blue-light); cursor:pointer;" onclick="markAllNotificationsRead()">Mark all read</span>
      </div>
      <div style="max-height:300px; overflow-y:auto;">
        ${state.notifications.map(n => `
          <div style="padding:0.85rem 1rem; border-bottom:1px solid var(--border-color); background:${n.read?'transparent':'var(--brand-blue-soft)'};">
            <div style="font-size:0.85rem; font-weight:700;">${n.title}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">${n.message}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function markAllNotificationsRead() {
  state.notifications.forEach(n => n.read = true);
  updateNotificationBadge();
  toggleNotificationDropdown();
}

function openAuthModal() {
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <h2 style="font-size:1.6rem; margin-bottom:1.5rem; text-align:center;">Student Sign In / Register</h2>
    <div style="display:flex; flex-direction:column; gap:1rem; max-width:400px; margin:0 auto;">
      <button class="btn btn-secondary btn-lg" onclick="showToast('Google Sign-In Simulated', 'success'); closeModal('detail-modal');">
        🌐 Continue with Google
      </button>
      <div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">or sign in with email</div>
      <input type="email" class="form-input" placeholder="Student Email Address" />
      <input type="password" class="form-input" placeholder="Password" />
      <button class="btn btn-primary btn-lg" onclick="showToast('Signed in successfully!', 'success'); closeModal('detail-modal');">
        Sign In
      </button>
    </div>
  `;
  modal.classList.add('active');
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(el.dataset.view);
    });
  });
}
