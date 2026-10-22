# Architecture Diagrams — bAIk (Universal AI Cycling Intelligence Hub)

**Source**: `docs/architecture/design/00-system-architecture-greenfield.md`  
**Generated**: 2026-10-20  
**Author**: AIRE_ARCHITECT  

> This file contains Mermaid diagrams extracted from the architecture document for easy visual preview.  
> For full architecture details, refer to the source document at [00-system-architecture-greenfield.md](file:///Users/jan.mynar/Documents/GitHub/baik/docs/architecture/design/00-system-architecture-greenfield.md).

---

## 1. System Context Diagram

```mermaid
C4Context
  title System Context Diagram - bAIk Cycling Hub
  
  Person(cyclist, "Cyclist / Mechanic", "Uses bAIk for precision bike fitting, maintenance checks, and component ROI analysis.")
  System(baikSystem, "bAIk Platform", "Next.js 16 App Router application hosting bAIkfit, bAIkcare, and bAIkshop engines.")
  System_Ext(ComponentIndex, "Component Compatibility Index (future bAIkshop)", "External component compatibility and pricing index.")
  System_Ext(notebookLM, "Google NotebookLM / LLM Orchestrator", "Domain source synthesis and prompt generation partner.")
  
  Rel(cyclist, baikSystem, "Inputs rider measurements, views CAD blueprint, tracks wear")
  Rel(baikSystem, ComponentIndex, "Queries component specs, compatibility, and real-time prices")
  Rel(notebookLM, baikSystem, "Provides synthesized cycling research, prompt templates, and biomechanical specs")
```

---

## 2. Component Architecture Diagram

```mermaid
flowchart TB
  subgraph PresentationLayer ["Presentation Layer (React 19 / Material 3)"]
    Navbar["Top Navigation & Monospace Telemetry Header"]
    FitStudio["bAIkfit Studio: Interactive Bicycle Wireframe CAD + Sliders"]
    CareWorkshop["bAIkcare Workshop: 5-Node M-Check & Chain Gauge"]
    ShopMatrix["bAIkshop Hub: High-ROI Upgrade Matrix & Silca Pressure"]
    I18nProvider["Bilingual Provider (en / cs)"]
  end

  subgraph StateLayer ["Client State & Store"]
    FitStore["Rider Profile & Fit State (Local/URL)"]
    MaintenanceStore["Bike Maintenance & Wear Log"]
  end

  subgraph CoreEngines ["Core Calculation Engines (Pure TypeScript / Zero DOM)"]
    FitEngine["bAIkfit Engine (XY Coordinates, Acromion, Crank Optimizer)"]
    CareEngine["bAIkcare Engine (M-Check Protocol, Wash Flow, Chain/Sweat Wear)"]
    ShopEngine["bAIkshop Engine (Silca Tire Pressure, Upgrade ROI Index)"]
  end

  subgraph DesignTokens ["Design Tokens (globals.css)"]
    DarkTokens["Primary Dark: Obsidian #0F172A, Cards #1E293B, Cyan #00B4D8"]
    LightTokens["Light Alternative: Canvas #F4F6F8, Cards #FFFFFF, Blue #01579B"]
  end

  Navbar --> I18nProvider
  FitStudio --> FitStore
  CareWorkshop --> MaintenanceStore
  FitStore --> FitEngine
  MaintenanceStore --> CareEngine
  ShopMatrix --> ShopEngine
  PresentationLayer --> DesignTokens
```

---

## 3. Data Model & ER Diagram

```mermaid
erDiagram
  RIDER_PROFILE ||--o{ BIKE_GEOMETRY : "owns"
  RIDER_PROFILE ||--o{ MAINTENANCE_RECORD : "logs"
  BIKE_GEOMETRY ||--o{ UPGRADE_EVALUATION : "evaluates"

  RIDER_PROFILE {
    string id PK
    number heightMm
    number inseamMm
    number acromionWidthMm
    number weightKg
    string ridingDiscipline "road | gravel | xc_mtb"
    string flexibilityLevel "low | medium | high"
  }

  BIKE_GEOMETRY {
    string id PK
    string riderId FK
    number bottomBracketOriginX "always 0"
    number bottomBracketOriginY "always 0"
    number saddleHeightYMm "Inseam * 0.883 at 70mm width"
    number saddleSetbackXMm
    number saddleNoseTiltDeg "-1.0 to -2.0 safe range"
    number stackMm
    number reachMm
    number handlebarWidthMm
    number crankLengthMm
    string ulnarRiskLevel "LOW | MODERATE | HIGH"
  }

  MAINTENANCE_RECORD {
    string id PK
    string riderId FK
    string component "chain | cassette | disc_rotor | headset_bearings"
    number chainWearPercentage "0.5% replace chain, 0.75% replace cassette"
    boolean indoorTrainerUsed "triggers sweat corrosion alert"
    string mCheckStatus "5-nodes verified"
    date lastServiceDate
  }

  UPGRADE_EVALUATION {
    string id PK
    string bikeGeometryId FK
    string upgradeItem "tires_tubeless | contact_points | tpu_tubes | wheels"
    number costCzk
    number estimatedWattsSaved
    string roiTier "TIER_1_ESSENTIAL | TIER_2_SIGNIFICANT | TIER_3_MARGINAL"
  }
```
