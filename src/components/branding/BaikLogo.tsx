import React from 'react';
import Image from 'next/image';
import { LogoMark, type LogoVariant } from './logoMark';

export interface BaikLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  showWordmark?: boolean;
  useImage?: boolean;
}

const Wordmark: React.FC<{ size: number; dark: boolean }> = ({ size, dark }) => (
  <span
    className={`font-mono font-extrabold tracking-tight mt-2 ${dark ? 'text-white' : 'text-slate-900'}`}
    style={{ fontSize: `${size * 0.25}px` }}
  >
    bAIk
  </span>
);

const LogoImage: React.FC<{ size: number }> = ({ size }) => (
  <Image
    src="/baik-logo.svg"
    alt="bAIk Logo"
    width={size}
    height={size}
    unoptimized
    className="shrink-0 object-contain"
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const BaikLogo: React.FC<BaikLogoProps> = ({
  variant = 'master',
  size = 92,
  className = '',
  showWordmark = false,
  useImage = false,
}) => {
  const asImage = variant === 'master' || useImage;
  const lightBackground = !asImage && (variant === 'D' || variant === 'light');
  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {asImage ? <LogoImage size={size} /> : <LogoMark variant={variant} size={size} />}
      {showWordmark && <Wordmark size={size} dark={!lightBackground} />}
    </div>
  );
};
