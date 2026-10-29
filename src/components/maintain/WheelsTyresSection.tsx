import React, { useState } from 'react';
import { FlatRepairWizard } from './FlatRepairWizard';
import { WheelsTyresCard, type WheelsCardProps } from './WheelsTyresCard';

/** The wheels and tyres card, which gives way to the flat repair guide while the rider is in it. */
export const WheelsTyresSection: React.FC<Omit<WheelsCardProps, 'onOpenFlat'>> = (props) => {
  const [flat, setFlat] = useState(false);
  if (flat) return <FlatRepairWizard t={props.t} onClose={() => setFlat(false)} />;
  return <WheelsTyresCard {...props} onOpenFlat={() => setFlat(true)} />;
};
