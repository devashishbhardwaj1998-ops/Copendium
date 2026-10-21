import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    hero: 'w-12 h-12',
  }[size];

  const svgSize = {
    sm: 28,
    md: 32,
    lg: 40,
    hero: 48,
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Minimalist Vector Emblem for Compendium */}
      <div
        className={`${iconDimensions} rounded-lg bg-slate-900 dark:bg-slate-800 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0 ring-1 ring-slate-800/80 dark:ring-slate-700 group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-colors`}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Subtle architectural vertical axis */}
          <line x1="16" y1="4" x2="16" y2="28" stroke="#334155" strokeWidth="0.75" strokeDasharray="1.5 2" />
          
          {/* Minimalist Geometric 'C' + Compendium Volumes */}
          {/* Base Spine Arc */}
          <path
            d="M6 23C9.5 20.5 13 21 16 23C19 21 22.5 20.5 26 23"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Left Wing / C-profile */}
          <path
            d="M6 9C9.5 6.5 13 7 16 9V23C13 21 9.5 20.5 6 23V9Z"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right Wing */}
          <path
            d="M26 9C22.5 6.5 19 7 16 9V23C19 21 22.5 20.5 26 23V9Z"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Central Knowledge Diamond / Compass Node */}
          <path
            d="M16 4.5L17.5 7L16 9.5L14.5 7L16 4.5Z"
            fill="#C7D2FE"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Compendium
          </span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
            Private Markets Knowledge Book
          </span>
        </div>
      )}
    </div>
  );
};
