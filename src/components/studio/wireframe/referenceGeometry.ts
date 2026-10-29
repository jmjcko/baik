import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { computeWireframeGeometry, type WireframeKind } from './geometry';

const REFERENCE_INSEAM_MM = 840;

/** The silhouette of the CAD studio drawn for a reference rider: the guides and the workshop show a bike, not a particular rider. */
export const referenceGeometry = (kind: WireframeKind) =>
  computeWireframeGeometry(computeBikeFitCoordinates({ inseamMm: REFERENCE_INSEAM_MM, ridingDiscipline: kind === 'mtb' ? 'xc_mtb' : 'road' }), undefined, kind);
