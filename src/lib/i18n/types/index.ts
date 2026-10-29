/**
 * Translation dictionary types for the bAIk platform, one file per screen domain.
 * The `Translations` interface enforces 100% key parity between 'en' and 'cs' at compile time.
 * Modules care and shop get their own domain files when they are built.
 */

import type { CommonTexts } from './common';
import type { NavigationTexts } from './navigation';
import type { WizardTexts } from './wizard';
import type { DiagnosticReportTexts } from './diagnosticReport';
import type { DiagnosisTexts } from './diagnosis';
import type { PrePurchaseAuditTexts } from './prePurchaseAudit';
import type { StudioTexts } from './studio';
import type { DashboardTexts } from './dashboard';
import type { AuthTexts } from './auth';
import type { ProfileTexts } from './profile';
import type { StockBikeTexts } from './stockBike';
import type { AdminTexts } from './admin';
import type { CapabilitiesTexts } from './capabilities';
import type { MiniTestsTexts } from './miniTests';
import type { ShellTexts } from './shell';
import type { FinderTexts } from './finder';
import type { CustomSetupTexts } from './customSetup';
import type { GeometryTexts } from './geometry';

export type { DiagnosisText } from './diagnosis';

export type Locale = 'en' | 'cs';

export interface Translations {
  common: CommonTexts;
  navigation: NavigationTexts;
  wizard: WizardTexts;
  diagnosticReport: DiagnosticReportTexts;
  diagnosis: DiagnosisTexts;
  prePurchaseAudit: PrePurchaseAuditTexts;
  studio: StudioTexts;
  dashboard: DashboardTexts;
  auth: AuthTexts;
  profile: ProfileTexts;
  stockBike: StockBikeTexts;
  admin: AdminTexts;
  capabilities: CapabilitiesTexts;
  miniTests: MiniTestsTexts;
  shell: ShellTexts;
  finder: FinderTexts;
  customSetup: CustomSetupTexts;
  geometry: GeometryTexts;
}
