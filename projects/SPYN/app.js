// Application data
const appData = {
  "founders": [
    {
      "id": "f001",
      "name": "Sarah Chen",
      "company": "TechFlow AI",
      "stage": "Pre-Seed",
      "industry": "AI/ML",
      "location": "Tulsa, OK",
      "founded": "2024",
      "description": "Building AI-powered workflow automation for small businesses. Need technical co-founder with ML expertise.",
      "equity_offered": "15-20%",
      "vesting": "4 years, 1 year cliff",
      "funding_raised": "$0",
      "team_size": 2,
      "revenue": "Pre-revenue",
      "looking_for": ["CTO", "Lead Engineer", "ML Specialist"],
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/4F46E5/ffffff?text=SC",
      "rating": 4.8
    },
    {
      "id": "f002", 
      "name": "Marcus Johnson",
      "company": "EcoLogistics",
      "stage": "Seed",
      "industry": "GreenTech",
      "location": "Tulsa, OK",
      "founded": "2023",
      "description": "Sustainable delivery optimization platform. Looking for marketing and business development talent.",
      "equity_offered": "8-12%",
      "vesting": "4 years, 1 year cliff",
      "funding_raised": "$150K",
      "team_size": 4,
      "revenue": "$8K MRR",
      "looking_for": ["VP Marketing", "Business Development", "UX Designer"],
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/059669/ffffff?text=MJ",
      "rating": 4.6
    },
    {
      "id": "f003",
      "name": "Dr. Priya Patel",
      "company": "MedConnect",
      "stage": "Pre-Seed",
      "industry": "HealthTech",
      "location": "Tulsa, OK", 
      "founded": "2024",
      "description": "Telemedicine platform for rural communities. Seeking technical and regulatory expertise.",
      "equity_offered": "10-15%",
      "vesting": "4 years, 6 month cliff",
      "funding_raised": "$25K",
      "team_size": 3,
      "revenue": "Pre-revenue",
      "looking_for": ["Full-Stack Developer", "Regulatory Consultant", "Product Manager"],
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/DC2626/ffffff?text=PP",
      "rating": 4.9
    }
  ],
  "professionals": [
    {
      "id": "p001",
      "name": "Alex Rodriguez",
      "title": "Senior Full-Stack Developer",
      "experience": "8 years",
      "location": "Remote (Tulsa-based)",
      "skills": ["React", "Node.js", "Python", "AWS", "PostgreSQL"],
      "industries": ["FinTech", "HealthTech", "SaaS"],
      "rate": "Equity + $50/hr part-time",
      "availability": "20 hrs/week",
      "description": "Experienced full-stack developer with fintech background. Built 3 successful SaaS products. Looking for meaningful equity partnership.",
      "portfolio_url": "github.com/alexrod",
      "linkedin": "linkedin.com/in/alexrodriguez",
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/7C3AED/ffffff?text=AR",
      "rating": 4.7,
      "completed_projects": 12
    },
    {
      "id": "p002",
      "name": "Jennifer Kim",
      "title": "Marketing Director",
      "experience": "10 years",
      "location": "Tulsa, OK",
      "skills": ["Digital Marketing", "Brand Strategy", "Growth Hacking", "Analytics", "Content Strategy"],
      "industries": ["B2B SaaS", "Consumer Tech", "E-commerce"],
      "rate": "Equity only",
      "availability": "30 hrs/week",
      "description": "Growth marketing expert who scaled 2 startups from 0 to $1M ARR. Seeking equity-only partnership with high-growth potential.",
      "portfolio_url": "jenniferkimmarketing.com",
      "linkedin": "linkedin.com/in/jenniferkim",
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/EC4899/ffffff?text=JK",
      "rating": 4.9,
      "completed_projects": 8
    },
    {
      "id": "p003",
      "name": "David Thompson",
      "title": "Fractional CTO",
      "experience": "15 years",
      "location": "Oklahoma City, OK",
      "skills": ["System Architecture", "Team Leadership", "DevOps", "Security", "Scalability"],
      "industries": ["Enterprise Software", "AI/ML", "Cybersecurity"],
      "rate": "2-5% equity + advisory fee",
      "availability": "15 hrs/week",
      "description": "Former CTO of 2 successful exits. Specializing in helping early-stage startups build scalable tech foundations.",
      "portfolio_url": "davidthompsoncto.com",
      "linkedin": "linkedin.com/in/davidthompsoncto",
      "verified": true,
      "avatar": "https://via.placeholder.com/150x150/059669/ffffff?text=DT",
      "rating": 5.0,
      "completed_projects": 15
    }
  ],
  "backend_metrics": {
    "system_metrics": {
      "uptime": "99.97%",
      "response_time": "142ms avg",
      "daily_active_users": 89,
      "monthly_signups": 47,
      "conversion_rate": "12.3%",
      "churn_rate": "2.8%",
      "server_load": "67%",
      "api_calls_24h": 15847,
      "storage_used": "78.2 GB",
      "backup_status": "Last: 2 hours ago"
    },
    "financial_metrics": {
      "mrr": 8750,
      "arr": 105000,
      "ltv": 2340,
      "cac": 187,
      "gross_margin": "84%",
      "burn_rate": 15600,
      "runway_months": 12.8,
      "pending_revenue": 3200,
      "refunds_mtd": 125,
      "failed_payments": 6
    },
    "user_analytics": {
      "founder_signups_week": 12,
      "professional_signups_week": 18,
      "profile_completion_rate": "76%",
      "match_success_rate": "34%",
      "contract_completion_rate": "89%",
      "support_tickets": 23,
      "feature_requests": 8,
      "bug_reports": 3
    }
  },
  "survey": {
    "founder_questions": [
      {
        "id": "f1",
        "type": "multiple_choice",
        "question": "What is your startup's current stage?",
        "options": ["Idea Stage", "Pre-Seed", "Seed", "Series A", "Series B+"],
        "required": true
      },
      {
        "id": "f2", 
        "type": "multiple_choice",
        "question": "How much equity are you willing to offer for critical talent?",
        "options": ["1-5%", "5-10%", "10-15%", "15-20%", "20%+"],
        "required": true
      },
      {
        "id": "f3",
        "type": "checkbox",
        "question": "What type of expertise do you need most? (Select all that apply)",
        "options": ["Technical/Engineering", "Marketing/Growth", "Sales/Business Development", "Design/UX", "Finance/Operations", "Legal/Compliance", "Industry Expertise"],
        "required": true
      },
      {
        "id": "f4",
        "type": "scale",
        "question": "How critical is it to have legally binding agreements in place?",
        "scale": "1-5 (1=Not Important, 5=Extremely Important)",
        "required": true
      },
      {
        "id": "f5",
        "type": "multiple_choice", 
        "question": "What is your biggest concern with equity-for-services partnerships?",
        "options": ["Legal protection", "Finding quality talent", "Equity valuation", "Vesting schedules", "IP ownership"],
        "required": true
      },
      {
        "id": "f6",
        "type": "text",
        "question": "Describe your startup in one sentence:",
        "required": true
      },
      {
        "id": "f7",
        "type": "multiple_choice",
        "question": "How much have you previously spent on legal services?",
        "options": ["$0", "$500-$2,000", "$2,000-$5,000", "$5,000-$10,000", "$10,000+"],
        "required": false
      }
    ],
    "professional_questions": [
      {
        "id": "p1",
        "type": "multiple_choice",
        "question": "What is your primary area of expertise?",
        "options": ["Software Development", "Marketing/Growth", "Sales/Business Development", "Design/UX", "Finance/Operations", "Legal/Compliance", "Industry Specialist"],
        "required": true
      },
      {
        "id": "p2",
        "type": "multiple_choice",
        "question": "How many years of relevant experience do you have?",
        "options": ["1-3 years", "3-5 years", "5-10 years", "10-15 years", "15+ years"],
        "required": true
      },
      {
        "id": "p3",
        "type": "multiple_choice",
        "question": "What type of compensation structure interests you most?",
        "options": ["Equity only", "Equity + hourly rate", "Equity + deferred cash", "Performance-based equity", "Fixed equity + benefits"],
        "required": true
      },
      {
        "id": "p4",
        "type": "checkbox",
        "question": "Which industries interest you? (Select all that apply)",
        "options": ["FinTech", "HealthTech", "AI/ML", "GreenTech", "E-commerce", "SaaS", "Consumer Tech", "Enterprise Software"],
        "required": true
      },
      {
        "id": "p5",
        "type": "scale",
        "question": "How important is legal protection in equity partnerships?",
        "scale": "1-5 (1=Not Important, 5=Extremely Important)",
        "required": true
      },
      {
        "id": "p6",
        "type": "multiple_choice",
        "question": "How many hours per week are you available?",
        "options": ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours", "Full-time equivalent"],
        "required": true
      },
      {
        "id": "p7",
        "type": "text", 
        "question": "What is your biggest concern about working for equity?",
        "required": true
      }
    ]
  },
  "cofounder_dashboard": {
    "profile_stats": {
      "profile_views": 127,
      "profile_completion": 94,
      "verification_status": "Verified",
      "rating": 4.8,
      "response_rate": "98%"
    },
    "active_searches": [
      {"name": "CTO Search", "stage": "Final Interviews", "candidates": 2, "equity_range": "15-18%"},
      {"name": "Marketing Lead", "stage": "Initial Screening", "candidates": 5, "equity_range": "5-8%"}
    ],
    "equity_allocation": {
      "total_equity_pool": 20,
      "allocated_equity": 8,
      "pending_allocations": 5,
      "available_equity": 7
    },
    "recent_activity": [
      {"text": "3 new applications for CTO role", "time": "2 hours ago", "icon": "👤"},
      {"text": "Contract signed with Jennifer Kim", "time": "1 day ago", "icon": "📝"},
      {"text": "Profile viewed 12 times", "time": "3 days ago", "icon": "👁️"}
    ]
  },
  "professional_dashboard": {
    "active_applications": [
      {"company": "TechFlow AI", "role": "Lead Engineer", "stage": "Technical Interview", "equity": "15-20%", "applied": "2024-09-20"},
      {"company": "EcoLogistics", "role": "Technical Advisor", "stage": "Contract Review", "equity": "2-3%", "applied": "2024-09-28"},
      {"company": "MedConnect", "role": "Full-Stack Developer", "stage": "Initial Screening", "equity": "8-12%", "applied": "2024-10-02"}
    ],
    "opportunities": [
      {"company": "FinanceFlow", "role": "Senior Developer", "match": "92%", "equity": "12-15%"},
      {"company": "HealthLink", "role": "Tech Lead", "match": "88%", "equity": "8-10%"},
      {"company": "GreenTech Solutions", "role": "CTO", "match": "95%", "equity": "18-22%"}
    ]
  }
};

