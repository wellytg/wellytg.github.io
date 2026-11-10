// Local-only grounding check: every `refs` entry in assistant.js must exist in
// the canonical skills register. The register is private and lives outside
// this repo, so this test SKIPS (exit 0) unless REGISTER_PATH points at it:
//   REGISTER_PATH=/path/to/master_skill_register_v2_24.json node tests/register_trace.test.mjs
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const assistant = require('../assistant.js');
const path = process.env.REGISTER_PATH;

if (!path || !existsSync(path)) {
	console.log('SKIP  register trace (set REGISTER_PATH to the skills register JSON to run it)');
	process.exit(0);
}

const reg = JSON.parse(readFileSync(path, 'utf8'));
const lc = (s) => String(s).toLowerCase();

// Which field holds the name for each list section.
const NAME_FIELD = {
	projects: 'name', skill_gaps: 'skill', certifications: 'cert', experience: 'title',
	education: 'degree', achievements_extracurricular: 'item'
};

function resolve(ref) {
	const [pathPart, needle] = ref.split(/:(.+)/);
	let node = reg;
	for (const key of pathPart.split('.')) {
		if (node == null || !(key in node)) return false;
		node = node[key];
	}
	if (needle === undefined) return node != null;
	if (!Array.isArray(node)) return false;
	const section = pathPart.split('.')[0];
	return node.some((entry) => {
		const name = typeof entry === 'string' ? entry : (entry[NAME_FIELD[section]] ?? entry.skill ?? '');
		return lc(name).includes(lc(needle));
	});
}

let passed = 0;
let failed = 0;
for (const t of assistant.topics) {
	for (const ref of t.refs) {
		if (resolve(ref)) passed += 1;
		else { failed += 1; console.log(`FAIL  ${t.id}: ${ref}`); }
	}
}
console.log(`register trace (${reg.meta?.version ?? 'unknown version'}): ${passed} refs found, ${failed} missing`);
process.exit(failed ? 1 : 0);
