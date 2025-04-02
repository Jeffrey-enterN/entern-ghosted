import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface LoadingMascotProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// The different loading states/animations
const loadingStates = [
  'Looking for jobs...',
  'Hunting ghosts...',
  'Checking reviews...',
  'Analyzing data...',
  'Almost there...',
];

export default function LoadingMascot({ 
  message, 
  size = 'md', 
  className 
}: LoadingMascotProps) {
  const [loadingMessage, setLoadingMessage] = useState(message || loadingStates[0]);
  
  // Cycle through loading messages if no specific message is provided
  useEffect(() => {
    if (message) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingStates.length;
      setLoadingMessage(loadingStates[currentIndex]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [message]);
  
  // Set size classes
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Ghost SVG with animations */}
        <svg 
          className="w-full h-full"
          viewBox="0 0 240 240" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ghost body with gentle floating animation */}
          <g className="animate-float">
            <path 
              d="M120 30C78.6 30 45 63.6 45 105v75c0 16.6 13.4 30 30 30h90c16.6 0 30-13.4 30-30v-75c0-41.4-33.6-75-75-75z" 
              fill="#F8F3E9" 
              stroke="#3D302A" 
              strokeWidth="4"
            />
            {/* Ghost bottom curves */}
            <path 
              d="M45 180c0 10 5 15 15 15s15-5 15-15-5-15-15-15-15 5-15 15zM75 180c0 10 5 15 15 15s15-5 15-15-5-15-15-15-15 5-15 15zM105 180c0 10 5 15 15 15s15-5 15-15-5-15-15-15-15 5-15 15z" 
              fill="#F8F3E9" 
              stroke="#3D302A" 
              strokeWidth="4"
            />
            {/* Ghost eyes */}
            <ellipse cx="90" cy="105" rx="15" ry="22.5" fill="#3D302A" className="animate-blink" />
            <ellipse cx="150" cy="105" rx="15" ry="22.5" fill="#3D302A" className="animate-blink" />
            {/* Ghost mouth */}
            <path 
              d="M135 125c0 8.3-6.7 15-15 15s-15-6.7-15-15" 
              stroke="#3D302A" 
              strokeWidth="4" 
              strokeLinecap="round"
              className="animate-smile"
            />
          </g>
          
          {/* Cat - with more energetic animation */}
          <g className="animate-bounce-slow">
            <path 
              d="M120 135c-16.6 0-30 13.4-30 30s13.4 30 30 30 30-13.4 30-30-13.4-30-30-30z" 
              fill="#FF9F43" 
              stroke="#3D302A" 
              strokeWidth="3"
            />
            {/* Cat ears */}
            <path 
              d="M100 145l-10-15M140 145l10-15" 
              stroke="#3D302A" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            {/* Cat stripes */}
            <path 
              d="M110 150h20M105 160h30M110 170h20" 
              stroke="#E67E22" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            {/* Cat face */}
            <circle cx="110" cy="155" r="2" fill="#3D302A" />
            <circle cx="130" cy="155" r="2" fill="#3D302A" />
            <path 
              d="M120 160v5M115 165c0 2.8 2.2 5 5 5s5-2.2 5-5" 
              stroke="#3D302A" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            {/* Cat whiskers */}
            <path 
              d="M105 162h-10M135 162h10" 
              stroke="#3D302A" 
              strokeWidth="1" 
              strokeLinecap="round"
            />
            {/* Cat tail */}
            <path 
              d="M150 155c10 0 20 10 25 0" 
              stroke="#FF9F43" 
              strokeWidth="6" 
              strokeLinecap="round"
              fill="none"
              className="animate-wag"
            />
          </g>
          
          {/* Sparkles with twinkling animation */}
          <g className="animate-twinkle">
            <path 
              d="M70 155l5-5 5 5-5 5zM170 115l5-5 5 5-5 5z" 
              fill="#FFD700" 
              stroke="#FFD700"
            />
          </g>
        </svg>
      </div>
      
      {/* Loading message */}
      <p className="mt-4 text-center font-medium animate-pulse">
        {loadingMessage}
      </p>
    </div>
  );
}