// Global variables
let currentPage = 'home';
let currentUserType = null;
let surveyUserType = null;
let currentQuestionIndex = 0;
let surveyAnswers = {};
let charts = {};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    renderFounderProfiles();
    renderProfessionalProfiles();
    animateCounters();
    initializeCharts();
    
    // Show home page by default
    showPage('home');
    
    // Simulate real-time updates
    setInterval(updateMetrics, 30000);
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = pageId;
        
        // Initialize page-specific content
        if (pageId === 'cofounder-dashboard') {
            initializeCofounderDashboard();
        } else if (pageId === 'professional-dashboard') {
            initializeProfessionalDashboard();
        } else if (pageId === 'admin-dashboard') {
            initializeAdminDashboard();
        } else if (pageId === 'partnership-assessment') {
            initializeAssessment();
        } else if (pageId === 'home') {
            initializeCharts();
        }
    }
}

// Co-founder Dashboard
function initializeCofounderDashboard() {
    renderActiveSearches();
    renderRecentActivity();
    renderProfessionalMatches();
    initializeEquityChart();
}

function renderActiveSearches() {
    const container = document.getElementById('activeSearches');
    if (!container) return;
    
    container.innerHTML = '';
    appData.cofounder_dashboard.active_searches.forEach(search => {
        const searchCard = document.createElement('div');
        searchCard.className = 'search-card';
        searchCard.innerHTML = `
            <div class="search-card-header">
                <h4>${search.name}</h4>
                <span class="search-stage">${search.stage}</span>
            </div>
            <div class="search-details">
                <span class="candidate-count">${search.candidates} candidates</span>
                <span class="equity-range">${search.equity_range}</span>
            </div>
        `;
        container.appendChild(searchCard);
    });
}

