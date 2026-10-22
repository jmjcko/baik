# Patterns & Standards — bAIk (Universal AI Cycling Intelligence Hub)

**Date**: 2026-10-20  
**Author**: AIRE_ARCHITECT  
**Status**: Approved  
**Version**: 1.0  
**Standard**: 3Pillar AIRE SDLC Agentic Framework & CodeGuard Standards

---

## 1. Project Organization & Directory Structure

```
baik/
├── docs/                               # AIRE SDLC Governance & Architecture
│   ├── architecture/
│   │   ├── MASTER_SPECIFICATION.md     # Grounded cycling domain knowledge
│   │   └── design/
│   │       ├── 00-system-architecture-greenfield.md
│   │       └── 01-patterns-and-standards-greenfield.md
│   ├── architecture-diagrams/          # Previewable Mermaid diagrams
│   ├── plans/
│   │   ├── dependency-graph.yml
│   │   ├── implementation-plan.md
│   │   └── stories/                    # Atomic User Stories (8 stories)
│   ├── requirements.md                 # Master Requirements & Acceptance Criteria
│   └── status.md                       # Canonical Lifecycle Tracker
├── public/
│   └── mockups/                        # Approved UI design mockups
├── src/
│   ├── app/                            # Next.js 16 App Router
│   │   ├── globals.css                 # CSS Design Tokens (Dark Obsidian & Light)
│   │   ├── layout.tsx                  # Root layout with bilingual metadata
│   │   ├── page.tsx                    # Landing / bAIkfit Studio main view
│   │   └── __tests__/                  # Page integration tests
│   ├── components/
│   │   ├── primitives/                 # Shared UI Primitives (Zero-Logic, Material 3)
│   │   │   ├── BadgeChip.tsx           # Monospace status badges [STATUS: READY]
│   │   │   ├── ActionButton.tsx        # High-contrast rounded action buttons
│   │   │   ├── MetricTile.tsx          # Real-time telemetry readouts
│   │   │   ├── RangeSlider.tsx         # Precision biomechanical inputs
│   │   │   └── SurfaceCard.tsx         # Material 3 elevated card containers
│   │   ├── studio/                     # bAIkfit Studio feature components
│   │   │   ├── BikeCadWireframe.tsx    # Interactive bicycle frame & vectors
│   │   │   └── FitTelemetryPanel.tsx   # Real-time calculations display
│   │   └── workshop/                   # bAIkcare Workshop feature components
│   │       ├── MCheckProtocol.tsx      # 5-node interactive checklist
│   │       └── ChainWearGauge.tsx      # 0.5% vs 0.75% wear indicator
│   ├── lib/
│   │   ├── engines/                    # Pure TypeScript Calculation Engines
│   │   │   ├── baikfit/                # XY fit, acromion, crank optimizer
│   │   │   ├── baikcare/               # M-Check, wash flow, sweat corrosion
│   │   │   └── baikshop/               # Silca tire pressure, ROI matrix
│   │   └── i18n/                       # 100% Bilingual Registry (en / cs)
│   │       └── translations.ts
│   └── test/
│       └── setup.ts                    # Vitest environment setup
└── vitest.config.ts                    # Vitest configuration
```

---

## 2. UI Primitive Catalogue (Strict Material Design 3)

| Primitive | Path | Responsibility | Style / Variant B Tokens |
|---|---|---|---|
| `BadgeChip` | `src/components/primitives/BadgeChip.tsx` | Monospace status indicator | Monospace font, uppercase, `border: 1px solid var(--border-accent)`, `color: var(--accent-cyan)` |
| `ActionButton` | `src/components/primitives/ActionButton.tsx` | Primary/Secondary CTA buttons | Rounded-full or rounded-md, `background: var(--accent-cyan)`, `color: #0f172a`, font-semibold |
| `MetricTile` | `src/components/primitives/MetricTile.tsx` | Telemetry readouts | Large numeric font (e.g. `742mm`), monospace sub-label, high-contrast cyan glow |
| `RangeSlider` | `src/components/primitives/RangeSlider.tsx` | Precision numerical input | Custom styled range input with numeric value readout badge, step granularity |
| `SurfaceCard` | `src/components/primitives/SurfaceCard.tsx` | Elevated container | `background: var(--surface-card)`, `border: 1px solid var(--border-subtle)`, rounded-xl |

> **MANDATORY RULE**: Any visual element without business logic that is reused in 2+ screens MUST be placed in `src/components/primitives/`. Creating ad-hoc button or badge styles in feature folders is forbidden.

---

## 3. Strict UI Design Rules: ZERO ICONS & ZERO EMOJIS

- **DO NOT** use icon packages (`lucide-react`, `heroicons`, `react-icons`) or emojis (`🚲`, `🤖`, `⚡`, `🔧`).
- **DO NOT** place decorative icon boxes or category avatar circles in headers or cards.
- **DO** use clean typography hierarchy, tracking, and monospace metadata chips:
  ```tsx
  // ✅ DO: Clean typography and monospace status badge
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold tracking-tight text-white">bAIkfit Studio</h2>
    <span className="font-mono text-xs px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-400">
      [STATUS: CALIBRATED]
    </span>
  </div>

  // ❌ DON'T: Emojis and decorative icon containers
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-blue-500"><Bot /></div>
    <h2>🤖 AI Bike Fitting Studio ✨</h2>
  </div>
  ```

---

## 4. Coding Patterns & SOLID Principles

### 4.1 Pure Functional Engines (`src/lib/engines/`)
Every calculation function must be a pure, deterministic function without side effects or browser dependencies:
```typescript
// ✅ DO: Pure, deterministic calculation function
export function calculateSaddleHeight(inseamMm: number): number {
  if (inseamMm <= 0) throw new Error("Inseam must be greater than zero");
  return Math.round(inseamMm * 0.883);
}

// ❌ DON'T: Mixing DOM or localStorage inside mathematical engines
export function getSaddleHeight() {
  const inseam = Number(localStorage.getItem('inseam'));
  document.getElementById('saddle-val').innerText = String(inseam * 0.883);
}
```

### 4.2 Error Handling Pattern
Always return structured result objects or use typed exceptions with clear error messages:
```typescript
export interface CalculationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 5. Testing Patterns (Vitest AAA & 100% Pass Rate)

All engine functions and components must have unit test suites adhering to the **Arrange-Act-Assert (AAA)** pattern:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateSaddleHeight } from './baikfit';

describe('bAIkfit Engine - calculateSaddleHeight', () => {
  it('should calculate saddle height Y based on LeMond coefficient (0.883)', () => {
    // Arrange
    const inseamMm = 840;

    // Act
    const saddleHeightY = calculateSaddleHeight(inseamMm);

    // Assert
    expect(saddleHeightY).toBe(742);
  });
});
```

---

## 6. File/Module Boundary Map

| Concern | Owning Files / Globs | Shared Files Touched |
|---|---|---|
| **Theme & Tokens** | `src/app/globals.css` | `src/app/layout.tsx` |
| **Bilingual Localization** | `src/lib/i18n/translations.ts`, `src/lib/i18n/context.tsx` | All UI views |
| **UI Primitives** | `src/components/primitives/*.tsx` | Feature components |
| **bAIkfit Studio** | `src/lib/engines/baikfit/*`, `src/components/studio/*` | `src/app/page.tsx` |
| **bAIkcare Workshop** | `src/lib/engines/baikcare/*`, `src/components/workshop/*` | Future `/care` route |
| **bAIkshop Engine** | `src/lib/engines/baikshop/*` | Future `/shop` route |
