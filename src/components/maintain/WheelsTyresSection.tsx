import { FlatRepairWizard } from './FlatRepairWizard';
import { WheelsTyresCard, type WheelsCardProps } from './WheelsTyresCard';

type SectionProps = Omit<WheelsCardProps, 'onOpenFlat'> & { flat: boolean; onFlatChange: (open: boolean) => void };

/** The wheels and tyres card, which gives way to the flat repair guide while the rider is in it (the page decides, so the tyre card can open it too). */
export const WheelsTyresSection: React.FC<SectionProps> = ({ flat, onFlatChange, ...props }) => {
  if (flat) return <FlatRepairWizard t={props.t} onClose={() => onFlatChange(false)} />;
  return <WheelsTyresCard {...props} onOpenFlat={() => onFlatChange(true)} />;
};
