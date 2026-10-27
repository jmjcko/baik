import { frameOf } from '@/lib/bikes/frameOf';
import { bikeOfSizes } from '@/lib/bikes/suppliedBike';
import { rankSizes } from '@/lib/bikes/sizeRanking';
import type { PrePurchaseGeometry, RiderProfile } from '@/types/baikfit';
import type { StockFrame } from './stockFrame';

/**
 * The frame of the audit: the size of the bike that fits the rider best (the same ranking as the stock bike audit), with the
 * numbers of the maker's table and the factory handlebar and cranks of that size (0 when the table does not state them, so no rule is
 * raised about a part that is not known).
 */
export function bestFrameOf(rider: RiderProfile, geometry: PrePurchaseGeometry): StockFrame {
  const bike = bikeOfSizes('audit', { brand: 'Audit', model: 'Bike', year: 2000, sizes: geometry.sizes }, rider.bikeKind ?? 'road');
  const [best] = rankSizes(rider, bike);
  return frameOf(best.size, bike.sizes[best.size]);
}
