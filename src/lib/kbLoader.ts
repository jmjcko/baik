/**
 * bAIktime Hub Knowledge Base Loader & RAG Grounding Utility
 * 
 * 3Pillar AIRE SDLC Agentic Framework
 * Standards: CodeGuard / OWASP / AGENTS.md Zero-Icons & Bilingual Parity
 */

import fs from 'node:fs';
import path from 'node:path';

export type BaikDomain = 'baikfit' | 'baikcare' | 'baikshop';

export interface KnowledgeBaseMetadata {
  domain: BaikDomain;
  version: string;
  titleEn: string;
  titleCs: string;
  sourcePath: string;
  descriptionEn: string;
  descriptionCs: string;
}

export const REGISTERED_KNOWLEDGE_BASES: Record<BaikDomain, KnowledgeBaseMetadata> = {
  baikfit: {
    domain: 'baikfit',
    version: '1.4.0',
    titleEn: 'bAIkfit Engine — Bike Fitting & Biomechanical Geometry',
    titleCs: 'bAIkfit Engine — Nastavení posedu a biomechanická geometrie',
    sourcePath: 'docs/knowledge/baikfit_kb_v1.4.0.md',
    descriptionEn: 'XY coordinate datum, saddle 70mm mark, measurement protocols, acromion handlebar matching, cleat and saddle rules, crank shortening, clinical decision tree, pre-purchase audit rules, saddle-to-bar drop with hard guards, contact planes and the reasoning of the report.',
    descriptionCs: 'XY souřadnicový systém od středu, 70mm bod sedla, protokoly měření, šířka řídítek podle akromionu, pravidla pro kufry a sedlo, zkracování klik, klinický rozhodovací strom, pravidla kontroly před nákupem, drop sedla a řídítek s tvrdými pojistkami, kontaktní roviny a zdůvodnění v reportu.',
  },
  baikcare: {
    domain: 'baikcare',
    version: '1.0.0',
    titleEn: 'bAIkcare Workshop — Maintenance Protocols & Wear Diagnostics',
    titleCs: 'bAIkcare Workshop — Protokoly údržby a diagnostika opotřebení',
    sourcePath: 'docs/knowledge/baikcare_kb_v1.0.0.md',
    descriptionEn: '5-Node M-Check inspection, chain elongation wear limits, 5-minute express wash, and indoor sweat corrosion defense.',
    descriptionCs: '5-bodový inspekční postup M-Check, limity měrky řetězu, 5-minutové mytí a ochrana před korozí potem na trenažéru.',
  },
  baikshop: {
    domain: 'baikshop',
    version: '1.0.0',
    titleEn: 'bAIkshop Engine — Component Upgrade Matrix & Value Optimizer',
    titleCs: 'bAIkshop Engine — Matice komponentních upgradů a hodnocení hodnoty',
    sourcePath: 'docs/knowledge/baikshop_kb_v1.0.0.md',
    descriptionEn: 'High-ROI vs Low-ROI upgrade tiers, price sweet spot (£1k-£2k / 30k-60k CZK), radar systems, and Silca tire pressure science.',
    descriptionCs: 'Vysoko vs nízko-nákladové upgrady, optimální cenová hladina (30 000–60 000 Kč), radary a vědecké huštění Silca.',
  },
};

// In-memory cache for fast retrieval across server action invocations
const kbCache: Map<BaikDomain, string> = new Map();

/**
 * Loads the raw markdown text for a domain knowledge base.
 * Single source of truth: docs/knowledge/ (bundled with server output via next.config.ts).
 */
