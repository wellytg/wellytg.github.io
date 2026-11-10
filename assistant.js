/*
 * Resume assistant v2 (rule-based, runs entirely in the browser).
 *
 * It is NOT an AI model. It matches a question against topic keyword sets
 * (with synonyms, light stemming and typo tolerance) plus a simple similarity
 * score against example questions, then answers only with the fixed text in
 * TOPICS below. Each topic has several phrasings, used in turn, and a few
 * follow-up suggestions.
 *
 * Grounding: every topic lists `refs` into the canonical skills register
 * (07_Job_Application_Pipeline master_skill_register_v2_24.json, read-only)
 * and is worded from the October 2026 web resume
 * (assets/Wellington_Gwavava_Resume.pdf) where the resume covers it.
 * `onResume: false` marks topics drawn from the register only. Skill-gap
 * topics (kind "gap") say plainly that the item is on the learning roadmap
 * and name the closest real experience; "not-claimed" topics follow the
 * register's do_not_claim list.
 *
 * Privacy: no network calls, no API key, no storage; output is rendered with
 * textContent only. No visitor question leaves the page.
 *
 * Extension point: resolveAnswer() is the single adapter between the page
 * and the answering engine. A later API-backed option would replace its body
 * and must return the same result shape. Nothing of that is built here.
 *
 * Loads as a classic <script> (window.ResumeAssistant) and as a CommonJS
 * module under plain Node for tests (tests/assistant.test.mjs).
 */
