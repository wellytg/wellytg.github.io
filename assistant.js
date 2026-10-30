/*
 * Resume assistant (rule-based, runs entirely in the browser).
 *
 * Ported from the visual-resume "ambassador" (lib/resume-profile/src/index.ts
 * and relevance.ts) to plain browser JavaScript. It is NOT an AI model: it
 * matches a question against fixed patterns and answers only with the facts
 * below, which are worded as in the October 2026 web resume
 * (assets/Wellington_Gwavava_Resume.pdf). It makes no network calls, uses no
 * API key and never echoes the question back as HTML.
 *
 * Loads as a classic <script> in the page (window.ResumeAssistant) and as a
 * CommonJS module under plain Node for tests (tests/assistant.test.mjs).
 */
(function (root) {
	'use strict';

	var RESUME_PDF = 'assets/Wellington_Gwavava_Resume.pdf';
	var RESUME_SOURCE = { title: 'Resume (PDF)', url: RESUME_PDF };

	var UNKNOWN_ANSWER = "I don't have verified information about that. This assistant answers only from Wellington's resume; the full resume is available as a PDF download.";
	var REFUSAL_PERSONAL = "I can't help with that. This assistant answers only from Wellington's resume. It does not cover salary or compensation, relocation, visa or work authorization, phone numbers, addresses or other personal details. Please raise those with Wellington directly.";
	var REFUSAL_INSTRUCTIONS = "I can't help with that. This assistant answers only questions about Wellington's resume, and it does not follow instructions placed inside a question.";

	// ---- Facts (resume wording) -------------------------------------------

	var projects = [
		{ id: 'lme', title: 'CISA LME Operational SOC Deployment (May 2025 - Aug 2025)', anchor: '#experience',
			text: "Delivered the full CISA LME stack in an operational SOC; the deployment was adopted as the SOC's operational standard. Wrote Python automation for multi-source log ingestion and configured Cribl Stream pipelines for routing, enrichment, and normalization across Windows and Linux endpoints. Built custom Elastic Stack dashboards for lateral movement and credential dumping detection, fed by Wazuh HIDS/EDR and Elastic Agent endpoint telemetry; worked with SentinelOne and Varonis. Validated detection rules against MITRE ATT&CK and MITRE D3FEND, and presented quantified findings to the CISO and SOC leadership.",
			matches: [/\b(?:cisa|lme|logging made easy)\b/i, /\bcribl\b/i, /\bwazuh\b/i, /\belastic\b/i, /\bdeployments?\b/i, /\buniversity soc\b/i] },
		{ id: 'task-analyzer', title: 'SOC-Job-Task-Analyzer', anchor: '#projects',
			text: 'SOC-Job-Task-Analyzer is an agentic LLM pipeline that extracts and classifies SOC analyst task duties from 49 job descriptions, with human-in-the-loop validation. It reached greater than 85 percent cross-model agreement as part of doctoral research on SOC goal incongruency. GitHub: github.com/wellytg/SOC-Job-Task-Analyzer',
			matches: [/\bsoc.job.task.analy[sz]er\b/i, /\bjob descriptions?\b/i, /\banalyst tasks?\b/i, /\bcross.model\b/i, /\bhuman.in.the.loop\b/i] },
		{ id: 'simulator', title: 'SOC Strategic Alignment Simulator and GCM Explorer (PhD research, 2024-Present)', anchor: '#projects',
			text: 'Research simulation of the SOC Speed-Quality Paradox; interactive Goal-Coherence Matrix for visualizing CISO-analyst goal misalignment; LLM Agreement Dashboard for cross-model validation. Live: wellytg.github.io/soc-paradox-sim',
			matches: [/\b(?:simulator|gcm|goal.coherence)\b/i, /\bspeed.quality\b/i] },
		{ id: 'sensei', title: 'Sensei: Multi-Agent AI Coaching Platform (Hacklahoma 2026, Feb 2026)', anchor: '#projects',
			text: 'Built and deployed a multi-agent AI coaching app in 22 hours as part of a 4-person team, using Claude Sonnet API (Coach and Reflection agents with tool-use loops), TanStack Start, Cloudflare Workers, D1/SQLite, Drizzle ORM, Google Calendar API, and Google OAuth. Devpost: devpost.com/software/project-sensei',
			matches: [/\bsensei\b/i, /\bmulti.agent\b/i, /\bhacklahoma\b/i] },
		{ id: 'digivault', title: 'DigiVault: Automated OSINT and Breach Analysis (Hurricane Hackathon 2026)', anchor: '#projects',
			text: 'Automated public profile construction and breach signal detection: real-time OSINT aggregation, exposure scoring, AI-powered recommendations via Claude API. Live: wellytg.github.io/digivault',
			matches: [/\b(?:digivault|osint)\b/i, /\bbreach\b/i] }
	];

	var experience = [
		{ id: 'exp-externship', org: 'tu', text: 'SOC Research Externship (Part-time), The University of Tulsa (Aug 2025 - Present). Investigate security events in a live university SOC and evaluate how well AI-augmented detection workflows support alert triage; track US-CERT and vendor advisories for situational awareness. Apply doctoral research on CISO-analyst strategic alignment in a live SOC environment.' },
		{ id: 'exp-soc', org: 'tu', text: "Security Operations Center Analyst, The University of Tulsa (May 2025 - Aug 2025, full-time SOC internship). Delivered the full CISA LME stack in an operational SOC; the deployment was adopted as the SOC's operational standard. Wrote Python automation for multi-source log ingestion and configured Cribl Stream pipelines; built custom Elastic Stack dashboards for lateral movement and credential dumping detection; validated detection rules against MITRE ATT&CK and MITRE D3FEND; presented quantified findings to the CISO and SOC leadership; authored installation guides, field dictionaries, and operational runbooks." },
		{ id: 'exp-gra', org: 'tu', text: 'Graduate Research Assistant and TU Cyber Fellow, The University of Tulsa (Aug 2023 - Present). Doctoral research on SOC goal incongruency, designing quantitative metrics that separate risk mitigated from activity volume. Dissertation adviser: Tyler Moore. Built SOC-Job-Task-Analyzer (greater than 85 percent cross-model agreement across 49 job descriptions). Published two peer-reviewed papers with Andrew Morin (Idaho National Labs) at Pre-ICIS/WISP 2025 and WOSOC/NDSS Symposium 2025; presented research at TU Research Day 2026.' },
		{ id: 'exp-hit', org: 'hit', text: 'Acting Department Chairperson and Lecturer, Harare Institute of Technology, Department of Computer Science (2012 - 2023), progressing from Teaching Assistant through Chairperson. Developed and delivered course materials for 18 subjects, including AI and Expert Systems, Neural Networks and Pattern Matching, Smartcard Cryptosystems, and Mobile Computing and Wireless Networks; supervised 2 MTech and 15 BTech research projects. As chair managing 10 faculty, launched 3 new degree programs (1 BTech, 2 MTech), digitized approximately 70 percent of departmental SOPs, and established an Industry Advisory Board of 8 experts.' }
	];

	var whyPoints = [
		'DEPLOYED: Deployed the full CISA Logging Made Easy (LME) stack in a live university SOC, where it was adopted as the operational standard. Set success criteria before deployment, automated repeatable security reporting in Python, and presented quantified findings to the CISO and SOC leadership.',
		'PUBLISHED: Two peer-reviewed papers with Andrew Morin at Pre-ICIS/WISP 2025 and WOSOC 2025 (co-located with NDSS Symposium). Doctoral research on SOC goal incongruency and goal-metric mapping.',
		'BUILDS AGENTIC AI SYSTEMS: Built SOC-Job-Task-Analyzer, an agentic LLM research pipeline with greater than 85 percent cross-model agreement across 49 SOC job descriptions and human-in-the-loop validation. Built and deployed Sensei, a multi-agent AI coaching app, in 22 hours as part of a 4-person team at Hacklahoma 2026.'
	];

	var skillGroups = {
		siem: 'Security Operations and SIEM: CISA LME (full stack operational deployment); Elastic Stack ELK; Cribl Stream (Certified Admin L2, pipeline configuration); Wazuh HIDS/EDR; SentinelOne (hands-on); Varonis (hands-on); Splunk (workshop-level: investigation searches, SPL); MITRE ATT&CK; MITRE D3FEND; NIST CSF; CIS Controls.',
		detection: 'Detection and Incident Response: Detection engineering and alerting workflows; multi-source log integration, enrichment, and normalization; incident triage and containment; threat hunting; endpoint alert monitoring and investigation; security metrics design and SOC governance; OSINT methodology and breach analysis.',
		ai: 'AI Security and Agentic Systems: Multi-agent AI architecture (Claude API); local LLM deployment (Ollama, DeepSeek-R1, Llama); LangChain (workshop-level, NVIDIA DLI: LCEL chains, structured outputs, tool-using agents); MCP (Model Context Protocol); LLM-assisted semantic analysis with human-in-the-loop validation; agentic workflow analysis and failure mode characterization; AI feedback loop design; prompt engineering for security use cases; audit trail and state verification design for agentic actions.',
		engineering: 'Engineering and Automation: Python (log ingestion and security reporting automation); TypeScript, JavaScript, React, TanStack Start, Node.js; Cloudflare Workers; Docker; Git; SQL; AWS Cloud; Linux; Windows Server; TCP/IP.'
	};

	var facts = projects.map(function (p) {
		return { id: p.id, title: p.title, anchor: p.anchor, text: p.title + '. ' + p.text, matches: p.matches };
	}).concat([
		{ id: 'research', title: 'Research', anchor: '#research',
			text: 'Doctoral research on SOC goal incongruency, designing quantitative metrics that separate risk mitigated from activity volume. Dissertation adviser: Tyler Moore. Expected completion: May 2027. Published papers, both with Andrew Morin: "Measuring Strategy Coherence in Security Operations Centers: A Goal-Metric Mapping Framework" (Pre-ICIS/WISP 2025) and "Mismatched SOCs: A Case Study of Cybersecurity Goal Incongruency Within An Academic SOC" (WOSOC 2025, co-located NDSS Symposium, San Diego). A third paper, "Beyond Measuring Busyness", is forthcoming at HICSS-60 (2027).',
			matches: [/\bresearch\b/i, /\bdissertation\b/i, /\bpapers?\b/i, /\bpubli(?:shed|cations?)\b/i, /\b(?:wisp|wosoc|ndss|hicss)\b/i, /\bgoal.metric\b/i, /\bphd topic\b/i] },
		{ id: 'target', title: 'Professional focus', anchor: '#home',
			text: 'SOC Analyst | Detection Engineer | AI Security Researcher | PhD Candidate, Cyber Studies. His working pattern is to build the system, observe what it actually does, optimize for desired outcomes.',
			matches: [/\btarget(?:ing)?\b/i, /\bheaded\b/i, /\blooking for\b/i, /\brole\b/i, /\bapproach\b/i] },
		{ id: 'education', title: 'Education', anchor: '#about',
			text: 'Doctor of Philosophy, Cyber Studies, The University of Tulsa (expected May 2027); SOC goal incongruency, quantitative security metrics design; adviser: Tyler Moore. Master of Technology, Computer Science, JNTUH College of Engineering Hyderabad. Bachelor of Technology, Computer Science, Harare Institute of Technology.',
			matches: [/\beducation\b/i, /\bdegrees?\b/i, /\bphd\b/i, /\bdoctorate\b/i, /\bmaster\b/i, /\bbachelor\b/i] },
		{ id: 'certifications', title: 'Certifications and training', anchor: '#skills',
			text: 'ISC2 Certified in Cybersecurity (CC), active through Aug 2028; Google Cybersecurity Professional Certificate V2 (2024; updated curriculum completed Jul 2026); Google AI Professional Certificate, 7-course specialization (Jul 2026); Cribl Certified Admin - Stream (Level 2); Cribl Certified User (Level 1); AI for App Deployment, Google (Aug 2026); Building LLM Applications With Prompt Engineering, NVIDIA Deep Learning Institute (Sep 2026); AWS Academy Graduate - Cloud Foundations - Training Badge (2022).',
			matches: [/\bcertifications?\b/i, /\bcertified\b/i, /\bcertificates?\b/i, /\bcredentials?\b/i] },
		{ id: 'skills', title: 'Skills', anchor: '#skills',
			text: [skillGroups.siem, skillGroups.detection, skillGroups.ai, skillGroups.engineering].join('\n'),
			matches: [/\bskills?\b/i, /\btoolset\b/i, /\bprogramming\b/i, /\blanguages\b/i, /\bpython\b/i, /\bsql\b/i, /\bcompetenc(?:y|ies)\b/i] },
		{ id: 'detection', title: 'Detection engineering', anchor: '#skills',
			text: [skillGroups.detection, skillGroups.siem,
				'In practice (SOC Analyst, May 2025 - Aug 2025): built custom Elastic Stack dashboards for lateral movement and credential dumping detection, fed by Wazuh HIDS/EDR and Elastic Agent endpoint telemetry, and validated detection rules against MITRE ATT&CK and MITRE D3FEND.'].join('\n'),
			matches: [/\bdetection\b/i] },
		{ id: 'identity', title: 'About Wellington', anchor: '#about',
			text: 'SOC analyst and detection engineer completing a PhD in Cyber Studies at the University of Tulsa, with operational SOC experience and published research on SOC goal incongruency and goal-metric mapping. Deployed the full CISA Logging Made Easy (LME) stack in a live university SOC, where it was adopted as the operational standard. Builds agentic AI systems for security work, from a multi-model LLM research pipeline to a multi-agent platform shipped in 22 hours at Hacklahoma 2026.',
			matches: [/\bwho is\b/i, /\bwho's\b/i, /\bbackground\b/i, /\babout (?:welly|him|wellington)\b/i] },
		{ id: 'contact', title: 'Contact', anchor: '#contact',
			text: 'Email: wellington-gwavava@utulsa.edu. LinkedIn: linkedin.com/in/wellingtongwavava. GitHub: github.com/wellytg. See the Get In Touch section of this page.',
			matches: [/\bcontact\b/i, /\breach\b/i, /\blinkedin\b/i, /\bget in touch\b/i, /\be-?mail\b/i] },
		{ id: 'experience', title: 'Experience', anchor: '#experience',
			text: experience.map(function (e) { return e.text; }).join('\n\n'),
			matches: [/\bexperience\b/i, /\bexternship\b/i, /\binternship\b/i, /\blecturer\b/i, /\bcareer\b/i, /\bwork history\b/i] },
		{ id: 'exp-hit', title: 'Harare Institute of Technology', anchor: '#experience',
			text: experience[3].text, matches: [/\b(?:harare|hit)\b/i] },
		{ id: 'exp-tu', title: 'The University of Tulsa', anchor: '#experience',
			text: experience.filter(function (e) { return e.org === 'tu'; }).map(function (e) { return e.text; }).join('\n\n'),
			matches: [/\b(?:university of tulsa|tu)\b/i] },
		{ id: 'leadership', title: 'Leadership', anchor: '#experience',
			text: 'As Acting Department Chairperson at Harare Institute of Technology, managed 10 faculty, launched 3 new degree programs (1 BTech, 2 MTech), digitized approximately 70 percent of departmental SOPs, and established an Industry Advisory Board of 8 experts; supervised 2 MTech and 15 BTech research projects. Secretary, ISC2 Tulsa Metro Chapter.',
			matches: [/\bleadership\b/i, /\b(?:led|lead|leads|leading)\b/i, /\bteams?\b/i, /\bmanag(?:e[ds]?|ing|er)\b/i, /\bchair(?:person)?\b/i, /\bsecretary\b/i, /\bsupervis\w*\b/i] }
	]);

	function factById(id) {
		for (var i = 0; i < facts.length; i++) { if (facts[i].id === id) return facts[i]; }
		return null;
	}

	// ---- Question intent (relevance.ts, widened) ----------------------------

	var subject = "(?:he|him|welly|wellington(?: (?:tatenda )?gwavava)?|the candidate|this candidate)";
	var owner = "(?:his|welly's|wellington(?: (?:tatenda )?gwavava)?'s|the candidate's)";
	var topic = "(?:background|career|professional experience|work experience|leadership experience|leadership|experience|research|doctoral research|papers?|publications?|education|degrees?|certifications?|certificates?|credentials|technical skills|skills|toolset|target role|approach|portfolio|contact information|email(?: address)?|ai projects?|agentic projects?|soc projects?|projects?|deployments?|strengths)";
	var bareTopic = "(?:background|career|professional experience|work experience|leadership experience|leadership|experience|research|publications|papers|education|certifications|skills|technical skills|projects|ai projects|contact|contact information)";
	var namedWork = "(?:soc.job.task.analy[sz]er|sensei|digivault|(?:soc strategic alignment )?simulator|(?:cisa )?(?:lme|logging made easy)(?: operational soc)?(?: deployment)?|goal.coherence matrix|gcm explorer)";
	var org = "(?:the )?(?:harare institute of technology|hit|university of tulsa|tu)";
	var area = "[a-z0-9 &/+.-]{2,60}";

	var intentPatterns = [
		new RegExp('^(?:who is|who\'s) ' + subject + '$', 'i'),
		new RegExp('^(?:tell me|what can you tell me) about ' + subject + '$', 'i'),
		new RegExp('^(?:what (?:is|are)|describe|explain|tell me about|summari[sz]e) ' + owner + ' ' + topic + '(?: about)?$', 'i'),
		new RegExp('^(?:what (?:is|are)|describe|tell me about) ' + owner + ' ' + topic + ' (?:in|for|with|around|related to) ' + area + '$', 'i'),
		new RegExp('^(?:what|which) ' + topic + ' (?:does|did|has) ' + subject + ' (?:have|hold|earn|earned|publish|published|build|built|complete|completed|lead|led)$', 'i'),
		new RegExp('^what role is ' + subject + ' (?:targeting|looking for|seeking)$', 'i'),
		new RegExp('^where(?: is|\'s) ' + subject + ' headed$', 'i'),
		new RegExp('^what (?:has|did) ' + subject + ' (?:build|built|deploy|deployed)(?: with cribl and elastic)?$', 'i'),
		new RegExp('^(?:tell me about|describe|explain|what (?:is|was)) (?:(?:the|his) )?' + namedWork + '$', 'i'),
		new RegExp('^(?:what|which) (?:google |cribl |aws |nvidia )?certifications? does ' + subject + ' hold$', 'i'),
		new RegExp('^(?:how can i (?:contact|reach)|how do i (?:contact|reach|get in touch with)) ' + subject + '$', 'i'),
		new RegExp('^(?:why (?:hire|choose)|why should (?:i|we) hire) ' + subject + '(?: for (?:a |an |the )?' + area + ')?$', 'i'),
		new RegExp('^why (?:is|would) ' + subject + ' (?:be )?(?:a |an )?(?:good |strong |great )?(?:fit|match) for (?:a |an |the )?' + area + '$', 'i'),
		new RegExp('^(?:is|would) ' + subject + ' (?:be )?(?:a |an )?(?:good |strong )?(?:fit|match) for (?:a |an |the )?' + area + '$', 'i'),
		new RegExp('^(?:has|did|does|have) ' + subject + ' (?:ever )?(?:led|lead|managed?|supervised?)(?: a| any)? (?:teams?|people|staff|faculty|groups?|projects?)$', 'i'),
		new RegExp('^(?:does|has) ' + subject + ' have (?:any )?' + topic + '$', 'i'),
		new RegExp('^(?:does|has) ' + subject + ' have (?:any )?(?:experience|skills) (?:in|with) ' + area + '$', 'i'),
		new RegExp('^what (?:did|does|has) ' + subject + ' (?:do|done|work on|worked on|teach|taught|accomplish(?:ed)?) (?:at|in|for) ' + org + '$', 'i'),
		new RegExp('^(?:tell me about|describe) ' + owner + ' (?:time|work|role) at ' + org + '$', 'i'),
		new RegExp('^' + bareTopic + '$', 'i'),
		/^(?:which project best fits detection engineering|list (?:his |welly's |wellington's )?(?:ai )?projects)$/i,
		/^why (?:welly|wellington)$/i
	];

	function normalize(question) {
		return String(question).trim()
			.replace(/[‘’]/g, "'")
			.replace(/[?!.,]+$/, '')
			.replace(/\s+/g, ' ');
	}

	function hasResumeQuestionIntent(question) {
		var q = normalize(question);
		return intentPatterns.some(function (p) { return p.test(q); });
	}

	// ---- Refusals (checked before anything else) ----------------------------

	var personalPattern = /\b(?:phone|telephone|mobile number|cell(?:phone)?|whatsapp|street|home address|mailing address|location|located|lives?|living|salary|salaries|pay|paid|compensation|wages?|expected rate|hourly rate|visa|relocat\w*|work authori[sz]ation|authori[sz]ed to work|sponsor\w*|citizenship|immigration|green card|personal (?:details|information|life)|birthday|date of birth|age|married|marital|family|kids|children|religion|nationality|ssn|social security|password|secrets?)\b/i;
	var injectionPattern = /\b(?:ignore|disregard|override|bypass|pretend|fabricate|invent|make up|reveal|system prompt|developer message|previous instructions|prior instructions|your instructions|act as|you are now|roleplay|role-play|jailbreak|follow these instructions|confirm that|say that|state that)\b/i;
	var offTopicPattern = /\b(?:search|browse|visit|fetch|scrape|look up|look online|weather|football|recipe|bitcoin|stock price|worked at google|worked at mandiant|detection rate|improved detection|percentage improvement|accuracy rate)\b/i;

	function refusal(text) {
		return { answer: text, supported: false, refused: true, factIds: [], sources: [RESUME_SOURCE] };
	}

	function unknown() {
		return { answer: UNKNOWN_ANSWER, supported: false, refused: false, factIds: [], sources: [RESUME_SOURCE] };
	}

	function answerFromFactIds(ids, lead) {
		var seen = {};
		var selected = [];
		ids.forEach(function (id) {
			if (seen[id]) return;
			seen[id] = true;
			var f = factById(id);
			if (f) selected.push(f);
		});
		selected = selected.slice(0, 3);
		if (!selected.length) return unknown();
		var parts = selected.map(function (f) { return f.text; });
		if (lead) parts.unshift(lead);
		return {
			answer: parts.join('\n\n'),
			supported: true,
			refused: false,
			factIds: selected.map(function (f) { return f.id; }),
			sources: [RESUME_SOURCE].concat(selected.map(function (f) { return { title: f.title, url: f.anchor }; }))
		};
	}

	/** Answer a recruiter question from the resume facts only. Pure function, no I/O. */
	function answerQuestion(question) {
		if (typeof question !== 'string') return unknown();
		var q = normalize(question);
		if (!q || q.length > 500) return unknown();

		if (injectionPattern.test(q)) return refusal(REFUSAL_INSTRUCTIONS);
		if (personalPattern.test(q) || (/\baddress\b/i.test(q) && !/\be-?mail\b/i.test(q))) return refusal(REFUSAL_PERSONAL);
		if (offTopicPattern.test(q)) return unknown();
		if (!hasResumeQuestionIntent(q)) return unknown();

		// Fit / why-hire questions: list the relevant resume evidence; no opinions.
		if (/\b(?:why (?:welly|wellington|hire|choose)|why should|what makes|best fit|fit for|match for)\b/i.test(q)) {
			var why = {
				answer: 'Here is what the resume shows:\n\n' + whyPoints.join('\n\n'),
				supported: true, refused: false, factIds: ['why'],
				sources: [RESUME_SOURCE, { title: 'Experience', url: '#experience' }, { title: 'Projects', url: '#projects' }]
			};
			if (/\bdetection\b/i.test(q)) {
				var det = factById('detection');
				why.answer += '\n\n' + det.text;
				why.factIds.push('detection');
				why.sources.push({ title: det.title, url: det.anchor });
			}
			return why;
		}

		// "What did he do at <organisation>?"
		if (/\b(?:harare|hit)\b/i.test(q)) return answerFromFactIds(['exp-hit']);
		if (/\b(?:university of tulsa|tu)\b/i.test(q) && /\b(?:do|done|work|worked|role|time)\b/i.test(q)) return answerFromFactIds(['exp-tu']);

		if (/\b(?:ai projects?|agentic projects?)\b/i.test(q)) return answerFromFactIds(['task-analyzer', 'sensei', 'digivault']);

		// A named project takes priority over general keywords.
		var named = projects.filter(function (p) { return p.matches[0].test(q); }).map(function (p) { return p.id; });
		if (named.length) return answerFromFactIds(named);

		if (factById('leadership').matches.some(function (m) { return m.test(q); })) return answerFromFactIds(['leadership']);
		if (/\bdetection\b/i.test(q)) return answerFromFactIds(['detection']);
		if (factById('contact').matches.some(function (m) { return m.test(q); })) return answerFromFactIds(['contact']);

		var hits = facts.filter(function (f) {
			return f.id !== 'detection' && f.id !== 'exp-hit' && f.id !== 'exp-tu' && f.matches.some(function (m) { return m.test(q); });
		}).map(function (f) { return f.id; });
		return answerFromFactIds(hits);
	}

	var suggestions = [
		'Has Wellington led a team?',
		'Why is Wellington a fit for a detection engineering role?',
		"What are Wellington's skills in detection engineering?",
		'What did Wellington do at Harare Institute of Technology?',
		"What is Wellington's research?",
		'Tell me about SOC-Job-Task-Analyzer'
	];

	var api = {
		answer: answerQuestion,
		hasResumeQuestionIntent: hasResumeQuestionIntent,
		facts: facts,
		suggestions: suggestions,
		RESUME_PDF: RESUME_PDF,
		UNKNOWN_ANSWER: UNKNOWN_ANSWER
	};

	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	root.ResumeAssistant = api;

	// ---- Page wiring (browser only) -----------------------------------------

	function isSafeHref(url) {
		return url.charAt(0) === '#' || url === RESUME_PDF;
	}

	function render(container, result) {
		while (container.firstChild) container.removeChild(container.firstChild);
		var text = document.createElement('p');
		text.className = 'assistant-answer-text' + (result.supported ? '' : ' assistant-answer-text--muted');
		text.textContent = result.answer;
		container.appendChild(text);
		var links = result.sources.filter(function (s) { return isSafeHref(s.url); });
		if (links.length) {
			var label = document.createElement('p');
			label.className = 'assistant-sources-label';
			label.textContent = 'Sources:';
			container.appendChild(label);
			var list = document.createElement('div');
			list.className = 'assistant-sources';
			links.forEach(function (s) {
				var a = document.createElement('a');
				a.href = s.url;
				a.textContent = s.title;
				a.className = 'tech-tag';
				if (s.url === RESUME_PDF) a.setAttribute('download', '');
				list.appendChild(a);
			});
			container.appendChild(list);
		}
	}

	function init() {
		var form = document.getElementById('assistant-form');
		var input = document.getElementById('assistant-input');
		var output = document.getElementById('assistant-answer');
		var chips = document.getElementById('assistant-suggestions');
		if (!form || !input || !output) return;

		function ask(question) {
			input.value = question;
			render(output, answerQuestion(question));
		}

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (input.value.trim()) ask(input.value);
		});

		if (chips) {
			suggestions.forEach(function (s) {
				var b = document.createElement('button');
				b.type = 'button';
				b.className = 'btn btn--outline btn--sm';
				b.textContent = s;
				b.addEventListener('click', function () { ask(s); });
				chips.appendChild(b);
			});
		}
	}

	if (typeof document !== 'undefined') {
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
		else init();
	}
})(typeof window !== 'undefined' ? window : globalThis);
