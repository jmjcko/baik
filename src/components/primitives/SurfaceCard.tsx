import React from 'react';

export interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'flat' | 'elevated' | 'glow';
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = '',
  elevation = 'flat',
}) => {
  const elevationStyles = {
    flat: 'bg-slate-900/70 border border-slate-800 shadow-sm',
    elevated: 'bg-slate-900/90 border border-slate-800/90 shadow-lg shadow-black/40',
    glow: 'bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/30',
  }[elevation];

  return (
    <div className={`rounded-2xl backdrop-blur-sm p-5 ${elevationStyles} ${className}`}>
      {children}
    </div>
  );
};
