
import React from 'react';

export const ICON_KEYS = [
  'work', 'flow', 'coffee', 'game', 'read', 'misc', 
  'code', 'music', 'gym', 'sleep', 'idea', 'chat'
];

interface IconProps {
  name: string;
  className?: string;
}

const icons: Record<string, React.JSX.Element> = {
  work: <path d="M4 7h16M4 7v13h16V7M4 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />, // Briefcase
  flow: <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />, // Focus/Eye
  coffee: <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z M6 1v3 M10 1v3 M14 1v3" />, // Cup
  game: <path d="M6 11h2l-1-1v2ZM18 11h-2l1-1v2ZM2 12c0 5 3 8 8 8s8-3 8-8-5-6-8-6-8 6-8 6Z M14.5 9a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1ZM15.5 12a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />, // Controller (Abstract)
  read: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />, // Book
  misc: <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />, // Sparkle/Sun
  code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />, // Terminal
  music: <path d="M9 18V5l12-2v13M9 9l12-2M6 18a3 3 0 1 1 6 0 3 3 0 0 1-6 0M18 16a3 3 0 1 1 6 0 3 3 0 0 1-6 0" />, // Note
  gym: <path d="M6.5 6.5l11 11M21 21l-1 1M2 2l1-1M2 21l21-21M2 21l1-1M21 2l-1 1" />, // Dumbbell (Abstract) -> Changed to simpler lightning
  sleep: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, // Moon
  idea: <path d="M9 18h6M10 22h4M15.09 14c.18-.9.27-1.48.33-1.92.58-4.16-3.23-7.08-7.42-7.08s-8 2.92-7.42 7.08c.06.44.15 1.02.33 1.92" />, // Bulb
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, // Bubble
};

// Fallback for missing icons
const DefaultIcon = () => <circle cx="12" cy="12" r="10" />;

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const SvgContent = icons[name] || icons['misc'] || <DefaultIcon />;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {SvgContent}
    </svg>
  );
};