(function (root) {
	'use strict';

	var RESUME_PDF = 'assets/Wellington_Gwavava_Resume.pdf';
	var EMAIL = 'wellington-gwavava@utulsa.edu';
	var RESUME_SOURCE = { title: 'Resume (PDF)', url: RESUME_PDF };
	var CONTACT_SOURCE = { title: 'Contact', url: '#contact' };

	var UNKNOWN_ANSWER = "I don't have verified information about that. I answer only from Wellington's resume and skills record, so for anything else please download the full resume (PDF) or email him at " + EMAIL + ".";
	var REFUSAL_PERSONAL = "I can't help with that one. I don't cover salary or compensation, relocation, visa, work authorization or clearance status, phone numbers, home addresses or other personal details. Please raise those with Wellington directly by email (" + EMAIL + ").";
	var REFUSAL_INSTRUCTIONS = "I can't help with that. I only answer questions about Wellington's resume, and I don't follow instructions placed inside a question.";

	var DEFAULT_FOLLOWUPS = ['Has Wellington led a team?', 'What has he deployed?', 'What AI projects has he built?'];

	// ---- Shared resume wording ------------------------------------------------

	var WHY_POINTS = [
		'DEPLOYED: Deployed the full CISA Logging Made Easy (LME) stack in a live university SOC, where it was adopted as the operational standard. Set success criteria before deployment, automated repeatable security reporting in Python, and presented quantified findings to the CISO and SOC leadership.',
		'PUBLISHED: Two peer-reviewed papers with Andrew Morin at Pre-ICIS/WISP 2025 and WOSOC 2025 (co-located with NDSS Symposium). Doctoral research on SOC goal incongruency and goal-metric mapping.',
		'BUILDS AGENTIC AI SYSTEMS: Built SOC-Job-Task-Analyzer, an agentic LLM research pipeline with greater than 85 percent cross-model agreement across 49 SOC job descriptions and human-in-the-loop validation. Built and deployed Sensei, a multi-agent AI coaching app, in 22 hours as part of a 4-person team at Hacklahoma 2026.'
	];

	var SKILLS_SIEM = 'Security Operations and SIEM: CISA LME (full stack operational deployment); Elastic Stack ELK; Cribl Stream (Certified Admin L2, pipeline configuration); Wazuh HIDS/EDR; SentinelOne (hands-on); Varonis (hands-on); Splunk (workshop-level: investigation searches, SPL); MITRE ATT&CK; MITRE D3FEND; NIST CSF; CIS Controls.';
	var SKILLS_DETECTION = 'Detection and Incident Response: Detection engineering and alerting workflows; multi-source log integration, enrichment, and normalization; incident triage and containment; threat hunting; endpoint alert monitoring and investigation; security metrics design and SOC governance; OSINT methodology and breach analysis.';
	var SKILLS_AI = 'AI Security and Agentic Systems: Multi-agent AI architecture (Claude API); local LLM deployment (Ollama, DeepSeek-R1, Llama); LangChain (workshop-level, NVIDIA DLI: LCEL chains, structured outputs, tool-using agents); MCP (Model Context Protocol); LLM-assisted semantic analysis with human-in-the-loop validation; agentic workflow analysis and failure mode characterization; AI feedback loop design; prompt engineering for security use cases; audit trail and state verification design for agentic actions.';
	var SKILLS_ENGINEERING = 'Engineering and Automation: Python (log ingestion and security reporting automation); TypeScript, JavaScript, React, TanStack Start, Node.js; Cloudflare Workers; Docker; Git; SQL; AWS Cloud; Linux; Windows Server; TCP/IP.';

	var EXP_SOC = "Security Operations Center Analyst, The University of Tulsa (May 2025 - Aug 2025, full-time SOC internship). Delivered the full CISA LME stack in an operational SOC; the deployment was adopted as the SOC's operational standard. Wrote Python automation for multi-source log ingestion and configured Cribl Stream pipelines; built custom Elastic Stack dashboards for lateral movement and credential dumping detection; validated detection rules against MITRE ATT&CK and MITRE D3FEND; presented quantified findings to the CISO and SOC leadership; authored installation guides, field dictionaries, and operational runbooks.";
	var EXP_EXTERN = 'SOC Research Externship (Part-time), The University of Tulsa (Aug 2025 - Present). Investigate security events in a live university SOC and evaluate how well AI-augmented detection workflows support alert triage; track US-CERT and vendor advisories for situational awareness. Apply doctoral research on CISO-analyst strategic alignment in a live SOC environment.';
	var EXP_GRA = 'Graduate Research Assistant and TU Cyber Fellow, The University of Tulsa (Aug 2023 - Present). Doctoral research on SOC goal incongruency, designing quantitative metrics that separate risk mitigated from activity volume. Dissertation adviser: Tyler Moore. Built SOC-Job-Task-Analyzer (greater than 85 percent cross-model agreement across 49 job descriptions). Published two peer-reviewed papers with Andrew Morin (Idaho National Labs) at Pre-ICIS/WISP 2025 and WOSOC/NDSS Symposium 2025; presented research at TU Research Day 2026.';
	var EXP_HIT = 'Acting Department Chairperson and Lecturer, Harare Institute of Technology, Department of Computer Science (2012 - 2023), progressing from Teaching Assistant through Chairperson. Developed and delivered course materials for 18 subjects, including AI and Expert Systems, Neural Networks and Pattern Matching, Smartcard Cryptosystems, and Mobile Computing and Wireless Networks; supervised 2 MTech and 15 BTech research projects. As chair managing 10 faculty, launched 3 new degree programs (1 BTech, 2 MTech), digitized approximately 70 percent of departmental SOPs, and established an Industry Advisory Board of 8 experts.';

	// ---- Topics -----------------------------------------------------------------
	// keys: [term, weight]; a multi-word term matches when all its words appear.
	// examples: sample questions for the similarity score.
	// say: phrasings, used in turn. more: optional deeper answer for "tell me more".
	// next: follow-up suggestions (each must itself resolve to an answer; tested).

	var TOPICS = [
		// -- Who he is ---------------------------------------------------------
		{ id: 'about', kind: 'fact', title: 'About Wellington', anchor: '#about', onResume: true,
			keys: [['who', 2], ['about', 1], ['background', 2], ['summary', 2], ['overview', 2], ['introduce', 2], ['profile', 2], ['candidate', 1]],
			examples: ['who is wellington', 'tell me about wellington', 'give me a quick summary of his background', 'introduce him'],
			say: [
				'Wellington Gwavava is a SOC analyst and detection engineer completing a PhD in Cyber Studies at The University of Tulsa (expected May 2027). He deployed the full CISA Logging Made Easy (LME) stack in a live university SOC, where it was adopted as the operational standard, and he builds agentic AI systems for security work. His working pattern: build the system, observe what it actually does, optimize for desired outcomes.',
				'In short: SOC operations, detection engineering and AI security research. He has hands-on SOC experience at The University of Tulsa, two peer-reviewed papers on SOC goal incongruency, and a habit of building tools, from a multi-model LLM research pipeline to a multi-agent app shipped in 22 hours at Hacklahoma 2026. Before Tulsa he spent 2012 - 2023 at Harare Institute of Technology, ending as Acting Department Chairperson.',
				'His headline is SOC Analyst | Detection Engineer | AI Security Researcher | PhD Candidate, Cyber Studies. The through-line is measurement: he builds a system, observes what it actually does, and optimizes for the outcome the organization wants, whether that is a SIEM deployment, a research metric or an AI agent.'
			],
			next: ['What has he deployed?', 'Has he led a team?', 'What is his research about?'],
			refs: ['resume_notes.approved_headline', 'resume_notes.approved_kicker', 'projects:CISA Logging Made Easy', 'education:Doctor of Philosophy'] },

		{ id: 'location', kind: 'fact', title: 'Location', anchor: '#about', onResume: true,
			keys: [['location', 4], ['located', 4], ['based', 3], ['live', 3], ['where', 1], ['city', 3], ['tulsa', 1], ['oklahoma', 2], ['area', 1]],
			examples: ['where is he based', 'where is he located', 'what city does he live in', 'where does wellington live'],
			say: ['Wellington is based in Tulsa, OK.', 'He is in Tulsa, OK, where he works and studies at The University of Tulsa.', 'Tulsa, OK.'],
			next: ['How can I contact him?', 'What does he do at The University of Tulsa?'],
			refs: ['identity.location'] },

		{ id: 'contact', kind: 'fact', title: 'Contact', anchor: '#contact', onResume: true,
			keys: [['contact', 4], ['reach', 3], ['email', 4], ['mail', 2], ['linkedin', 4], ['github', 3], ['get in touch', 4], ['connect', 2], ['message', 1]],
			examples: ['how can i contact him', 'what is his email', 'how do i reach wellington', 'is he on linkedin'],
			say: [
				'The best way to reach him is email: ' + EMAIL + '. He is also on LinkedIn (linkedin.com/in/wellingtongwavava) and GitHub (github.com/wellytg).',
				'Send an email to ' + EMAIL + ', or connect on LinkedIn at linkedin.com/in/wellingtongwavava. His code is at github.com/wellytg.'
			],
			next: ['Can I download his resume?', 'Where is he based?'],
			refs: ['identity.linkedin', 'digital_presence'] },

		{ id: 'resume', kind: 'fact', title: 'Resume', anchor: '#home', onResume: true,
			keys: [['resume', 4], ['cv', 4], ['pdf', 3], ['download', 3], ['curriculum vitae', 4]],
			examples: ['can i download his resume', 'where is his cv', 'do you have a pdf resume'],
			say: [
				'Yes. The full resume is a 2-page PDF: use the Resume (PDF) link below, or the Download Resume button at the top of this page.',
				'Sure, the Resume (PDF) link below downloads it. It is the same document every answer here is drawn from.'
			],
			next: ['What is his experience?', 'How can I contact him?'],
			refs: ['digital_presence.website'] },

		// -- Experience -----------------------------------------------------------
		{ id: 'experience', kind: 'fact', title: 'Experience', anchor: '#experience', onResume: true,
			keys: [['experience', 3], ['work history', 4], ['career', 3], ['job', 2], ['role', 1], ['position', 2], ['employment', 3], ['worked', 2], ['work', 1]],
			examples: ['what is his experience', 'walk me through his career', 'what jobs has he had', 'what is his work history'],
			say: [
				'Four roles stand out on his resume:\n- SOC Research Externship, The University of Tulsa (Aug 2025 - Present)\n- Security Operations Center Analyst, The University of Tulsa (May 2025 - Aug 2025)\n- Graduate Research Assistant and TU Cyber Fellow, The University of Tulsa (Aug 2023 - Present)\n- Acting Department Chairperson and Lecturer, Harare Institute of Technology (2012 - 2023)',
				'He is currently a SOC Research Extern and a Graduate Research Assistant and TU Cyber Fellow at The University of Tulsa. In summer 2025 he worked full time as a SOC Analyst there and delivered the CISA LME deployment the SOC adopted as its standard. Before that, 2012 - 2023, he was at Harare Institute of Technology, rising from Teaching Assistant to Acting Department Chairperson.'
			],
			more: [EXP_EXTERN, EXP_SOC, EXP_GRA, EXP_HIT].join('\n\n'),
			next: ['What did he do as a SOC analyst?', 'What did he do at Harare Institute of Technology?', 'How many years of experience does he have?'],
			refs: ['experience:Graduate Research Assistant', 'experience:SOC Research Externship', 'experience:Security Operations Center Analyst', 'experience:Acting Chairperson'] },

		{ id: 'soc-role', kind: 'fact', title: 'SOC Analyst and the CISA LME deployment', anchor: '#experience', onResume: true,
			keys: [['soc analyst', 5], ['soc', 2], ['internship', 3], ['security operations', 4], ['lme', 5], ['cisa', 5], ['logging made easy', 5], ['deployed', 3], ['deploy', 2], ['operational', 2], ['university soc', 4], ['ciso', 2]],
			examples: ['what did he do as a soc analyst', 'tell me about his soc work', 'what has he deployed', 'tell me about the cisa lme deployment', 'what is his background in security operations'],
			say: [
				EXP_SOC,
				"His biggest operational result: as a full-time SOC Analyst at The University of Tulsa (May 2025 - Aug 2025) he delivered the full CISA LME stack, and the SOC adopted it as its operational standard. That meant Python automation for multi-source log ingestion, Cribl Stream pipelines for routing, enrichment and normalization across Windows and Linux endpoints, and Elastic Stack dashboards for lateral movement and credential dumping detection fed by Wazuh and Elastic Agent telemetry. He validated the detection rules against MITRE ATT&CK and MITRE D3FEND and presented quantified findings to the CISO and SOC leadership."
			],
			next: ['What SIEM tools has he used?', 'What is the SOC Research Externship?', 'Why is he a fit for detection engineering?'],
			refs: ['experience:Security Operations Center Analyst', 'projects:CISA Logging Made Easy', 'skills.cybersecurity_direct:CISA Logging Made Easy'] },

		{ id: 'externship', kind: 'fact', title: 'SOC Research Externship', anchor: '#experience', onResume: true,
			keys: [['externship', 5], ['extern', 5], ['current role', 4], ['currently', 2], ['right now', 3], ['now', 1], ['part time', 3], ['triage', 2]],
			examples: ['what is the soc research externship', 'what is he doing now', 'what is his current role'],
			say: [
				EXP_EXTERN,
				'Right now he is a part-time SOC Research Extern at The University of Tulsa (since Aug 2025): he investigates security events in the live university SOC and evaluates how well AI-augmented detection workflows support alert triage, alongside his doctoral research and his role as Graduate Research Assistant and TU Cyber Fellow.'
			],
			next: ['What is his research about?', 'Does he do threat hunting?'],
			refs: ['experience:SOC Research Externship'] },

		{ id: 'tu', kind: 'fact', title: 'The University of Tulsa', anchor: '#experience', onResume: true,
			keys: [['university of tulsa', 6], ['tulsa', 3], ['tu', 4], ['cyber fellow', 6], ['graduate research assistant', 6], ['research assistant', 5], ['gra', 5]],
			examples: ['what does he do at the university of tulsa', 'what is his role at tu', 'what is the tu cyber fellow role'],
			say: [
				[EXP_GRA, EXP_EXTERN].join('\n\n'),
				'At The University of Tulsa he holds two current roles: Graduate Research Assistant and TU Cyber Fellow (since Aug 2023), doing doctoral research on SOC goal incongruency under Tyler Moore, and SOC Research Extern (since Aug 2025) in the live university SOC. In summer 2025 he was a full-time SOC Analyst there and delivered the CISA LME deployment.'
			],
			next: ['What is his research about?', 'What did he do as a SOC analyst?'],
			refs: ['experience:Graduate Research Assistant', 'experience:SOC Research Externship', 'experience:Security Operations Center Analyst'] },

		{ id: 'hit', kind: 'fact', title: 'Harare Institute of Technology', anchor: '#experience', onResume: true,
			keys: [['harare', 5], ['hit', 4], ['zimbabwe', 4], ['lecturer', 4], ['lecture', 3], ['taught', 3], ['teaching', 3], ['academia', 3], ['professor', 3], ['chairperson', 3], ['department', 2]],
			examples: ['what did wellington do at harare institute of technology', 'tell me about his teaching career', 'what did he teach', 'what was his role in zimbabwe'],
			say: [
				EXP_HIT,
				'At Harare Institute of Technology (2012 - 2023) he rose from Teaching Assistant to Lecturer to Acting Department Chairperson in Computer Science. He taught 18 subjects, among them AI and Expert Systems, Neural Networks and Pattern Matching and Smartcard Cryptosystems, and supervised 2 MTech and 15 BTech projects. As chair he managed 10 faculty, launched 3 new degree programs and set up an Industry Advisory Board of 8 experts.'
			],
			next: ['Has he led a team?', 'Is he a good mentor?'],
			refs: ['experience:Acting Chairperson', 'experience:Lecturer', 'skills.academic_teaching:Lecture Delivery'] },

		{ id: 'leadership', kind: 'fact', title: 'Leadership', anchor: '#experience', onResume: true,
			keys: [['lead', 4], ['team', 2], ['manag', 3], ['supervis', 3], ['chair', 3], ['people', 2], ['staff', 2], ['faculty', 2], ['example', 1], ['boss', 2], ['direct reports', 3]],
			examples: ['has wellington led a team', 'leadership experience', 'has he managed people', 'give one example of leadership', 'has he supervised staff'],
			say: [
				'As Acting Department Chairperson at Harare Institute of Technology for two years (Jul 2021 - Jul 2023), managed 10 faculty, launched 3 new degree programs (1 BTech, 2 MTech), digitized approximately 70 percent of departmental SOPs, and established an Industry Advisory Board of 8 experts; supervised 2 MTech and 15 BTech research projects. Secretary, ISC2 Tulsa Metro Chapter.',
				'Yes. The clearest example: as Acting Department Chairperson at Harare Institute of Technology (Jul 2021 - Jul 2023) he managed 10 faculty and launched 3 new degree programs. More recently he built Sensei as part of a 4-person team at Hacklahoma 2026, and he serves as Secretary of the ISC2 Tulsa Metro Chapter.',
				'He has led at department level and in the community. As Acting Department Chairperson he managed 10 faculty, digitized about 70 percent of departmental SOPs and established an 8-member Industry Advisory Board. In Tulsa he is Secretary of the ISC2 Tulsa Metro Chapter and Event Coordinator on the TU Graduate Student Association executive.'
			],
			next: ['What did he do at Harare Institute of Technology?', 'Is he a team player?', 'Is he a good communicator?'],
			refs: ['skills.leadership_management:Faculty Management', 'experience:Acting Chairperson', 'achievements_extracurricular:ISC2 Tulsa Metro Chapter', 'achievements_extracurricular:Event Coordinator'] },

		{ id: 'years', kind: 'fact', title: 'Experience timeline', anchor: '#experience', onResume: true,
			keys: [['years', 4], ['how long', 4], ['how many', 2], ['seniority', 4], ['senior', 3], ['junior', 3], ['level', 2], ['timeline', 3]],
			examples: ['how many years of experience does he have', 'how long has he worked in security', 'how senior is he'],
			say: [
				'Rather than a single number, here are the dates from his resume: security operations at The University of Tulsa since May 2025 (SOC Analyst, then the current SOC Research Externship); doctoral research since Aug 2023; and 2012 - 2023 at Harare Institute of Technology, from Teaching Assistant to Acting Department Chairperson.',
				'By date: hands-on SOC work since May 2025, research at The University of Tulsa since Aug 2023, and an academic computer science career at Harare Institute of Technology from 2012 to 2023, the last two years as Acting Department Chairperson.'
			],
			next: ['What did he do as a SOC analyst?', 'Has he led a team?'],
			refs: ['experience:Security Operations Center Analyst', 'experience:Graduate Research Assistant', 'experience:Teaching Assistant'] },

		{ id: 'availability', kind: 'fact', title: 'Availability', anchor: '#contact', onResume: true,
			keys: [['available', 4], ['availability', 4], ['start date', 5], ['start', 2], ['graduate', 3], ['graduation', 4], ['finish', 2], ['when', 1], ['full time', 2]],
			examples: ['when is he available', 'when does he graduate', 'when can he start'],
			say: [
				'His PhD is expected in May 2027. For start dates and availability, please ask Wellington directly at ' + EMAIL + '.',
				'He expects to complete his PhD in May 2027; anything about start dates is best confirmed with him by email (' + EMAIL + ').'
			],
			next: ['What is his education?', 'How can I contact him?'],
			refs: ['education:Doctor of Philosophy'] },

		// -- Security skills --------------------------------------------------------
		{ id: 'detection', kind: 'fact', title: 'Detection engineering', anchor: '#skills', onResume: true,
			keys: [['detection', 5], ['detect', 4], ['detection engineering', 6], ['rule', 2], ['alerting', 3], ['use case', 3], ['lateral movement', 4], ['credential dumping', 4]],
			examples: ['what are his skills in detection engineering', 'does he write detection rules', 'what detection work has he done'],
			say: [
				[SKILLS_DETECTION, SKILLS_SIEM, 'In practice (SOC Analyst, May 2025 - Aug 2025): built custom Elastic Stack dashboards for lateral movement and credential dumping detection, fed by Wazuh HIDS/EDR and Elastic Agent endpoint telemetry, and validated detection rules against MITRE ATT&CK and MITRE D3FEND.'].join('\n'),
				'Detection engineering is the core of his SOC work. During the CISA LME deployment he built Elastic Stack dashboards for lateral movement and credential dumping detection, fed by Wazuh HIDS/EDR and Elastic Agent telemetry, configured alerting workflows, and validated the detection rules against MITRE ATT&CK and MITRE D3FEND. Upstream, he handles multi-source log integration, enrichment and normalization with Cribl Stream; around it, threat hunting and incident triage.'
			],
			next: ['What SIEM tools has he used?', 'Does he do threat hunting?', 'Which frameworks does he use?'],
			refs: ['skills.cybersecurity_direct:Detection Engineering', 'skills.cybersecurity_direct:Lateral Movement and Credential Dumping Detection', 'skills.cybersecurity_direct:MITRE D3FEND'] },

		{ id: 'siem', kind: 'fact', title: 'SIEM and security tools', anchor: '#skills', onResume: true,
			keys: [['siem', 5], ['elastic', 4], ['elk', 4], ['kibana', 4], ['cribl', 5], ['wazuh', 5], ['elastic agent', 4], ['sentinelone', 5], ['varonis', 5], ['defender', 4], ['edr', 4], ['xdr', 4], ['tool', 2], ['stack', 2], ['log', 2], ['pipeline', 2]],
			examples: ['what siem tools has he used', 'does he know elastic', 'what security tools does he use', 'experience with wazuh'],
			say: [
				SKILLS_SIEM,
				'His hands-on stack: Elastic Stack (ELK) with Cribl Stream pipelines (he is a Cribl Certified Admin, Level 2), Wazuh HIDS/EDR and Elastic Agent for endpoint telemetry, all inside the CISA LME deployment he delivered. He has also worked hands-on with SentinelOne and Varonis, and ran Microsoft 365 Defender as a parallel test system alongside the production Wazuh/LME deployment. Splunk is workshop-level.'
			],
			next: ['Why is he a fit for detection engineering?', 'Does he know Splunk?', 'Does he have Microsoft Sentinel experience?'],
			refs: ['skills.cybersecurity_direct:Cribl Stream', 'skills.cybersecurity_direct:Elastic Stack', 'skills.cybersecurity_direct:Wazuh', 'skills.cybersecurity_direct:SentinelOne', 'skills.cybersecurity_direct:Varonis', 'skills.cybersecurity_direct:Microsoft 365 Defender'] },

		{ id: 'hunting', kind: 'fact', title: 'Threat hunting and incident response', anchor: '#skills', onResume: true,
			keys: [['threat hunting', 6], ['hunt', 4], ['incident response', 6], ['incident', 3], ['ir', 2], ['triage', 3], ['containment', 4], ['investigat', 3], ['alert', 2], ['endpoint', 2], ['threat intelligence', 4], ['cti', 4], ['advisories', 3]],
			examples: ['does he do threat hunting', 'what incident response experience does he have', 'what tools has he used for threat hunting', 'can he triage alerts'],
			say: [
				'Threat hunting, incident triage and containment, and endpoint alert monitoring and investigation are part of his SOC work at The University of Tulsa, first in the SOC Analyst internship and now in the SOC Research Externship. His tooling there: Elastic Stack, Wazuh HIDS/EDR, Elastic Agent and SentinelOne. He also tracks US-CERT and vendor advisories for situational awareness.',
				'Yes. In the live university SOC he investigates security events and triages alerts, and he evaluates how well AI-augmented detection workflows support that triage. Threat hunting, containment and endpoint investigation are listed core skills, backed by the Elastic, Wazuh and SentinelOne work from his SOC roles.'
			],
			next: ['What SIEM tools has he used?', 'Has he done malware analysis?'],
			refs: ['skills.cybersecurity_direct:Threat Hunting', 'skills.cybersecurity_direct:Incident triage and containment', 'skills.cybersecurity_direct:Endpoint alert monitoring'] },

		{ id: 'frameworks', kind: 'fact', title: 'Frameworks', anchor: '#skills', onResume: true,
			keys: [['mitre', 5], ['attack', 3], ['d3fend', 5], ['nist', 4], ['csf', 4], ['cis control', 5], ['framework', 4]],
			examples: ['which frameworks does he use', 'does he know mitre att&ck', 'experience with nist csf'],
			say: [
				'He works with MITRE ATT&CK and MITRE D3FEND (he validated detection rules against both during the CISA LME deployment), plus the NIST Cybersecurity Framework and CIS Controls.',
				'MITRE ATT&CK and D3FEND for detection coverage, NIST CSF and CIS Controls for the program view. His research adds a goal-metric mapping framework for measuring strategy coherence in SOCs.'
			],
			next: ['What are his skills in detection engineering?', 'Does he have compliance experience?'],
			refs: ['skills.cybersecurity_direct:MITRE ATT&CK', 'skills.cybersecurity_direct:MITRE D3FEND', 'skills.cybersecurity_direct:NIST Cybersecurity Framework', 'skills.cybersecurity_direct:CIS Controls'] },

		{ id: 'network', kind: 'fact', title: 'Network analysis', anchor: '#skills', onResume: false,
			keys: [['wireshark', 5], ['tcpdump', 5], ['nmap', 5], ['shodan', 5], ['packet', 4], ['network', 3], ['networking', 3], ['tcp', 3], ['pcap', 4], ['traffic', 3], ['scanning', 2]],
			examples: ['does he know wireshark', 'what network tools does he use', 'networking experience'],
			say: [
				'For network work: Wireshark and tcpdump for traffic and packet analysis (tcpdump on Linux endpoints during the LME deployment), Nmap for scanning, and Shodan for external exposure analysis in DigiVault. His networking fundamentals (TCP/IP) go back to teaching Mobile Computing and Wireless Networks at Harare Institute of Technology.',
				'He uses Wireshark and tcpdump for packet capture and analysis, Nmap for scanning, and Shodan for OSINT exposure analysis. TCP/IP and network administration are long-standing skills from his earlier IT and teaching roles.'
			],
			next: ['Tell me about DigiVault', 'Does he do penetration testing?'],
			refs: ['skills.cybersecurity_direct:Wireshark', 'skills.cybersecurity_direct:Tcpdump', 'skills.cybersecurity_direct:Nmap', 'skills.cybersecurity_direct:Shodan', 'skills.technical:TCP/IP'] },

		{ id: 'systems', kind: 'fact', title: 'Linux and Windows', anchor: '#skills', onResume: true,
			keys: [['linux', 5], ['ubuntu', 4], ['windows', 4], ['windows server', 5], ['sysadmin', 4], ['system administration', 5], ['server', 3], ['operating system', 4]],
			examples: ['does he know linux', 'windows server experience', 'system administration skills'],
			say: [
				'He works across Linux and Windows. During the CISA LME deployment he set up consistent log ingestion from Windows and Linux endpoints via Elastic Agent and used PowerShell for Windows endpoint operations. His earlier career includes server administration (monitoring, backup and recovery, firewall scripting) and Windows Server.',
				'Linux and Windows Server are both on his resume. In practice: Windows and Linux endpoint log ingestion for the LME stack, PowerShell on Windows endpoints, and server administration from his first IT roles.'
			],
			next: ['Does he know Red Hat Enterprise Linux?', 'What programming languages does he know?'],
			refs: ['skills.technical:Linux', 'skills.technical:Windows Server', 'skills.technical:Windows Endpoint Log Ingestion', 'skills.technical:Linux Endpoint Log Ingestion', 'skills.technical:Server Administration', 'skills.technical:PowerShell'] },

		// -- AI and engineering ---------------------------------------------------------
		{ id: 'ai', kind: 'fact', title: 'AI security and agentic systems', anchor: '#skills', onResume: true,
			keys: [['ai', 4], ['artificial intelligence', 5], ['llm', 5], ['agentic', 5], ['agent', 3], ['claude', 4], ['mcp', 5], ['model context protocol', 5], ['langchain', 5], ['prompt', 3], ['prompt engineering', 5], ['ollama', 5], ['genai', 5], ['generative', 3], ['machine learning', 4], ['ml', 3], ['ai security', 6], ['nvidia', 3]],
			examples: ['what ai skills does he have', 'does he work with llms', 'what agentic ai experience does he have', 'does he know mcp'],
			say: [
				SKILLS_AI,
				'He builds agentic AI for security work. Highlights: SOC-Job-Task-Analyzer, an agentic LLM pipeline with greater than 85 percent cross-model agreement across 49 SOC job descriptions; Sensei, a two-agent Claude API app (Coach and Reflection agents with tool-use loops) built in 22 hours at Hacklahoma 2026; local LLM deployment with Ollama, DeepSeek-R1 and Llama; MCP; and LangChain chains and tool-using agents from NVIDIA DLI training (Sep 2026).',
				'On the AI security side he focuses on how agents fail: agentic workflow analysis and failure-mode characterization, AI feedback loop design, and audit trail and state verification design for agentic actions. On the building side: the Claude API, MCP, LangChain and local models through Ollama.'
			],
			next: ['Tell me about Sensei', 'Tell me about SOC-Job-Task-Analyzer', 'Does he know RAG?'],
			refs: ['skills.technical:Multi-agent AI Architecture', 'skills.cybersecurity_direct:Model Context Protocol', 'skills.technical:LangChain', 'skills.technical:Ollama', 'skills.technical:Agentic workflow analysis', 'skills.cybersecurity_direct:AI Security'] },

		{ id: 'programming', kind: 'fact', title: 'Programming', anchor: '#skills', onResume: true,
			keys: [['programming', 5], ['programming language', 6], ['code', 4], ['coding', 4], ['python', 5], ['javascript', 5], ['typescript', 5], ['react', 4], ['node', 3], ['sql', 4], ['powershell', 5], ['java', 4], ['csharp', 4], ['php', 4], ['developer', 3], ['software', 3], ['scripting', 4], ['script', 3]],
			examples: ['what programming languages does he know', 'can he code', 'does he know python', 'what languages does he program in'],
			say: [
				'Python is his main language (log ingestion and security reporting automation), with PowerShell for Windows endpoint work. For web and apps he uses TypeScript, JavaScript, React and Node.js; Sensei ran on TanStack Start and Cloudflare Workers. He also uses SQL, and from his teaching and development years he has worked with Java, C#, PHP and R.',
				'Day to day: Python and PowerShell for security automation, TypeScript and JavaScript (React, Node.js, TanStack Start) for apps, and SQL. Earlier in his career he worked with Java (including teaching object-oriented Java), C# and PHP.'
			],
			next: ['What AI projects has he built?', 'What cloud experience does he have?'],
			refs: ['skills.technical:Python', 'skills.technical:PowerShell', 'skills.technical:React', 'skills.technical:Node.js', 'skills.technical:SQL', 'skills.technical:Java', 'skills.technical:C#', 'skills.technical:PHP', 'skills.technical:TanStack Start'] },

		{ id: 'cloud', kind: 'fact', title: 'Cloud and DevOps', anchor: '#skills', onResume: true,
			keys: [['cloud', 5], ['aws', 4], ['cloudflare', 5], ['docker', 5], ['container', 3], ['devops', 4], ['ci cd', 4], ['git', 3], ['serverless', 4], ['gcp', 3]],
			examples: ['what cloud experience does he have', 'does he know docker', 'devops experience', 'does he know aws'],
			say: [
				'His cloud work so far: Cloudflare Workers with D1/SQLite and Drizzle ORM (Sensei, Hacklahoma 2026), the AWS Academy Cloud Foundations training badge, and Docker and Git across his projects. AWS-native security services and Azure security engineering are on his learning roadmap rather than claimed experience.',
				'Hands-on: Cloudflare Workers (edge deployment of Sensei), Docker at an intermediate level and Git-based workflows. AWS is at Cloud Foundations level (AWS Academy training badge); deeper cloud security work is a roadmap item.'
			],
			next: ['Does he have cloud security experience?', 'Does he know Kubernetes?'],
			refs: ['skills.technical:Cloudflare Workers', 'skills.technical:AWS Cloud Foundations', 'skills.technical:Docker', 'skills.technical:Git', 'skill_gaps:AWS native security services', 'skill_gaps:Azure Security Engineering'] },

		// -- Projects ----------------------------------------------------------------------
		{ id: 'projects', kind: 'fact', title: 'Projects', anchor: '#projects', onResume: true,
			keys: [['project', 4], ['portfolio', 4], ['built', 3], ['build', 2], ['side project', 4], ['repo', 2], ['made', 1]],
			examples: ['what projects has he built', 'what ai projects has he built', 'show me his portfolio', 'list his projects'],
			say: [
				'His main projects:\n- CISA LME operational SOC deployment (adopted as the SOC standard)\n- SOC-Job-Task-Analyzer: agentic LLM pipeline, greater than 85 percent cross-model agreement on 49 job descriptions\n- Sensei: multi-agent AI coaching app, built in 22 hours at Hacklahoma 2026\n- DigiVault: automated OSINT and breach analysis (Hurricane Hackathon 2026)\n- SOC Strategic Alignment Simulator and GCM Explorer (PhD research)',
				'The AI-heavy ones are SOC-Job-Task-Analyzer (an agentic LLM research pipeline), Sensei (a two-agent Claude API app shipped in 22 hours) and DigiVault (OSINT exposure scoring with Claude-powered recommendations). On the operations side, the CISA LME deployment; on the research side, the SOC Strategic Alignment Simulator.'
			],
			next: ['Tell me about Sensei', 'Tell me about SOC-Job-Task-Analyzer', 'Tell me about DigiVault'],
			refs: ['projects:CISA Logging Made Easy', 'projects:SOC-Job-Task-Analyzer', 'projects:Sensei', 'projects:DigiVault', 'projects:SOC Strategic Alignment Simulator'] },

		{ id: 'sensei', kind: 'fact', title: 'Sensei (Hacklahoma 2026)', anchor: '#projects', onResume: true,
			keys: [['sensei', 6], ['hacklahoma', 6], ['multi agent', 4], ['coaching', 3], ['hackathon', 2]],
			examples: ['tell me about sensei', 'what did he build at hacklahoma', 'what is his multi agent project'],
			say: [
				'Sensei: Multi-Agent AI Coaching Platform (Hacklahoma 2026, Feb 2026). Built and deployed a multi-agent AI coaching app in 22 hours as part of a 4-person team, using Claude Sonnet API (Coach and Reflection agents with tool-use loops), TanStack Start, Cloudflare Workers, D1/SQLite, Drizzle ORM, Google Calendar API, and Google OAuth. Devpost: devpost.com/software/project-sensei',
				'Sensei is an AI coaching assistant for overwhelmed students, built in 22 hours at Hacklahoma 2026 with a 4-person team. Two Claude agents (Coach and Reflection) run tool-use loops; the app runs on Cloudflare Workers with D1/SQLite and Drizzle ORM and integrates the Google Calendar API and Google OAuth.'
			],
			next: ['Is he a team player?', 'What AI skills does he have?'],
			refs: ['projects:Sensei', 'skills.technical:Multi-agent AI Architecture', 'skills.technical:Cloudflare Workers'] },

		{ id: 'task-analyzer', kind: 'fact', title: 'SOC-Job-Task-Analyzer', anchor: '#projects', onResume: true,
			keys: [['soc job task analyzer', 7], ['task analyzer', 6], ['analyzer', 4], ['job description', 4], ['analyst task', 4], ['cross model', 4], ['human in the loop', 4], ['sjta', 6]],
			examples: ['tell me about soc job task analyzer', 'what is the task analyzer', 'how did he analyze job descriptions'],
			say: [
				'SOC-Job-Task-Analyzer is an agentic LLM pipeline that extracts and classifies SOC analyst task duties from 49 job descriptions, with human-in-the-loop validation. It reached greater than 85 percent cross-model agreement as part of doctoral research on SOC goal incongruency. GitHub: github.com/wellytg/SOC-Job-Task-Analyzer',
				'It is part of his dissertation work: an agentic LLM pipeline that reads 49 SOC job descriptions, extracts and classifies the analyst task duties, and maps them thematically, with humans validating the output. Cross-model agreement came out above 85 percent.'
			],
			next: ['What is his research about?', 'What AI skills does he have?'],
			refs: ['projects:SOC-Job-Task-Analyzer'] },

		{ id: 'digivault', kind: 'fact', title: 'DigiVault', anchor: '#projects', onResume: true,
			keys: [['digivault', 7], ['osint', 5], ['breach', 4], ['exposure', 3], ['hurricane', 4]],
			examples: ['tell me about digivault', 'does he do osint', 'what is his breach analysis project'],
			say: [
				'DigiVault: Automated OSINT and Breach Analysis (Hurricane Hackathon 2026). Automated public profile construction and breach signal detection: real-time OSINT aggregation, exposure scoring, AI-powered recommendations via Claude API. Live: wellytg.github.io/digivault',
				'DigiVault aggregates public OSINT about a profile in real time, detects breach signals, scores exposure and gives AI-powered recommendations through the Claude API. He built it at Hurricane Hackathon 2026; it is live at wellytg.github.io/digivault.'
			],
			next: ['What network tools does he use?', 'What AI projects has he built?'],
			refs: ['projects:DigiVault'] },

		{ id: 'simulator', kind: 'fact', title: 'SOC Strategic Alignment Simulator', anchor: '#projects', onResume: true,
			keys: [['simulator', 6], ['simulation', 4], ['gcm', 6], ['goal coherence', 6], ['speed quality', 6], ['paradox', 4], ['dashboard', 2]],
			examples: ['tell me about the simulator', 'what is the gcm explorer', 'what is the speed quality paradox'],
			say: [
				'SOC Strategic Alignment Simulator and GCM Explorer (PhD research, 2024-Present): a research simulation of the SOC Speed-Quality Paradox; an interactive Goal-Coherence Matrix for visualizing CISO-analyst goal misalignment; and an LLM Agreement Dashboard for cross-model validation. Live: wellytg.github.io/soc-paradox-sim',
				'It is the interactive side of his PhD: a simulation of the SOC Speed-Quality Paradox, a Goal-Coherence Matrix showing where CISO and analyst goals diverge, and a dashboard for checking agreement across LLMs. Live at wellytg.github.io/soc-paradox-sim.'
			],
			next: ['What is his research about?', 'Tell me about SOC-Job-Task-Analyzer'],
			refs: ['projects:SOC Strategic Alignment Simulator'] },

		{ id: 'handshake-protocol', kind: 'fact', title: 'Handshake Interoperability Protocol', anchor: '#projects', onResume: false,
			keys: [['handshake', 5], ['interoperability', 6], ['protocol', 2], ['context loss', 5], ['logic drift', 5], ['local llm', 6], ['local model', 6]],
			examples: ['tell me about the handshake protocol', 'what is the interoperability protocol', 'has he deployed local llms'],
			say: [
				'The Handshake Interoperability Protocol is an independent research project on logic drift and context loss in multi-session LLM work. It runs on local models (Ollama with DeepSeek-R1 and Llama) and creates a standardized hand-over between sessions, for auditability and state verification.',
				'An independent AI security project: a protocol that keeps multi-session LLM work consistent by handing context over in a standard, auditable form, so state can be verified. He implemented it with local models through Ollama (DeepSeek-R1, Llama).'
			],
			next: ['What AI skills does he have?', 'Does he know threat modeling for AI?'],
			refs: ['projects:Handshake Interoperability Protocol', 'skills.technical:Context Engineering'] },

		// -- Research, education, credentials -------------------------------------------------
		{ id: 'research', kind: 'fact', title: 'Research', anchor: '#research', onResume: true,
			keys: [['research', 5], ['phd', 3], ['dissertation', 5], ['doctoral', 4], ['paper', 4], ['publication', 5], ['published', 4], ['publish', 3], ['goal incongruency', 6], ['thesis', 4], ['adviser', 3], ['advisor', 3], ['hicss', 5], ['wosoc', 5], ['ndss', 5], ['wisp', 5], ['metric', 3]],
			examples: ['what is his research about', 'what has he published', 'what is his dissertation on', 'list his publications'],
			say: [
				'Doctoral research on SOC goal incongruency, designing quantitative metrics that separate risk mitigated from activity volume. Dissertation adviser: Tyler Moore. Expected completion: May 2027. Published papers, both with Andrew Morin: "Measuring Strategy Coherence in Security Operations Centers: A Goal-Metric Mapping Framework" (Pre-ICIS/WISP 2025) and "Mismatched SOCs: A Case Study of Cybersecurity Goal Incongruency Within An Academic SOC" (WOSOC 2025, co-located NDSS Symposium, San Diego). A third paper, "Beyond Measuring Busyness", is forthcoming at HICSS-60 (2027).',
				'His PhD asks why SOCs miss organizational goals even with the right tools. He designs metrics that measure risk mitigated rather than activity volume (tickets closed), under adviser Tyler Moore. Two peer-reviewed papers with Andrew Morin are out (Pre-ICIS/WISP 2025 and WOSOC 2025 at NDSS Symposium), and a third is forthcoming at HICSS-60 (2027). He presented the work at TU Research Day 2026.'
			],
			next: ['What is his education?', 'Tell me about the simulator', 'Tell me about SOC-Job-Task-Analyzer'],
			refs: ['projects:SOC Goal Incongruency Research', 'publications', 'skills.cybersecurity_direct:Quantitative Risk Metrics Design'] },

		{ id: 'education', kind: 'fact', title: 'Education', anchor: '#about', onResume: true,
			keys: [['education', 5], ['degree', 5], ['phd', 3], ['doctorate', 4], ['master', 4], ['bachelor', 4], ['studied', 3], ['study', 2], ['school', 3], ['university', 2], ['jntuh', 5], ['qualification', 3]],
			examples: ['what is his education', 'what degrees does he have', 'where did he study'],
			say: [
				'Doctor of Philosophy, Cyber Studies, The University of Tulsa (expected May 2027); SOC goal incongruency, quantitative security metrics design; adviser: Tyler Moore. Master of Technology, Computer Science, JNTUH College of Engineering Hyderabad. Bachelor of Technology, Computer Science, Harare Institute of Technology.',
				'He is a PhD candidate in Cyber Studies at The University of Tulsa (expected May 2027). Before that: an MTech in Computer Science from JNTUH College of Engineering Hyderabad and a BTech in Computer Science from Harare Institute of Technology.'
			],
			next: ['What is his research about?', 'What certifications does he hold?'],
			refs: ['education:Doctor of Philosophy', 'education:Master of Technology', 'education:Bachelor of Technology'] },

		{ id: 'certifications', kind: 'fact', title: 'Certifications and training', anchor: '#skills', onResume: true,
			keys: [['certification', 6], ['certified', 5], ['certificate', 5], ['cert', 5], ['credential', 4], ['isc2', 4], ['badge', 3], ['training', 2], ['course', 2]],
			examples: ['what certifications does he hold', 'is he certified', 'what credentials does he have'],
			say: [
				'ISC2 Certified in Cybersecurity (CC), active through Aug 2028; Google Cybersecurity Professional Certificate V2 (2024; updated curriculum completed Jul 2026); Google AI Professional Certificate, 7-course specialization (Jul 2026); Cribl Certified Admin - Stream (Level 2); Cribl Certified User (Level 1); AI for App Deployment, Google (Aug 2026); Building LLM Applications With Prompt Engineering, NVIDIA Deep Learning Institute (Sep 2026); AWS Academy Graduate - Cloud Foundations - Training Badge (2022).',
				'Security: ISC2 Certified in Cybersecurity (CC, active through Aug 2028), the Google Cybersecurity Professional Certificate V2, and Cribl Certified Admin - Stream (Level 2) plus Cribl Certified User (Level 1). AI: the Google AI Professional Certificate, AI for App Deployment (Google) and NVIDIA DLI Building LLM Applications With Prompt Engineering. Cloud: the AWS Academy Cloud Foundations training badge.'
			],
			next: ['Does he have Security+?', 'What SIEM tools has he used?'],
			refs: ['certifications:ISC2 Certified in Cybersecurity', 'certifications:Google Cybersecurity Professional Certificate', 'certifications:Cribl Certified Admin', 'certifications:Google AI Professional Certificate', 'certifications:Building LLM Applications'] },

		// -- Soft skills (resume evidence only) ------------------------------------------------
		{ id: 'communication', kind: 'fact', title: 'Communication', anchor: '#experience', onResume: true,
			keys: [['communic', 6], ['present', 4], ['public speaking', 5], ['speaking', 3], ['writing', 3], ['written', 3], ['explain', 3], ['documentation', 3], ['stakeholder', 4], ['executive', 3], ['ciso', 2]],
			examples: ['is he a good communicator', 'can he present to executives', 'how are his communication skills', 'does he write documentation'],
			say: [
				'The resume shows it in practice: he presented quantified SOC findings to the CISO and SOC leadership, wrote the installation guides, field dictionaries and operational runbooks for the LME deployment, presented his research at TU Research Day 2026, and taught 18 subjects as a lecturer.',
				'He is used to explaining technical work to different audiences: CISO and SOC leadership (quantified LME findings), researchers (two peer-reviewed papers and TU Research Day 2026), students (18 subjects taught at Harare Institute of Technology) and operators (the runbooks and field dictionaries he authored).'
			],
			next: ['Is he a team player?', 'Has he led a team?'],
			refs: ['experience:Security Operations Center Analyst', 'skills.academic_teaching:Lecture Delivery', 'achievements_extracurricular:Research Day 2026'] },

		{ id: 'teamwork', kind: 'fact', title: 'Teamwork', anchor: '#projects', onResume: true,
			keys: [['teamwork', 6], ['team player', 6], ['collabor', 5], ['work with others', 5], ['cross functional', 5], ['colleague', 3], ['cooperat', 4]],
			examples: ['is he a team player', 'does he collaborate well', 'how does he work with others'],
			say: [
				'He built Sensei in 22 hours as part of a 4-person team at Hacklahoma 2026, works in multidisciplinary research teams at TU, co-authored two peer-reviewed papers with Andrew Morin (Idaho National Labs), and served on the IndabaX-Zimbabwe organising committee in 2022 and 2023.',
				'Collaboration runs through his record: a 4-person hackathon team that shipped Sensei in 22 hours, research co-authorship with Andrew Morin, cross-disciplinary research at TU, and committee roles such as IndabaX-Zimbabwe and the TU Graduate Student Association executive.'
			],
			next: ['Has he led a team?', 'Is he a good communicator?'],
			refs: ['skills.leadership_management:Cross-functional Team Leadership', 'projects:Sensei', 'achievements_extracurricular:IndabaX'] },

		{ id: 'learning', kind: 'fact', title: 'Problem solving and learning', anchor: '#skills', onResume: true,
			keys: [['problem solv', 6], ['learn', 4], ['fast learner', 6], ['adapt', 5], ['pressure', 4], ['deadline', 4], ['initiative', 4], ['curious', 4], ['self starter', 5], ['quick', 2], ['grow', 3]],
			examples: ['is he a fast learner', 'how does he handle pressure', 'is he a problem solver', 'is he adaptable'],
			say: [
				'Two examples from the resume: he shipped Sensei, a multi-agent app, in 22 hours at Hacklahoma 2026, and in 2026 he completed the Google AI Professional Certificate, AI for App Deployment (Google) and NVIDIA DLI Building LLM Applications With Prompt Engineering. He also moved from leading an academic department in Zimbabwe to hands-on SOC work in the US.',
				'He learns by building: a SIEM stack the SOC adopted as its standard during a single summer internship, a 22-hour hackathon app with a 4-person team, and new AI tooling put straight to use, such as MCP and the Claude API in Sensei (Feb 2026) and LangChain from NVIDIA DLI training (Sep 2026).'
			],
			next: ['What AI skills does he have?', 'What has he deployed?'],
			refs: ['projects:Sensei', 'certifications:Google AI Professional Certificate', 'certifications:AI for App Deployment', 'certifications:Building LLM Applications'] },

		{ id: 'mentoring', kind: 'fact', title: 'Mentoring and teaching', anchor: '#experience', onResume: true,
			keys: [['mentor', 6], ['mentorship', 6], ['coach', 3], ['teach', 4], ['train', 3], ['student', 3], ['supervis', 2]],
			examples: ['is he a good mentor', 'has he mentored anyone', 'can he train junior analysts'],
			say: [
				'He supervised 2 MTech and 15 BTech research projects, taught 18 subjects at Harare Institute of Technology, and built a digital internship monitoring platform there to mentor students on placement.',
				'Mentoring was a large part of his academic career: 17 supervised research projects (2 MTech, 15 BTech), 18 subjects taught, and internship mentorship backed by a monitoring platform he built.'
			],
			next: ['What did he do at Harare Institute of Technology?', 'Has he led a team?'],
			refs: ['skills.leadership_management:Research Supervision', 'skills.academic_teaching:Student Mentorship', 'skills.leadership_management:Internship Coordination'] },

		{ id: 'community', kind: 'fact', title: 'Community', anchor: '#community', onResume: true,
			keys: [['community', 5], ['volunteer', 5], ['involvement', 4], ['extracurricular', 5], ['chapter', 3], ['nsbe', 5], ['gsa', 4], ['club', 3], ['organization', 3], ['member', 2], ['event', 2]],
			examples: ['is he involved in the community', 'what organizations is he part of', 'does he volunteer'],
			say: [
				'Secretary, ISC2 Tulsa Metro Chapter (Feb 2026 - Present); Event Coordinator on the TU Graduate Student Association executive (Jul 2026 - Present); NSBE University of Tulsa Chapter Senator (since Nov 2024); and regular hackathons, including Hacklahoma 2026 and Global Game Jam 2025 and 2026. In Zimbabwe he served on the IndabaX-Zimbabwe organising committee in 2022 and 2023.',
				'He is active in the Tulsa security community as Secretary of the ISC2 Tulsa Metro Chapter, and on campus through the Graduate Student Association executive and NSBE. He also attends BSidesOK and takes part in hackathons and game jams.'
			],
			next: ['Has he led a team?', 'What does he do for fun?'],
			refs: ['achievements_extracurricular:ISC2 Tulsa Metro Chapter', 'achievements_extracurricular:Event Coordinator', 'achievements_extracurricular:NSBE', 'achievements_extracurricular:IndabaX', 'achievements_extracurricular:BSidesOK'] },

		{ id: 'hobbies', kind: 'fact', title: 'Outside work', anchor: '#community', onResume: false,
			keys: [['hobby', 6], ['hobbies', 6], ['fun', 4], ['free time', 5], ['outside work', 5], ['chess', 5], ['table tennis', 5], ['game jam', 5], ['game', 2]],
			examples: ['what does he do for fun', 'what are his hobbies', 'what does he do in his free time'],
			say: [
				'Outside work: chess and table tennis (several awards at the HIT Chancellor\'s Games, 2017 - 2021) and game jams, including Global Game Jam 2025 and 2026.',
				'He plays chess and table tennis competitively (awards at the Chancellor\'s Games while at Harare Institute of Technology) and builds games at game jams such as Global Game Jam.'
			],
			next: ['Is he involved in the community?', 'Who is Wellington?'],
			refs: ['achievements_extracurricular:Chess', 'achievements_extracurricular:Global Game Jam'] },

		{ id: 'spoken', kind: 'fact', title: 'Languages spoken', anchor: '#about', onResume: false,
			keys: [['speak', 6], ['spoken', 6], ['fluent', 5], ['english', 5], ['shona', 6], ['bilingual', 5]],
			examples: ['what languages does he speak', 'is he fluent in english', 'does he speak other languages'],
			say: ['English (professional working proficiency) and Shona (native).', 'He speaks English at professional working proficiency and Shona as a native speaker.'],
			next: ['Where is he based?', 'Who is Wellington?'],
			refs: ['languages'] },

		{ id: 'why', kind: 'fact', title: 'Why Wellington', anchor: '#about', onResume: true,
			keys: [['why', 3], ['hire', 4], ['fit', 4], ['good fit', 5], ['strong candidate', 5], ['stand out', 5], ['unique', 3], ['strength', 4], ['value', 2], ['choose', 3], ['match', 3], ['qualified', 4]],
			examples: ['why should we hire wellington', 'why is he a good fit', 'what makes him stand out', 'what are his strengths'],
			say: [
				'Here is what the resume shows:\n\n' + WHY_POINTS.join('\n\n'),
				'Three things, all from the resume: he deploys real SOC infrastructure (the full CISA LME stack, adopted as the SOC\'s operational standard), he builds agentic AI for security work (SOC-Job-Task-Analyzer, Sensei), and he researches why SOCs miss their goals, with two peer-reviewed papers on it.'
			],
			next: ['Why is he a fit for detection engineering?', 'Has he led a team?', 'What AI projects has he built?'],
			refs: ['projects:CISA Logging Made Easy', 'publications', 'projects:SOC-Job-Task-Analyzer', 'projects:Sensei'] },

		// -- Skill gaps (honest roadmap answers) ---------------------------------------------------
		{ id: 'gap-sentinel', kind: 'gap', title: 'Microsoft Sentinel', anchor: '#skills', onResume: false,
			keys: [['microsoft sentinel', 7], ['sentinel', 5], ['sc 200', 6], ['sc200', 6], ['kql', 5], ['azure sentinel', 7]],
			examples: ['does he have microsoft sentinel experience', 'does he know kql', 'has he used sentinel'],
			say: [
				'Not hands-on with Microsoft Sentinel yet; it is on his learning roadmap (the SC-200 path on Microsoft Learn). The closest experience: he deployed and ran a full SIEM stack (CISA LME on Elastic with Cribl Stream pipelines), and ran Microsoft 365 Defender as a parallel test system alongside the production Wazuh/LME deployment.',
				'Microsoft Sentinel is a roadmap item rather than claimed experience. What transfers: production SIEM work on Elastic Stack with Cribl Stream, detection rules validated against MITRE ATT&CK, and Microsoft 365 Defender run in parallel with the LME deployment.'
			],
			next: ['What SIEM tools has he used?', 'Does he know SOAR?'],
			refs: ['skill_gaps:Microsoft Sentinel', 'skills.cybersecurity_direct:Microsoft 365 Defender'] },

		{ id: 'gap-soar', kind: 'gap', title: 'SOAR', anchor: '#skills', onResume: false,
			keys: [['soar', 7], ['playbook', 5], ['orchestration', 5], ['xsoar', 7], ['tines', 6], ['automated response', 6]],
			examples: ['does he know soar', 'has he built playbooks', 'security orchestration experience'],
			say: [
				'SOAR platforms are on his roadmap (Sentinel playbooks through SC-200, Tines Community Edition) rather than claimed experience. Adjacent: security process automation in Python, and Cribl Stream pipelines that route, enrich and normalize logs automatically.',
				'He has not run a named SOAR platform yet; it is a planned next step. What he has done is the automation underneath: Python for log ingestion and repeatable security reporting, and Cribl pipeline orchestration in the LME deployment.'
			],
			next: ['What programming languages does he know?', 'Does he have Microsoft Sentinel experience?'],
			refs: ['skill_gaps:SOAR', 'skills.cybersecurity_direct:Security Automation'] },

		{ id: 'gap-splunk', kind: 'not-claimed', title: 'Splunk', anchor: '#skills', onResume: true,
			keys: [['splunk', 7], ['spl', 5]],
			examples: ['does he know splunk', 'splunk experience', 'can he write spl'],
			say: [
				'Splunk is workshop-level for him: he completed the hands-on Investigating with Splunk workshop (investigation searches, SPL). He does not claim operational Splunk experience; his production SIEM work is on Elastic Stack with Cribl Stream and Wazuh, which transfers directly.',
				'Workshop-level only (Investigating with Splunk: investigation searches and SPL). His operational SIEM experience is Elastic-based, from the CISA LME deployment.'
			],
			next: ['What SIEM tools has he used?', 'Why is he a fit for detection engineering?'],
			refs: ['resume_notes.do_not_claim:Splunk (operational)', 'skills.cybersecurity_direct:Splunk (Investigating with Splunk Workshop)'] },

		{ id: 'gap-crowdstrike', kind: 'not-claimed', title: 'CrowdStrike', anchor: '#skills', onResume: false,
			keys: [['crowdstrike', 7], ['falcon', 6]],
			examples: ['does he know crowdstrike', 'crowdstrike falcon experience'],
			say: [
				'He does not claim CrowdStrike experience. His hands-on EDR work is with SentinelOne, Wazuh HIDS/EDR and Elastic Agent, plus Microsoft 365 Defender run as a parallel test system.',
				'No CrowdStrike on his record. For EDR he has used SentinelOne hands-on, along with Wazuh and Elastic Agent in the LME deployment.'
			],
			next: ['What SIEM tools has he used?', 'Does he do threat hunting?'],
			refs: ['resume_notes.do_not_claim:CrowdStrike', 'skills.cybersecurity_direct:SentinelOne'] },

		{ id: 'gap-appsec', kind: 'gap', title: 'Penetration testing and application security', anchor: '#skills', onResume: false,
			keys: [['penetration test', 7], ['pentest', 7], ['pen test', 7], ['burp', 7], ['burpsuite', 7], ['owasp', 6], ['web application security', 7], ['appsec', 7], ['xss', 6], ['sql injection', 7], ['red team', 6], ['offensive', 5], ['ethical hacking', 6], ['hacking', 3], ['bug bounty', 6], ['api security', 6], ['vulnerability research', 7]],
			examples: ['does he do penetration testing', 'does he know burp suite', 'web application security experience', 'is he a red teamer'],
			say: [
				'Offensive and application security testing is a gap he is working toward rather than claimed experience: PortSwigger Web Security Academy (Burp Suite, OWASP Top 10) and TryHackMe\'s Jr Penetration Tester path are on his roadmap. Adjacent experience: CTF competitions, Nmap and Wireshark, and a CompTIA Security+ course on secure code design and implementation.',
				'He is a defender first. Pen testing, Burp Suite and the OWASP Top 10 are on his learning roadmap; today he brings CTF experience, Nmap and Wireshark, and secure code design training.'
			],
			next: ['What network tools does he use?', 'Why is he a fit for detection engineering?'],
			refs: ['skill_gaps:Penetration Testing Fundamentals', 'skill_gaps:BurpSuite', 'skill_gaps:OWASP Top 10', 'skills.cybersecurity_direct:CTF', 'certifications:CompTIA Security+ (SY0-601) Cert Prep'] },

		{ id: 'gap-kubernetes', kind: 'gap', title: 'Kubernetes', anchor: '#skills', onResume: false,
			keys: [['kubernetes', 7], ['k8s', 7], ['openshift', 6], ['container orchestration', 6]],
			examples: ['does he know kubernetes', 'kubernetes experience', 'has he used openshift'],
			say: [
				'Kubernetes is not claimed experience yet; it is on his roadmap (Minikube and the kubernetes.io tutorials). He has intermediate Docker experience, the usual starting point.',
				'Not yet. Kubernetes is a planned learning item; containers so far means Docker at an intermediate level.'
			],
			next: ['What cloud experience does he have?', 'Does he know Infrastructure as Code?'],
			refs: ['skill_gaps:Kubernetes', 'skills.technical:Docker'] },

		{ id: 'gap-cloudsec', kind: 'gap', title: 'Cloud security', anchor: '#skills', onResume: false,
			keys: [['cloud security', 7], ['azure', 5], ['az 500', 7], ['az500', 7], ['aws security', 7], ['guardduty', 7], ['security hub', 6], ['iam', 4], ['entra', 6]],
			examples: ['does he have cloud security experience', 'does he know azure', 'aws security experience'],
			say: [
				'Cloud security engineering is on his learning roadmap rather than claimed experience: AZ-500 for Azure, and the AWS security learning plan (IAM policies, GuardDuty, Security Hub) for AWS. What he has: the AWS Academy Cloud Foundations training badge and hands-on Cloudflare Workers deployment from Sensei.',
				'He would be growing into cloud security. Azure (AZ-500) and AWS-native security services are roadmap items; his cloud base is AWS Cloud Foundations training and edge deployment on Cloudflare Workers.'
			],
			next: ['What cloud experience does he have?', 'Does he know Kubernetes?'],
			refs: ['skill_gaps:Azure Security Engineering', 'skill_gaps:AWS native security services', 'skills.technical:AWS Cloud Foundations'] },

		{ id: 'gap-secplus', kind: 'gap', title: 'CompTIA Security+', anchor: '#skills', onResume: false,
			keys: [['securityplus', 7], ['security plus', 7], ['comptia', 6], ['secplus', 7]],
			examples: ['does he have security+', 'is he comptia certified'],
			say: [
				'He does not hold CompTIA Security+ yet; it is on his roadmap. He does hold ISC2 Certified in Cybersecurity (CC, active through Aug 2028), and he completed a CompTIA Security+ (SY0-601) prep course on secure code design and implementation.',
				'Not yet: Security+ is a planned certification. His current security certification is ISC2 Certified in Cybersecurity (CC).'
			],
			next: ['What certifications does he hold?'],
			refs: ['skill_gaps:CompTIA Security+', 'certifications:ISC2 Certified in Cybersecurity'] },

		{ id: 'gap-threatmodel', kind: 'gap', title: 'Threat modeling and AI risk', anchor: '#skills', onResume: false,
			keys: [['threat model', 7], ['threat modeling', 7], ['stride', 6], ['attack tree', 6], ['ai rmf', 7], ['nist ai', 6], ['owasp llm', 7], ['prompt injection', 6], ['data poisoning', 6], ['ai red team', 6], ['ai risk', 6]],
			examples: ['does he know threat modeling', 'does he know threat modeling for ai', 'experience with the nist ai rmf', 'does he understand prompt injection'],
			say: [
				'Formal threat modeling (STRIDE, attack trees) and the NIST AI Risk Management Framework are on his roadmap rather than claimed. Adjacent experience: agentic workflow analysis and failure-mode characterization, and audit trail and state verification design for agentic actions in his Handshake Interoperability Protocol work.',
				'He would describe this as adjacent, not established: he studies how agentic workflows fail and designs audit and state-verification mechanisms for them, while formal STRIDE threat modeling and the NIST AI RMF are next on his learning plan.'
			],
			next: ['What AI skills does he have?', 'Tell me about the Handshake protocol'],
			refs: ['skill_gaps:Threat Modeling', 'skill_gaps:NIST AI RMF', 'skills.technical:Agentic workflow analysis'] },

		{ id: 'gap-rag', kind: 'gap', title: 'RAG and vector search', anchor: '#skills', onResume: false,
			keys: [['rag', 7], ['retrieval augmented', 7], ['retrieval', 4], ['langgraph', 7], ['vector', 5], ['embedding', 6], ['vector database', 7], ['pinecone', 6], ['chroma', 6], ['faiss', 6], ['eval', 3]],
			examples: ['does he know rag', 'has he built retrieval augmented generation', 'experience with vector databases', 'does he know langgraph'],
			say: [
				'RAG, vector search and LangGraph are next on his AI roadmap rather than claimed experience. What he has: LangChain (LCEL chains, structured outputs, tool-using agents) from NVIDIA DLI training, local LLM deployment with Ollama, and multi-agent tool-use loops with the Claude API in Sensei.',
				'Not yet as shipped work. Retrieval-augmented generation and vector databases are roadmap items; the groundwork is LangChain chains and agents (NVIDIA DLI), local models through Ollama and the Claude API agents in Sensei.'
			],
			next: ['What AI skills does he have?', 'Tell me about Sensei'],
			refs: ['skill_gaps:Retrieval-Augmented Generation', 'skill_gaps:LangChain / LangGraph', 'skill_gaps:Vector Search', 'skills.technical:LangChain'] },

		{ id: 'gap-malware', kind: 'gap', title: 'Malware analysis', anchor: '#skills', onResume: false,
			keys: [['malware', 7], ['reverse engineering', 7], ['reversing', 6], ['ghidra', 6], ['ida', 4], ['static analysis', 5], ['dynamic analysis', 5], ['sandbox', 4]],
			examples: ['has he done malware analysis', 'can he reverse engineer malware'],
			say: [
				'Malware analysis is a roadmap item (TryHackMe malware rooms, SANS FOR610 material), not claimed experience. Adjacent: endpoint alert monitoring and investigation in the TU SOC with Wazuh, SentinelOne and Elastic Agent telemetry.',
				'Not claimed yet. His endpoint work is detection and investigation of alerts rather than reverse engineering; malware analysis is on his learning plan.'
			],
			next: ['Does he do threat hunting?', 'What SIEM tools has he used?'],
			refs: ['skill_gaps:Malware Analysis', 'skills.cybersecurity_direct:Endpoint alert monitoring'] },

		{ id: 'gap-compliance', kind: 'not-claimed', title: 'Compliance frameworks', anchor: '#skills', onResume: false,
			keys: [['hipaa', 7], ['iso 27001', 7], ['iso', 4], ['soc 2', 7], ['soc2', 7], ['pci', 6], ['pci dss', 7], ['compliance', 5], ['gdpr', 6], ['regulatory', 4], ['cmmc', 6], ['audit', 3]],
			examples: ['does he have compliance experience', 'does he know hipaa', 'iso 27001 experience', 'soc 2 audits'],
			say: [
				'He does not claim HIPAA, ISO 27001, SOC 2 or PCI-DSS experience. What he does have: the NIST Cybersecurity Framework and CIS Controls, security auditing from quality-assurance audits for Zimbabwe\'s higher-education regulator (ZIMCHE), and doctoral research on SOC governance and metrics.',
				'Not as named compliance programs. His governance experience is NIST CSF and CIS Controls, ZIMCHE quality-assurance audits, and research on SOC goal alignment; HIPAA and PCI-DSS are on his learning roadmap.'
			],
			next: ['Which frameworks does he use?', 'What is his research about?'],
			refs: ['resume_notes.do_not_claim:HIPAA', 'resume_notes.do_not_claim:ISO 27001', 'resume_notes.do_not_claim:SOC 2', 'skill_gaps:HIPAA Security Officer', 'skill_gaps:PCI-DSS Compliance', 'skills.cybersecurity_direct:Security Auditing'] },

		{ id: 'gap-langs', kind: 'gap', title: 'Go and Rust', anchor: '#skills', onResume: false,
			keys: [['golang', 7], ['go language', 7], ['go programming', 7], ['rust', 7]],
			examples: ['does he know golang', 'does he write rust'],
			say: [
				'Go and Rust are not claimed; both are on his roadmap (porting a Python log parser to Go is the planned first project). His working languages are Python, PowerShell, TypeScript/JavaScript and SQL.',
				'Not yet. Go is a planned next language and Rust a later one; today he works in Python, PowerShell, TypeScript/JavaScript and SQL.'
			],
			next: ['What programming languages does he know?'],
			refs: ['skill_gaps:Go (Golang)', 'skill_gaps:Rust'] },

		{ id: 'gap-iac', kind: 'gap', title: 'Infrastructure as Code', anchor: '#skills', onResume: false,
			keys: [['terraform', 7], ['cloudformation', 7], ['ansible', 7], ['infrastructure as code', 7], ['iac', 6], ['policy as code', 7], ['configuration management', 6]],
			examples: ['does he know terraform', 'does he know infrastructure as code', 'ansible experience'],
			say: [
				'Terraform and Ansible are roadmap items rather than claimed experience. Adjacent: he deployed and managed the full LME stack with consistent log ingestion across Windows and Linux endpoints, and he automates with Python and PowerShell.',
				'Not with named IaC tools yet; Terraform and Ansible are planned. His automation today is Python and PowerShell, applied to a multi-endpoint SIEM deployment.'
			],
			next: ['Does he know Kubernetes?', 'What cloud experience does he have?'],
			refs: ['skill_gaps:Infrastructure as Code and Policy as Code', 'skill_gaps:Ansible', 'skills.cybersecurity_direct:Infrastructure as Code (Security Stack)'] },

		{ id: 'gap-vuln', kind: 'gap', title: 'Vulnerability management tools', anchor: '#skills', onResume: false,
			keys: [['qualys', 7], ['nessus', 7], ['tenable', 7], ['vulnerability scanning', 7], ['vulnerability management', 6], ['vulnerability scanner', 7], ['nuclei', 6], ['vulnerabilit', 4]],
			examples: ['does he know qualys', 'vulnerability management experience', 'has he used nessus'],
			say: [
				'He lists vulnerability management as a core skill, but not a named scanner: Qualys is on his roadmap (Qualys Community Edition). Adjacent tooling: Nmap for scanning and Shodan for external exposure analysis.',
				'Vulnerability management is on his resume as a skill; named scanners such as Qualys or Nessus are not. Those are planned, building on his Nmap and Shodan work.'
			],
			next: ['What network tools does he use?', 'Does he do penetration testing?'],
			refs: ['skill_gaps:Qualys Vulnerability Management', 'skills.cybersecurity_direct:Vulnerability Management'] },

		{ id: 'gap-rhel', kind: 'gap', title: 'Red Hat Enterprise Linux', anchor: '#skills', onResume: false,
			keys: [['rhel', 7], ['red hat', 7], ['rhcsa', 7], ['centos', 5]],
			examples: ['does he know red hat enterprise linux', 'rhel experience'],
			say: [
				'Red Hat Enterprise Linux specifically is a roadmap item (Red Hat Developer subscription, RHCSA later). He works with Linux and Ubuntu generally, including Linux endpoint log ingestion for the LME deployment.',
				'Not RHEL by name. His Linux experience is general Linux and Ubuntu administration plus Linux endpoint telemetry for the LME stack; RHEL and RHCSA are planned.'
			],
			next: ['Does he know Linux?'],
			refs: ['skill_gaps:Linux/RHEL', 'skills.technical:Linux'] },

		{ id: 'gap-mlframeworks', kind: 'gap', title: 'ML frameworks', anchor: '#skills', onResume: false,
			keys: [['pytorch', 7], ['tensorflow', 7], ['deep learning', 5], ['keras', 6], ['scikit', 5], ['neural network', 4]],
			examples: ['does he know pytorch', 'tensorflow experience', 'has he trained models'],
			say: [
				'PyTorch and TensorFlow are on his roadmap (fast.ai), not claimed. His AI foundations come from teaching AI and Expert Systems and Neural Networks and Pattern Matching at Harare Institute of Technology, plus applied LLM work with the Claude API, LangChain and local models.',
				'He has not shipped work in PyTorch or TensorFlow; model training is a roadmap item. His applied AI is LLM-based: agents, pipelines and evaluation across models.'
			],
			next: ['What AI skills does he have?'],
			refs: ['skill_gaps:PyTorch / TensorFlow', 'skills.technical:Artificial Intelligence & Machine Learning (foundational)'] },

		// -- Conversation ------------------------------------------------------------------------
		{ id: 'greeting', kind: 'meta', title: 'Hello', anchor: '#assistant', onResume: true,
			keys: [['hi', 4], ['hello', 4], ['hey', 4], ['morning', 3], ['afternoon', 3], ['evening', 3], ['greeting', 4], ['howdy', 4]],
			examples: ['hi', 'hello there', 'good morning'],
			say: [
				'Hi! I answer questions about Wellington\'s resume. Ask about his SOC work, projects, research or skills, or pick a suggestion below.',
				'Hello. Ask me anything about Wellington\'s experience, skills, projects or research.'
			],
			next: DEFAULT_FOLLOWUPS, refs: [] },

		{ id: 'thanks', kind: 'meta', title: 'Thanks', anchor: '#assistant', onResume: true,
			keys: [['thank', 5], ['thanks', 5], ['cheers', 4], ['appreciate', 4], ['great', 1], ['helpful', 3]],
			examples: ['thanks', 'thank you', 'that was helpful'],
			say: ['You\'re welcome. For the full picture, the resume PDF is linked below.', 'Glad to help. You can reach Wellington at ' + EMAIL + '.'],
			next: ['Can I download his resume?', 'How can I contact him?'], refs: [] },

		{ id: 'help', kind: 'meta', title: 'About this assistant', anchor: '#assistant', onResume: true,
			keys: [['chatbot', 5], ['bot', 4], ['assistant', 3]],
			examples: ['what can you do', 'are you an ai', 'how does this work', 'who are you'],
			say: [
				'I am a rule-based resume assistant: I match your question against Wellington\'s resume and skills record and answer only from that. I am not an AI model, and nothing you type leaves this page.',
				'I answer from a fixed set of facts taken from Wellington\'s resume and skills record. I do not use an AI model or send your question anywhere; if I do not know, I will say so and point you to the resume or his email.'
			],
			next: DEFAULT_FOLLOWUPS, refs: [] }
	];

	// ---- Text normalization -----------------------------------------------------

	var STOPWORDS = toSet('a an the is are was were be been being do does did done doing has have had having he him his himself she her they them their it its this that these those i me my you your we us our of in on at to for from by with about as into over than then so and or but if any some can could would should will shall may might must just also very really please tell show give list share know knows what which wellington welly gwavava tatenda candidate mr there here get got any anything something');

	// Canonical forms for word families and common synonyms (applied after stemming).
	var SYNONYMS = {
		led: 'lead', leading: 'lead', leader: 'lead', leadership: 'lead', lead: 'lead', head: 'lead', headed: 'lead', boss: 'lead',
		manag: 'manag', management: 'manag', manager: 'manag', supervisor: 'supervis', oversaw: 'supervis', oversee: 'supervis',
		cv: 'resume', resum: 'resume', résumé: 'resume',
		cert: 'cert', certs: 'cert', certif: 'cert', certifi: 'cert', certificat: 'cert', credential: 'credential',
		coding: 'code', coder: 'code', program: 'programming', programm: 'programming',
		js: 'javascript', ts: 'typescript', nodejs: 'node', py: 'python', llms: 'llm', apis: 'api', siems: 'siem', edrs: 'edr',
		k8: 'k8s', pentest: 'pentest', pentesting: 'pentest', pentester: 'pentest',
		phd: 'phd', doctorate: 'doctorate', doctoral: 'doctoral',
		job: 'job', jobs: 'job', employ: 'employment', employer: 'employment', worked: 'worked', working: 'worked',
		teamwork: 'teamwork', teammate: 'teamwork', cooperation: 'cooperat',
		mail: 'mail', emails: 'email', phone: 'phone',
		hobbi: 'hobby', hobby: 'hobby',
		live: 'live', lives: 'live', living: 'live', reside: 'live', resides: 'live',
		strong: 'strong', strength: 'strength', strengths: 'strength'
	};

	var SUFFIXES = ['izations', 'ization', 'ations', 'ation', 'ators', 'ator', 'ments', 'ment', 'ities', 'ity', 'ings', 'ing', 'ives', 'ive', 'ies', 'ied', 'ers', 'er', 'ed', 'es', 'ate', 'ly', 's', 'e'];

	function toSet(words) {
		var s = {};
		words.split(/\s+/).forEach(function (w) { if (w) s[w] = true; });
		return s;
	}

	function stem(w) {
		if (w.length <= 4) return w;
		for (var i = 0; i < SUFFIXES.length; i++) {
			var suf = SUFFIXES[i];
			if (w.length - suf.length >= 4 && w.slice(-suf.length) === suf) {
				var base = w.slice(0, -suf.length);
				if (suf === 'ies' || suf === 'ied' || suf === 'ities') base += suf === 'ities' ? '' : 'y';
				return base;
			}
		}
		return w;
	}

	function canon(w) {
		if (SYNONYMS[w]) return SYNONYMS[w];
		var s = stem(w);
		return SYNONYMS[s] || s;
	}

	function normalizeText(text) {
		return String(text).toLowerCase()
			.replace(/[‘’`]/g, "'")
			.replace(/c\+\+/g, ' cplusplus ')
			.replace(/c#/g, ' csharp ')
			.replace(/security\s*\+/g, ' securityplus ')
			.replace(/sec\s*\+/g, ' secplus ')
			.replace(/att&ck/g, ' attack ')
			.replace(/'s\b/g, '')
			.replace(/n't\b/g, ' not')
			.replace(/[^a-z0-9]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function rawTokens(text) {
		var n = normalizeText(text);
		return n ? n.split(' ') : [];
	}

	// ---- Typo tolerance (optimal string alignment distance) ---------------------

	function editDistance(a, b, max) {
		if (Math.abs(a.length - b.length) > max) return max + 1;
		var prev2 = null, prev = [], cur, i, j;
		for (j = 0; j <= b.length; j++) prev[j] = j;
		for (i = 1; i <= a.length; i++) {
			cur = [i];
			var rowMin = i;
			for (j = 1; j <= b.length; j++) {
				var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
				var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
				if (prev2 && i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) v = Math.min(v, prev2[j - 2] + 1);
				cur[j] = v;
				if (v < rowMin) rowMin = v;
			}
			if (rowMin > max) return max + 1;
			prev2 = prev;
			prev = cur;
		}
		return prev[b.length];
	}

	function typoBudget(len) { return len >= 8 ? 2 : (len >= 5 ? 1 : 0); }

	// ---- Index built once from TOPICS ---------------------------------------------

	// Question words that carry meaning for some topics (who / why / where ...).
	var KEEP_QUESTION_WORDS = /^(?:who|why|where|when|how|many|long|now)$/;

	function contentWords(text) {
		return rawTokens(text).filter(function (w) { return !STOPWORDS[w] || KEEP_QUESTION_WORDS.test(w); });
	}

	function toCanonSet(text) {
		var set = {};
		contentWords(text).forEach(function (w) { set[canon(w)] = true; });
		return set;
	}

	var VOCAB = {};   // canonical token -> true (everything a keyword or example can match)
	var ALIAS = {};   // surface or stemmed form -> canonical token (used for typo matching)

	function addAlias(form, canonical) {
		if (form && form.length >= 4 && !ALIAS[form]) ALIAS[form] = canonical;
	}

	TOPICS.forEach(function (t) {
		t.keyTokens = t.keys.map(function (k) {
			var words = contentWords(k[0]);
			words.forEach(function (w) { addAlias(w, canon(w)); addAlias(stem(w), canon(w)); });
			return { tokens: words.map(canon), weight: k[1] };
		}).filter(function (k) { return k.tokens.length; });
		t.exampleSets = t.examples.map(toCanonSet);
		t.keyTokens.forEach(function (k) { k.tokens.forEach(function (w) { VOCAB[w] = true; addAlias(w, w); }); });
		t.exampleSets.forEach(function (s) { Object.keys(s).forEach(function (w) { VOCAB[w] = true; addAlias(w, w); }); });
	});
	Object.keys(SYNONYMS).forEach(function (k) { addAlias(k, SYNONYMS[k]); });
	var ALIAS_LIST = Object.keys(ALIAS);

	/** Question tokens mapped to the vocabulary, correcting small typos. */
	function questionTokens(text) {
		var out = {};
		contentWords(text).forEach(function (w) {
			var c = canon(w);
			if (VOCAB[c]) { out[c] = true; return; }
			if (ALIAS[w] || ALIAS[c]) { out[ALIAS[w] || ALIAS[c]] = true; return; }
			var budget = typoBudget(w.length);
			if (budget) {
				var best = null, bestD = budget + 1;
				for (var i = 0; i < ALIAS_LIST.length; i++) {
					var v = ALIAS_LIST[i];
					if (v.charAt(0) !== w.charAt(0)) continue;
					var d = Math.min(editDistance(w, v, budget), editDistance(c, v, budget));
					if (d < bestD) { bestD = d; best = v; }
				}
				if (best) { out[ALIAS[best]] = true; return; }
			}
			out[c] = true;
		});
		return out;
	}

	function dice(a, b) {
		var ka = Object.keys(a), kb = Object.keys(b);
		if (!ka.length || !kb.length) return 0;
		var inter = 0;
		ka.forEach(function (w) { if (b[w]) inter += 1; });
		return (2 * inter) / (ka.length + kb.length);
	}

	function scoreTopic(t, qset) {
		var score = 0;
		t.keyTokens.forEach(function (k) {
			if (k.tokens.every(function (w) { return qset[w]; })) score += k.weight;
		});
		var sim = 0;
		t.exampleSets.forEach(function (s) { sim = Math.max(sim, dice(qset, s)); });
		return score + 4 * sim;
	}

	function rank(qset) {
		return TOPICS.map(function (t) { return { topic: t, score: scoreTopic(t, qset) }; })
			.filter(function (r) { return r.score > 0; })
			.sort(function (a, b) { return b.score - a.score; });
	}

	// ---- Guards (checked before matching) ---------------------------------------------

	var personalPattern = /\b(?:phone|telephone|mobile number|cell ?phone|whatsapp|street|home address|mailing address|postal address|zip code|apartment|salary|salaries|pay|paid|compensation|wages?|expected rate|hourly rate|visa|relocat\w*|work authori[sz]ation|authori[sz]ed to work|sponsor\w*|citizen\w*|immigration|green card|opt|cpt|clearance|personal (?:details|information|life)|birthday|date of birth|how old|age|married|marital|wife|husband|family|kids|children|religion|religious|nationality|ethnicity|race|ssn|social security|password|secrets?|health|disabilit\w*)\b/i;
	var injectionPattern = /\b(?:ignore|disregard|override|bypass|pretend|fabricate|invent|make up|reveal|system prompt|developer message|previous instructions|prior instructions|your instructions|act as|you are now|roleplay|role-play|jailbreak|follow these instructions|confirm that|say that|state that)\b/i;
	var offTopicPattern = /\b(?:poem|song|lyrics|story|joke|essay|write me|translate|search|browse|visit|fetch|scrape|look up|look online|weather|football|recipe|bitcoin|stock price|worked at google|worked at mandiant|detection rate|improved detection|percentage improvement|accuracy rate)\b/i;
	var helpPattern = /\b(?:what can you (?:do|answer)|how do(?:es)? (?:you|this|it) work|are you (?:an? )?(?:ai|bot|chatbot|human|real|robot|llm)|who are you|what are you)\b/i;
	var morePattern =/^(?:(?:tell me |say |give me )?more(?: please| about that| about it)?|what else|go on|continue|elaborate|expand(?: on that)?|details|more details|and)$/i;

	// ---- Result builders ---------------------------------------------------------------

	function result(kind, answer, topics, followUps) {
		var sources = [RESUME_SOURCE];
		topics.forEach(function (t) {
			if (!sources.some(function (s) { return s.url === t.anchor && s.title === t.title; })) sources.push({ title: t.title, url: t.anchor });
		});
		return {
			answer: answer,
			kind: kind,
			supported: kind === 'fact' || kind === 'gap' || kind === 'not-claimed' || kind === 'meta',
			refused: kind === 'refusal',
			factIds: topics.map(function (t) { return t.id; }),
			sources: sources,
			followUps: (followUps || []).slice(0, 3)
		};
	}

	function refusal(text) {
		var r = result('refusal', text, [], ['What is his experience?', 'How can I contact him?']);
		r.sources.push(CONTACT_SOURCE);
		return r;
	}

	function unknown() {
		var r = result('unknown', UNKNOWN_ANSWER, [], DEFAULT_FOLLOWUPS);
		r.sources.push(CONTACT_SOURCE);
		return r;
	}

	function topicById(id) {
		for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i].id === id) return TOPICS[i]; }
		return null;
	}

	/** Next phrasing of a topic for this session (used in turn). */
	function phrase(t, session) {
		var n = session.counts[t.id] || 0;
		session.counts[t.id] = n + 1;
		return t.say[n % t.say.length];
	}

	function answerTopics(topics, session, lead) {
		var parts = topics.map(function (t) { return phrase(t, session); });
		if (lead) parts.unshift(lead);
		var kind = topics[0].kind;
		session.last = topics[0].id;
		var next = [];
		topics.forEach(function (t) { t.next.forEach(function (q) { if (next.indexOf(q) < 0) next.push(q); }); });
		return result(kind, parts.join('\n\n'), topics, next);
	}

	var THRESHOLD = 3;
	var CONTENT_KINDS = { fact: true, gap: true, 'not-claimed': true };

	// ---- Local rule-based engine ---------------------------------------------------------

	function localEngine(question, session) {
		if (typeof question !== 'string') return unknown();
		var q = question.trim();
		if (!q || q.length > 500) return unknown();

		if (injectionPattern.test(q)) return refusal(REFUSAL_INSTRUCTIONS);
		if (/\bstreet address\b|\bhome address\b/i.test(q) || (/\baddress\b/i.test(q) && !/\be-?mail\b/i.test(q))) return refusal(REFUSAL_PERSONAL);
		if (personalPattern.test(q)) return refusal(REFUSAL_PERSONAL);
		if (offTopicPattern.test(q)) return unknown();

		// Questions about the assistant itself.
		if (helpPattern.test(q)) return answerTopics([topicById('help')], session);

		// "Tell me more" continues the previous topic.
		if (morePattern.test(normalizeText(q)) && session.last) {
			var lastTopic = topicById(session.last);
			if (lastTopic.more && !session.moreShown[lastTopic.id]) {
				session.moreShown[lastTopic.id] = true;
				return result(lastTopic.kind, lastTopic.more, [lastTopic], lastTopic.next);
			}
			return answerTopics([lastTopic], session);
		}

		var qset = questionTokens(q);
		// "Tell me about Wellington" / "Describe him": nothing left but the person.
		if (!Object.keys(qset).length && /\b(?:wellington|welly|him|he|candidate)\b/i.test(q)) return answerTopics([topicById('about')], session);
		var ranked = rank(qset);
		if (!ranked.length || ranked[0].score < THRESHOLD) return unknown();

		var top = ranked[0].topic;

		// Fit questions: the evidence list, plus the role area when one is named.
		var fitAsked = /\b(?:fit|hire|match|suited|qualified|stand out|why (?:him|wellington|welly))\b/i.test(q);
		if (fitAsked) {
			var area = ranked.filter(function (r) { return r.topic.id !== 'why' && CONTENT_KINDS[r.topic.kind] && r.score >= THRESHOLD; })[0];
			var why = topicById('why');
			return answerTopics(area ? [why, area.topic] : [why], session);
		}

		// A second, nearly as strong content topic is answered alongside the first.
		var picked = [top];
		var second = ranked[1];
		if (second && CONTENT_KINDS[top.kind] && CONTENT_KINDS[second.topic.kind] && second.score >= Math.max(THRESHOLD + 1, 0.85 * ranked[0].score)) picked.push(second.topic);
		return answerTopics(picked, session);
	}

	// ---- Adapter -----------------------------------------------------------------------------
	// The single extension point. A later API-backed option would replace this
	// function body (keeping the guards above, the result shape, and the page
	// label in step). Today it calls the local engine only; no network.

	function resolveAnswer(question, session) {
		return localEngine(question, session);
	}

	function createSession() { return { counts: {}, last: null, moreShown: {} }; }

	var defaultSession = createSession();

	function answer(question, session) {
		return resolveAnswer(question, session || defaultSession);
	}

	var suggestions = [
		'Has Wellington led a team?',
		'Why is Wellington a fit for a detection engineering role?',
		'What has he deployed?',
		'What AI projects has he built?',
		'Is he a good communicator?',
		'Does he know Kubernetes?'
	];

	// Flat view of every answer text (tests check all of it for privacy rules).
	var facts = TOPICS.map(function (t) {
		return { id: t.id, kind: t.kind, title: t.title, anchor: t.anchor, onResume: t.onResume, refs: t.refs, next: t.next,
			text: t.say.concat(t.more ? [t.more] : []).join('\n\n') };
	});

	var api = {
		answer: answer,
		resolveAnswer: resolveAnswer,
		createSession: createSession,
		normalizeText: normalizeText,
		topics: TOPICS,
		facts: facts,
		suggestions: suggestions,
		RESUME_PDF: RESUME_PDF,
		UNKNOWN_ANSWER: UNKNOWN_ANSWER
	};

	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	root.ResumeAssistant = api;

	// ---- Page wiring (browser only) -------------------------------------------------------------

	var MAX_TURNS = 6;

	function isSafeHref(url) {
		return url.charAt(0) === '#' || url === RESUME_PDF;
	}

	function el(tag, cls, text) {
		var node = document.createElement(tag);
		if (cls) node.className = cls;
		if (text !== undefined) node.textContent = text;
		return node;
	}

	function renderTurn(log, question, res, ask) {
		var turn = el('div', 'assistant-turn');
		turn.appendChild(el('p', 'assistant-q', question));
		var muted = res.kind === 'unknown' || res.kind === 'refusal';
		turn.appendChild(el('p', 'assistant-answer-text' + (muted ? ' assistant-answer-text--muted' : ''), res.answer));

		var links = res.sources.filter(function (s) { return isSafeHref(s.url); });
		if (links.length) {
			var list = el('div', 'assistant-sources');
			list.appendChild(el('span', 'assistant-sources-label', 'Sources:'));
			links.forEach(function (s) {
				var a = el('a', 'tech-tag', s.title);
				a.href = s.url;
				if (s.url === RESUME_PDF) a.setAttribute('download', '');
				list.appendChild(a);
			});
			turn.appendChild(list);
		}

		if (res.followUps && res.followUps.length) {
			var fu = el('div', 'assistant-followups');
			fu.setAttribute('aria-label', 'Follow-up questions');
			res.followUps.forEach(function (fq) {
				var b = el('button', 'btn btn--outline btn--sm', fq);
				b.type = 'button';
				b.addEventListener('click', function () { ask(fq); });
				fu.appendChild(b);
			});
			turn.appendChild(fu);
		}

		log.appendChild(turn);
		while (log.children.length > MAX_TURNS) log.removeChild(log.firstChild);
		if (turn.scrollIntoView) turn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}

	function init() {
		var form = document.getElementById('assistant-form');
		var input = document.getElementById('assistant-input');
		var output = document.getElementById('assistant-answer');
		var chips = document.getElementById('assistant-suggestions');
		if (!form || !input || !output) return;
		var session = createSession();

		function ask(question) {
			renderTurn(output, question, resolveAnswer(question, session), ask);
			input.value = '';
		}

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (input.value.trim()) ask(input.value.trim());
		});

		if (chips) {
			suggestions.forEach(function (s) {
				var b = el('button', 'btn btn--outline btn--sm', s);
				b.type = 'button';
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