function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = '';
    appData.cofounder_dashboard.recent_activity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        container.appendChild(activityItem);
    });
}

function renderProfessionalMatches() {
    const container = document.getElementById('professionalMatches');
    if (!container) return;
    
    container.innerHTML = '';
    appData.professionals.slice(0, 3).forEach(professional => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.onclick = () => openProfileModal(professional, 'professional');
        matchCard.innerHTML = `
            <img src="${professional.avatar}" alt="${professional.name}" class="match-avatar">
            <div class="match-name">${professional.name}</div>
            <div class="match-score">Match: ${Math.floor(Math.random() * 20 + 80)}%</div>
        `;
        container.appendChild(matchCard);
    });
}

function initializeEquityChart() {
    const ctx = document.getElementById('equityChart');
    if (!ctx || charts.equity) return;
    
    const data = appData.cofounder_dashboard.equity_allocation;
    charts.equity = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Allocated', 'Pending', 'Available'],
            datasets: [{
                data: [data.allocated_equity, data.pending_allocations, data.available_equity],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Professional Dashboard
function initializeProfessionalDashboard() {
    renderActiveApplications();
    renderNewOpportunities();
    renderSkillsTags();
    initializePortfolioChart();
}

function renderActiveApplications() {
    const container = document.getElementById('activeApplications');
    if (!container) return;
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Stage</th>
                <th>Equity</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${appData.professional_dashboard.active_applications.map(app => `
                <tr>
                    <td>${app.company}</td>
                    <td>${app.role}</td>
                    <td><span class="status status--info">${app.stage}</span></td>
                    <td>${app.equity}</td>
                    <td>
                        <div class="application-actions">
                            <button class="btn btn--outline btn--sm">Follow Up</button>
                            <button class="btn btn--outline btn--sm">Withdraw</button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

function renderNewOpportunities() {
    const container = document.getElementById('newOpportunities');
    if (!container) return;
    
    container.innerHTML = '';
    appData.professional_dashboard.opportunities.forEach(opp => {
        const oppItem = document.createElement('div');
        oppItem.className = 'opportunity-item';
        oppItem.innerHTML = `
            <div class="opportunity-header">
                <div>
                    <div class="opportunity-company">${opp.company}</div>
                    <div class="opportunity-role">${opp.role}</div>
                </div>
                <span class="match-score-badge">${opp.match} Match</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--color-brand-secondary); font-weight: 500;">${opp.equity} equity</span>
                <button class="btn btn--primary btn--sm">Apply Now</button>
            </div>
        `;
        container.appendChild(oppItem);
    });
}

function renderSkillsTags() {
    const container = document.getElementById('skillsTags');
    if (!container) return;
    
    container.innerHTML = '';
    const professional = appData.professionals[0];
    professional.skills.forEach((skill, index) => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const level = levels[Math.floor(Math.random() * levels.length)];
        skillTag.innerHTML = `
            ${skill}
            <span class="skill-level">${level}</span>
        `;
        container.appendChild(skillTag);
    });
}

function initializePortfolioChart() {
    const ctx = document.getElementById('portfolioChart');
    if (!ctx || charts.portfolio) return;
    
    charts.portfolio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['TechFlow AI', 'EcoLogistics', 'MedConnect', 'Previous Exit'],
            datasets: [{
                label: 'Equity Value ($K)',
                data: [25, 12, 8, 12],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Admin Dashboard
function initializeAdminDashboard() {
    initializeSystemMetricsChart();
    initializeUserAnalyticsChart();
}

function initializeSystemMetricsChart() {
    const ctx = document.getElementById('systemMetricsChart');
    if (!ctx || charts.systemMetrics) return;
    
    charts.systemMetrics = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Response Time (ms)',
                data: [120, 135, 142, 158, 145, 138],
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeUserAnalyticsChart() {
    const ctx = document.getElementById('userAnalyticsChart');
    if (!ctx || charts.userAnalytics) return;
    
    charts.userAnalytics = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Founder Signups',
                data: [2, 3, 1, 4, 2, 1, 0],
                backgroundColor: '#1FB8CD'
            }, {
                label: 'Professional Signups',
                data: [3, 4, 2, 5, 3, 2, 1],
                backgroundColor: '#FFC185'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Partnership Assessment
function initializeAssessment() {
    // Reset survey state
    surveyUserType = null;
    currentQuestionIndex = 0;
    surveyAnswers = {};
    
    // Show user type selection
    document.getElementById('userTypeSelection').classList.remove('hidden');
    document.getElementById('surveyForm').classList.add('hidden');
    document.getElementById('surveyResults').classList.add('hidden');
}

function selectSurveyType(type) {
    surveyUserType = type;
    
    // Update button states
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.user-type-btn').classList.add('active');
    
    // Show survey form after a brief delay
    setTimeout(() => {
        document.getElementById('userTypeSelection').classList.add('hidden');
        document.getElementById('surveyForm').classList.remove('hidden');
        renderSurveyQuestion();
    }, 500);
}

function renderSurveyQuestion() {
    const questions = surveyUserType === 'founder' ? 
        appData.survey.founder_questions : appData.survey.professional_questions;
    
    const question = questions[currentQuestionIndex];
    const container = document.getElementById('surveyQuestions');
    
    container.innerHTML = `
        <div class="question-container">
            <div class="question-title">${question.question}</div>
            <div class="question-content" id="questionContent"></div>
        </div>
    `;
    
    const contentDiv = document.getElementById('questionContent');
    
    if (question.type === 'multiple_choice') {
        contentDiv.innerHTML = `
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <button type="button" class="option-button" onclick="selectOption('${question.id}', '${option}')">${option}</button>
                `).join('')}
            </div>
        `;
    } else if (question.type === 'checkbox') {
        contentDiv.innerHTML = `
            <div class="checkbox-options">
                ${question.options.map((option, index) => `
                    <div class="checkbox-option" onclick="toggleCheckbox('${question.id}', '${option}')">
                        <input type="checkbox" id="cb_${index}" style="pointer-events: none;">
                        <label for="cb_${index}" style="pointer-events: none;">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (question.type === 'scale') {
        contentDiv.innerHTML = `
            <div class="scale-options">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="scale-option" onclick="selectOption('${question.id}', '${num}')">${num}</button>
                `).join('')}
            </div>
            <div class="scale-labels">
                <span>Not Important</span>
                <span>Extremely Important</span>
            </div>
        `;
    } else if (question.type === 'text') {
        contentDiv.innerHTML = `
            <textarea class="text-input" placeholder="Enter your response..." 
                onchange="surveyAnswers['${question.id}'] = this.value; updateNavigationButtons();"></textarea>
        `;
    }
    
    updateProgress();
    updateNavigationButtons();
}

function selectOption(questionId, value) {
    surveyAnswers[questionId] = value;
    
    // Update visual selection
    document.querySelectorAll('.option-button, .scale-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    updateNavigationButtons();
}

function toggleCheckbox(questionId, value) {
    if (!surveyAnswers[questionId]) {
        surveyAnswers[questionId] = [];
    }
    
    const checkbox = event.target.querySelector('input') || event.target;
    const option = event.target.closest('.checkbox-option');
    
    if (surveyAnswers[questionId].includes(value)) {
        surveyAnswers[questionId] = surveyAnswers[questionId].filter(v => v !== value);
        checkbox.checked = false;
        option.classList.remove('selected');
    } else {
        surveyAnswers[questionId].push(value);
        checkbox.checked = true;
        option.classList.add('selected');
    }
    
    updateNavigationButtons();
}

function updateProgress() {
    const questions = surveyUserType === 'founder' ? 
        appData.survey.founder_questions : appData.survey.professional_questions;
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('surveyProgress').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function updateNavigationButtons() {
    const questions = surveyUserType === 'founder' ? 
        appData.survey.founder_questions : appData.survey.professional_questions;
    
    const currentQuestion = questions[currentQuestionIndex];
    const hasAnswer = surveyAnswers[currentQuestion.id] !== undefined && 
                     surveyAnswers[currentQuestion.id] !== '' &&
                     (Array.isArray(surveyAnswers[currentQuestion.id]) ? 
                      surveyAnswers[currentQuestion.id].length > 0 : true);
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
    document.getElementById('submitBtn').style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
    
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('submitBtn').disabled = !hasAnswer;
    } else {
        document.getElementById('nextBtn').disabled = currentQuestion.required && !hasAnswer;
    }
}

function nextQuestion() {
    const questions = surveyUserType === 'founder' ? 
        appData.survey.founder_questions : appData.survey.professional_questions;
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderSurveyQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderSurveyQuestion();
    }
}

// Survey Results
function showSurveyResults() {
    document.getElementById('surveyForm').classList.add('hidden');
    document.getElementById('surveyResults').classList.remove('hidden');
    
    renderSurveyResults();
}

function renderSurveyResults() {
    const summaryDiv = document.getElementById('resultsSummary');
    const recommendationsDiv = document.getElementById('recommendations');
    
    // Generate mock results based on answers
    const compatibilityScore = Math.floor(Math.random() * 20 + 80);
    const riskLevel = surveyAnswers.f4 >= 4 || surveyAnswers.p5 >= 4 ? 'Low' : 'Medium';
    const matchCount = Math.floor(Math.random() * 15 + 5);
    
    summaryDiv.innerHTML = `
        <div class="result-metric">
            <div class="result-value">${compatibilityScore}%</div>
            <div class="result-label">Platform Compatibility</div>
        </div>
        <div class="result-metric">
            <div class="result-value">${riskLevel}</div>
            <div class="result-label">Risk Level</div>
        </div>
        <div class="result-metric">
            <div class="result-value">${matchCount}</div>
            <div class="result-label">Potential Matches</div>
        </div>
    `;
    
    // Generate personalized recommendations
    const recommendations = generateRecommendations();
    recommendationsDiv.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        </div>
    `).join('');
}

function generateRecommendations() {
    const recommendations = [];
    
    if (surveyUserType === 'founder') {
        if (surveyAnswers.f2 && surveyAnswers.f2.includes('15-20%')) {
            recommendations.push({
                title: 'Optimal Equity Range',
                description: 'Your equity allocation range is well-positioned to attract senior talent. Consider performance-based vesting for key roles.'
            });
        }
        
        if (surveyAnswers.f4 >= 4) {
            recommendations.push({
                title: 'Legal Framework Priority',
                description: 'Given your high priority on legal protection, we recommend starting with our comprehensive EFS agreement templates.'
            });
        }
    } else {
        if (surveyAnswers.p3 && surveyAnswers.p3.includes('Equity only')) {
            recommendations.push({
                title: 'High-Growth Opportunities',
                description: 'Your equity-only preference aligns well with early-stage startups. Focus on Pre-Seed to Series A companies.'
            });
        }
        
        if (surveyAnswers.p5 >= 4) {
            recommendations.push({
                title: 'Legal Protection Focus',
                description: 'Your emphasis on legal protection makes you a great fit for our platform\'s comprehensive contract framework.'
            });
        }
    }
    
    recommendations.push({
        title: 'Next Steps',
        description: 'Complete your profile to start receiving personalized matches. Our AI algorithm will connect you with the best opportunities.'
    });
    
    return recommendations;
}

function downloadReport() {
    // Mock download functionality
    alert('Assessment report download started. Check your downloads folder.');
}

// Render founder and professional profiles
function renderFounderProfiles() {
    const grid = document.getElementById('foundersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    appData.founders.forEach(founder => {
        const profileCard = createFounderCard(founder);
        grid.appendChild(profileCard);
    });
}

function createFounderCard(founder) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.onclick = () => openProfileModal(founder, 'founder');
    
    const stars = '★'.repeat(Math.floor(founder.rating)) + '☆'.repeat(5 - Math.floor(founder.rating));
    
    card.innerHTML = `
        <div class="profile-header">
            <img src="${founder.avatar}" alt="${founder.name}" class="profile-avatar">
            <div class="profile-info">
                <div class="profile-name">${founder.name}</div>
                <div class="profile-title">${founder.company} • ${founder.stage}</div>
                <div class="profile-location">📍 ${founder.location}</div>
            </div>
            ${founder.verified ? '<div class="verification-badge">✓ Verified</div>' : ''}
        </div>
        <div class="profile-body">
            <div class="profile-description">${founder.description}</div>
            <div class="profile-tags">
                ${founder.looking_for.map(role => `<span class="tag">${role}</span>`).join('')}
            </div>
            <div class="profile-footer">
                <div class="profile-equity">${founder.equity_offered} equity</div>
                <div class="profile-rating">
                    <span class="rating-stars">${stars}</span>
                    <span>${founder.rating}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function renderProfessionalProfiles() {
    const grid = document.getElementById('professionalsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    appData.professionals.forEach(professional => {
        const profileCard = createProfessionalCard(professional);
        grid.appendChild(profileCard);
    });
}

function createProfessionalCard(professional) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.onclick = () => openProfileModal(professional, 'professional');
    
    const stars = '★'.repeat(Math.floor(professional.rating)) + '☆'.repeat(5 - Math.floor(professional.rating));
    
    card.innerHTML = `
        <div class="profile-header">
            <img src="${professional.avatar}" alt="${professional.name}" class="profile-avatar">
            <div class="profile-info">
                <div class="profile-name">${professional.name}</div>
                <div class="profile-title">${professional.title}</div>
                <div class="profile-location">📍 ${professional.location}</div>
            </div>
            ${professional.verified ? '<div class="verification-badge">✓ Verified</div>' : ''}
        </div>
        <div class="profile-body">
            <div class="profile-description">${professional.description}</div>
            <div class="profile-tags">
                ${professional.skills.slice(0, 4).map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
            <div class="profile-footer">
                <div class="profile-equity">${professional.rate}</div>
                <div class="profile-rating">
                    <span class="rating-stars">${stars}</span>
                    <span>${professional.rating}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Chart initialization
function initializeCharts() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;
    
    // Clear any existing chart
    if (charts.growth) {
        charts.growth.destroy();
    }
    
    charts.growth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [{
                label: 'Platform Users',
                data: [45, 67, 89, 123, 156, 189, 234, 278, 312, 347],
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Successful Matches',
                data: [2, 3, 5, 7, 9, 12, 15, 18, 21, 23],
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Platform Growth Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// Modal functions
function openSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.classList.remove('hidden');
        currentUserType = null;
        
        const signupForm = document.getElementById('signupForm');
        if (signupForm) signupForm.classList.add('hidden');
        
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function selectUserType(type) {
    currentUserType = type;
    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.classList.remove('hidden');
    
    // Hide all conditional fields first
    const founderFields = document.getElementById('founderFields');
    const professionalFields = document.getElementById('professionalFields');
    
    if (founderFields) founderFields.classList.add('hidden');
    if (professionalFields) professionalFields.classList.add('hidden');
    
    // Show relevant fields
    if (type === 'founder' && founderFields) {
        founderFields.classList.remove('hidden');
    } else if (type === 'professional' && professionalFields) {
        professionalFields.classList.remove('hidden');
    }
    
    // Update button states
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find the clicked button
    const clickedBtn = event.target.closest('.user-type-btn');
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

function openProfileModal(profile, type) {
    const modal = document.getElementById('profileModal');
    const titleEl = document.getElementById('profileModalTitle');
    const bodyEl = document.getElementById('profileModalBody');
    
    if (!modal || !titleEl || !bodyEl) return;
    
    titleEl.textContent = `${profile.name} - ${type === 'founder' ? profile.company : profile.title}`;
    
    if (type === 'founder') {
        bodyEl.innerHTML = createFounderModalContent(profile);
    } else {
        bodyEl.innerHTML = createProfessionalModalContent(profile);
    }
    
    modal.classList.remove('hidden');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function createFounderModalContent(founder) {
    const stars = '★'.repeat(Math.floor(founder.rating)) + '☆'.repeat(5 - Math.floor(founder.rating));
    
    return `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
            <img src="${founder.avatar}" alt="${founder.name}" style="width: 80px; height: 80px; border-radius: 50%;">
            <div>
                <h4 style="margin: 0 0 8px 0;">${founder.company}</h4>
                <p style="margin: 0; color: var(--color-text-secondary);">${founder.stage} • ${founder.industry}</p>
                <p style="margin: 4px 0 0 0; color: var(--color-text-secondary);">📍 ${founder.location} • Founded ${founder.founded}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h5>About</h5>
            <p>${founder.description}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h6>Company Details</h6>
                <p><strong>Team Size:</strong> ${founder.team_size}</p>
                <p><strong>Revenue:</strong> ${founder.revenue}</p>
                <p><strong>Funding:</strong> ${founder.funding_raised}</p>
            </div>
            <div>
                <h6>Equity Terms</h6>
                <p><strong>Equity Offered:</strong> ${founder.equity_offered}</p>
                <p><strong>Vesting:</strong> ${founder.vesting}</p>
                <p><strong>Rating:</strong> ${stars} ${founder.rating}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h6>Looking For</h6>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${founder.looking_for.map(role => `<span class="tag">${role}</span>`).join('')}
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="btn btn--primary" onclick="closeProfileModal()">Express Interest</button>
            <button class="btn btn--outline" onclick="closeProfileModal()">Save for Later</button>
        </div>
    `;
}

function createProfessionalModalContent(professional) {
    const stars = '★'.repeat(Math.floor(professional.rating)) + '☆'.repeat(5 - Math.floor(professional.rating));
    
    return `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
            <img src="${professional.avatar}" alt="${professional.name}" style="width: 80px; height: 80px; border-radius: 50%;">
            <div>
                <h4 style="margin: 0 0 8px 0;">${professional.title}</h4>
                <p style="margin: 0; color: var(--color-text-secondary);">${professional.experience} experience</p>
                <p style="margin: 4px 0 0 0; color: var(--color-text-secondary);">📍 ${professional.location}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h5>About</h5>
            <p>${professional.description}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h6>Professional Details</h6>
                <p><strong>Rate:</strong> ${professional.rate}</p>
                <p><strong>Availability:</strong> ${professional.availability}</p>
                <p><strong>Completed Projects:</strong> ${professional.completed_projects}</p>
            </div>
            <div>
                <h6>Links & Rating</h6>
                <p><strong>Portfolio:</strong> <a href="https://${professional.portfolio_url}" target="_blank">${professional.portfolio_url}</a></p>
                <p><strong>LinkedIn:</strong> <a href="https://${professional.linkedin}" target="_blank">View Profile</a></p>
                <p><strong>Rating:</strong> ${stars} ${professional.rating}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h6>Skills</h6>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${professional.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h6>Industries</h6>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${professional.industries.map(industry => `<span class="tag">${industry}</span>`).join('')}
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="btn btn--primary" onclick="closeProfileModal()">Send Invitation</button>
            <button class="btn btn--outline" onclick="closeProfileModal()">View Full Profile</button>
        </div>
    `;
}

// Admin access
function showAdminAccess() {
    const adminLink = document.querySelector('.admin-only');
    if (adminLink) {
        adminLink.style.display = 'block';
    }
    
    // Auto-navigate to admin dashboard for demo
    setTimeout(() => {
        showPage('admin-dashboard');
    }, 500);
}

// Form submission handling
document.addEventListener('submit', function(e) {
    if (e.target.closest('.signup-form')) {
        e.preventDefault();
        
        // Show success message
        const modalBody = document.querySelector('#signupModal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🎉</div>
                    <h3>Welcome to SPYN!</h3>
                    <p>Your account has been created successfully. You can now start exploring opportunities.</p>
                    <button class="btn btn--primary" onclick="closeSignupModal(); showPage('cofounder-dashboard');">Go to Dashboard</button>
                </div>
            `;
        }
    } else if (e.target.closest('#assessmentForm')) {
        e.preventDefault();
        showSurveyResults();
    }
});

// Update metrics with simulated real-time data
function updateMetrics() {
    const metrics = appData.backend_metrics.system_metrics;
    
    // Simulate small changes
    if (Math.random() > 0.7) {
        metrics.daily_active_users += Math.floor(Math.random() * 3) - 1;
        metrics.api_calls_24h += Math.floor(Math.random() * 100) - 50;
        
        // Update display if on admin dashboard
        if (currentPage === 'admin-dashboard') {
            // Refresh admin charts if needed
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});

// Initialize page on load
window.addEventListener('load', function() {
    // Animate counters after page loads
    setTimeout(animateCounters, 500);
});