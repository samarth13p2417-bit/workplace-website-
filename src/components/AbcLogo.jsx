import React from 'react';

export const AbcLogo = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="abcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#0065FF" />
          </linearGradient>
          <linearGradient id="abcGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C7E6" />
            <stop offset="100%" stopColor="#0052CC" />
          </linearGradient>
          <linearGradient id="abcGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFAB00" />
            <stop offset="100%" stopColor="#FF5630" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container */}
        <rect width="40" height="40" rx="9" fill="url(#abcGrad1)" />

        {/* Dynamic Stylized Layered 'A' & 'b' Hex/Delta Flow Symbol */}
        <path
          d="M20 7L32 29H25L20 18.5L15 29H8L20 7Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M16 23.5H24L20 14L16 23.5Z"
          fill="url(#abcGrad1)"
        />
        {/* Accent Dynamic Dot/Spark */}
        <circle cx="20" cy="28.5" r="2.5" fill="url(#abcGrad2)" />
        <circle cx="31.5" cy="9.5" r="2" fill="#FFAB00" />
      </svg>
    </div>
  );
};

export default AbcLogo;
