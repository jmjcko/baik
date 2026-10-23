import { common } from './common';
import { navigation } from './navigation';
import { entryRouter } from './entryRouter';
import { wizard } from './wizard';
import { diagnosticReport } from './diagnosticReport';
import { diagnosis } from './diagnosis';
import { prePurchaseAudit } from './prePurchaseAudit';
import { studio } from './studio';
import { dashboard } from './dashboard';
import { auth } from './auth';
import { profile } from './profile';
import { stockBike } from './stockBike';
import { admin } from './admin';
import type { Translations } from '../types';

export const cs: Translations = {
  common,
  navigation,
  entryRouter,
  wizard,
  diagnosticReport,
  diagnosis,
  prePurchaseAudit,
  studio,
  dashboard,
  auth,
  profile,
  stockBike,
  admin,
};
