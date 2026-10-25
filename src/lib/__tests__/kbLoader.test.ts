/**
 * Unit Test Suite for bAIktime Hub Knowledge Base Loader & Grounding Utility
 * 
 * 3Pillar AIRE SDLC Agentic Framework
 * Quality Gates: Vitest + TypeScript + AGENTS.md Zero-Icons & Bilingual Parity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadKnowledgeBase,
  extractKnowledgeSection,
  getDomainSystemPrompt,
  clearKnowledgeBaseCache,
  REGISTERED_KNOWLEDGE_BASES,
  BaikDomain,
} from '../kbLoader';

describe('kbLoader Utility', () => {
  beforeEach(() => {
    clearKnowledgeBaseCache();
  });

  describe('Knowledge Base Loading & Domain Grounding', () => {
    const domains: BaikDomain[] = ['baikfit', 'baikcare', 'baikshop'];

    it.each(domains)('should successfully load knowledge base for domain [%s]', (domain) => {
      const content = loadKnowledgeBase(domain);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(500);

      const meta = REGISTERED_KNOWLEDGE_BASES[domain];
      expect(content).toContain(meta.version);
    });

    it('should verify specific domain concepts in baikfit KB', () => {
      const content = loadKnowledgeBase('baikfit');

      // Core domain rules
      expect(content).toContain('XY Coordinate System');
      expect(content).toContain('70mm Width Point');
      expect(content).toContain('Ulnar Nerve Flossing');
      expect(content).toContain('Median Nerve Flossing');
      expect(content).toContain('150–165 mm');
      expect(content).toContain('LeMond Formula');
      expect(content).toContain('The 420mm Factory Trap');
    });

    it('should register the bAIkfit master knowledge base as the single source of truth', () => {
      const meta = REGISTERED_KNOWLEDGE_BASES.baikfit;
      expect(meta.version).toBe('1.4.0');
      expect(meta.sourcePath).toBe('docs/knowledge/baikfit_kb_v1.4.0.md');
      expect(loadKnowledgeBase('baikfit')).toContain('bAIkfit Domain Knowledge Base v1.4.0 (Master Single Source of Truth)');
    });

    it('should verify specific domain concepts in baikcare KB', () => {
      const content = loadKnowledgeBase('baikcare');

      // Core domain rules
      expect(content).toContain('The 5-Node M-Check Inspection Protocol');
      expect(content).toContain('Node 1: Front Wheel');
      expect(content).toContain('Node 2: Headset');
      expect(content).toContain('Node 3: Bottom Bracket');
      expect(content).toContain('Node 4: Seatpost');
      expect(content).toContain('Node 5: Rear Wheel');
      expect(content).toContain('0.50 %'); // 11s/12s chain wear limit
      expect(content).toContain('5-Minute Express Wash Protocol');
      expect(content).toContain('Galvanic Sweat Attack');
    });

    it('should verify specific domain concepts in baikshop KB', () => {
      const content = loadKnowledgeBase('baikshop');

      // Core domain rules
      expect(content).toContain('High-ROI vs. Low-ROI Upgrade Matrix');
      expect(content).toContain('Continental GP5000 S TR');
      expect(content).toContain('The Price-to-Performance Sweet Spot');
      expect(content).toContain('£1,000–£2,000');
      expect(content).toContain('Garmin Varia RTL515');
      expect(content).toContain('Silca / SRAM Impedance Model');
    });

    it('should throw an informative error when an unregistered domain is requested', () => {
      expect(() => {
        // @ts-expect-error Testing invalid domain input
        loadKnowledgeBase('invalid_domain');
      }).toThrow(/unregistered domain/i);
    });

    it('should cache loaded knowledge base content in memory for rapid repeated access', () => {
      const firstCall = loadKnowledgeBase('baikcare');
      const secondCall = loadKnowledgeBase('baikcare');

      expect(firstCall).toBe(secondCall);
    });
  });

  describe('Knowledge Section Extraction', () => {
    it('should accurately extract M-Check section from baikcare KB', () => {
      const section = extractKnowledgeSection('baikcare', 'M-Check Inspection Protocol');

      expect(section).not.toBeNull();
      expect(section).toContain('Node 1');
      expect(section).toContain('Node 5');
    });

    it('should accurately extract the diagnostic decision tree from baikfit KB', () => {
      const section = extractKnowledgeSection('baikfit', 'Clinical Symptom & Diagnostic Decision Tree');

      expect(section).not.toBeNull();
      expect(section).toContain('Ulnar Nerve');
      expect(section).toContain('Median Nerve');
      expect(section).toContain('Neck & Trapezius Pain');
    });

    it('should accurately extract Sweet Spot section from baikshop KB', () => {
      const section = extractKnowledgeSection('baikshop', 'Price-to-Performance Sweet Spot');

      expect(section).not.toBeNull();
      expect(section).toContain('£1,000–£2,000');
      expect(section).toContain('30,000–60,000 CZK');
    });

    it('should return null when a heading is not found', () => {
      const section = extractKnowledgeSection('baikfit', 'Non-existent section heading XYZ');
      expect(section).toBeNull();
    });
  });

  describe('Domain System Prompt Generation & Compliance Enforcement', () => {
    it('should generate English system prompt with strict zero-icon constraints', () => {
      const prompt = getDomainSystemPrompt('baikfit', 'en');

      expect(prompt).toContain('ZERO ICONS & ZERO EMOJIS');
      expect(prompt).toContain('BILINGUAL PARITY (EN / CZ)');
      expect(prompt).toContain('Primary language for end-user interaction is English');
      expect(prompt).toContain('DOMAIN KNOWLEDGE BASE (SSOT v1.4.0)');
      expect(prompt).toContain('XY Coordinate System');
    });

    it('should generate Czech system prompt with Czech language directive', () => {
      const prompt = getDomainSystemPrompt('baikcare', 'cs');

      expect(prompt).toContain('ZERO ICONS & ZERO EMOJIS');
      expect(prompt).toContain('Primary language for end-user interaction is Czech (cs)');
      expect(prompt).toContain('bAIkcare Workshop');
      expect(prompt).toContain('The 5-Node M-Check Inspection Protocol');
    });

    it('AGENTS.md Zero-Icon Audit: prompt and knowledge base content must contain zero emojis', () => {
      // Regular expression matching common emoji Unicode ranges
      const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      const domains: BaikDomain[] = ['baikfit', 'baikcare', 'baikshop'];

      for (const domain of domains) {
        const kbText = loadKnowledgeBase(domain);
        const promptEn = getDomainSystemPrompt(domain, 'en');
        const promptCs = getDomainSystemPrompt(domain, 'cs');

        expect(emojiRegex.test(kbText)).toBe(false);
        expect(emojiRegex.test(promptEn)).toBe(false);
        expect(emojiRegex.test(promptCs)).toBe(false);
      }
    });
  });
});
