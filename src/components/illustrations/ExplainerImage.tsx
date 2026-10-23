import React from 'react';
import Image from 'next/image';
import { ILLUSTRATIONS, type IllustrationId } from './illustrations';

interface ExplainerImageProps {
  id: IllustrationId;
  alt: string;
  caption: string;
  /** The widest the picture may be shown, as a Tailwind class. */
  className?: string;
}

/** One of the owner's illustrations with its description (alt text) and caption, framed like the other figures. */
export const ExplainerImage: React.FC<ExplainerImageProps> = ({ id, alt, caption, className = 'max-w-xl' }) => {
  const { src, width, height } = ILLUSTRATIONS[id];
  return (
    <figure data-testid={`illustration-${id}`} className={`w-full ${className}`}>
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 768px) 100vw, 640px" className="w-full h-auto block" />
      </div>
      <figcaption className="mt-2 text-[11px] text-ink-2 leading-relaxed">{caption}</figcaption>
    </figure>
  );
};

/** A closed section with the illustration, so that a long page stays light: "Show illustration". */
export const IllustrationToggle: React.FC<ExplainerImageProps & { label: string }> = ({ label, ...image }) => (
  <details data-testid={`illustration-toggle-${image.id}`} className="mt-2 group">
    <summary className="cursor-pointer list-none text-xs font-semibold text-accent-ink hover:underline">{label}</summary>
    <div className="mt-2">
      <ExplainerImage {...image} />
    </div>
  </details>
);