export function loadKnowledgeBase(domain: BaikDomain): string {
  if (kbCache.has(domain)) {
    return kbCache.get(domain)!;
  }

  const meta = REGISTERED_KNOWLEDGE_BASES[domain];
  if (!meta) {
    throw new Error(`Unregistered domain requested: ${domain}`);
  }

  const cwd = process.cwd();
  const sourcePath = path.join(cwd, 'docs', 'knowledge', path.basename(meta.sourcePath));

  let content: string | null = null;

  try {
    if (fs.existsSync(sourcePath)) {
      content = fs.readFileSync(sourcePath, 'utf8');
    }
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read Knowledge Base for domain [${domain}]: ${details}`);
  }

  if (!content) {
    throw new Error(`Knowledge Base file not found for domain [${domain}]. Looked in: ${sourcePath}`);
  }

  kbCache.set(domain, content);
  return content;
}

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;

interface HeadingMatch {
  index: number;
  level: number;
}

function findHeading(lines: string[], query: string): HeadingMatch | null {
  const lowerQuery = query.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(HEADING_PATTERN);
    if (match && match[2].toLowerCase().includes(lowerQuery)) {
      return { index: i, level: match[1].length };
    }
  }
  return null;
}

function endsSection(line: string, level: number): boolean {
  const match = line.match(/^(#{1,6})\s+/);
  return match !== null && match[1].length <= level;
}

/**
 * Extracts a specific section from a Knowledge Base markdown document by searching for a heading.
 */
export function extractKnowledgeSection(domain: BaikDomain, headingQuery: string): string | null {
  const lines = loadKnowledgeBase(domain).split('\n');
  const heading = findHeading(lines, headingQuery);
  if (!heading) return null;

  const collected: string[] = [lines[heading.index]];
  for (let i = heading.index + 1; i < lines.length && !endsSection(lines[i], heading.level); i++) {
    collected.push(lines[i]);
  }
  return collected.join('\n').trim();
}

const COMPLIANCE_RULES = `1. ZERO ICONS & ZERO EMOJIS:
   - Strictly NO emojis or generic emoticons anywhere in titles, cards, pickers, loaders, instructions, badges, or buttons.
   - NO decorative icon boxes or avatar containers.
   - Clean, typography-driven Material Design hierarchy only.`;

const LANGUAGE_DIRECTIVES: Record<'en' | 'cs', string> = {
  cs: 'Primary language for end-user interaction is Czech (cs). Provide complete explanations in natural, technically accurate Czech while maintaining English engineering terms where standard.',
  en: 'Primary language for end-user interaction is English (en). Provide clear, authoritative, and technically precise explanations.',
};

const DIVIDER = '='.repeat(80);

/** Numeric versions read as `v1.0.0`; named editions such as `Master` stay as they are. */
function versionLabel(version: string): string {
  return /^\d/.test(version) ? `v${version}` : version;
}

/**
 * Generates an LLM system prompt grounded in the domain Knowledge Base.
 * Enforces strict compliance constraints: ZERO emojis, ZERO decorative icons, 100% bilingual parity.
 */
export function getDomainSystemPrompt(
  domain: BaikDomain,
  locale: 'en' | 'cs' = 'en'
): string {
  const kbContent = loadKnowledgeBase(domain);
  const meta = REGISTERED_KNOWLEDGE_BASES[domain];

  return `You are the ${meta.titleEn} intelligence engine.
Your diagnostic reasoning, calculations, and recommendations MUST be strictly grounded in the authoritative Knowledge Base provided below.

${DIVIDER}
MANDATORY REPOSITORY COMPLIANCE & OPERATIONAL RULES:
${DIVIDER}
${COMPLIANCE_RULES}

2. BILINGUAL PARITY (EN / CZ):
   - You must support both English and Czech with 100% functional equivalence.
   - ${LANGUAGE_DIRECTIVES[locale]}

3. DOMAIN GROUNDING (SINGLE SOURCE OF TRUTH):
   - Rely strictly on the rules, thresholds, and calculations specified in the Knowledge Base below.
   - Never invent arbitrary measurements, torque specs, or chain wear limits that contradict this text.

${DIVIDER}
DOMAIN KNOWLEDGE BASE (SSOT ${versionLabel(meta.version)}):
${DIVIDER}
${kbContent}
${DIVIDER}`;
}

/**
 * Clears the in-memory cache (primarily for unit testing or live reload).
 */
export function clearKnowledgeBaseCache(): void {
  kbCache.clear();
}
