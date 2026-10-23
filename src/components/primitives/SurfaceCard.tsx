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
    flat: 'bg-surface border border-line shadow-sm',
    elevated: 'bg-surface border border-line shadow-md',
    glow: 'bg-surface border border-tone-info-line shadow-md',
  }[elevation];

  return (
    <div className={`rounded-2xl p-5 ${elevationStyles} ${className}`}>
      {children}
    </div>
  );
};
