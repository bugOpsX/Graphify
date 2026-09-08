import React from 'react';

export const MSTLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = 'var(--color-primary)',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 3 Connected Nodes Triangle matching reference mockup logo */}
      <circle cx="12" cy="4.5" r="2.5" fill="var(--bg-card)" stroke={color} strokeWidth="1.75" />
      <circle cx="4.5" cy="18.5" r="2.5" fill="var(--bg-card)" stroke={color} strokeWidth="1.75" />
      <circle cx="19.5" cy="18.5" r="2.5" fill="var(--bg-card)" stroke={color} strokeWidth="1.75" />
      <line x1="10" y1="6" x2="6.5" y2="16.5" stroke={color} strokeWidth="1.75" />
      <line x1="14" y1="6" x2="17.5" y2="16.5" stroke={color} strokeWidth="1.75" />
      <line x1="7" y1="18.5" x2="17" y2="18.5" stroke={color} strokeWidth="1.75" />
    </svg>
  );
};
