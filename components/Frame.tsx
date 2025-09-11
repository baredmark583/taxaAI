import React from 'react';
import { cn } from '@/lib/utils';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'default' | 'none';
  hasBottomNav?: boolean;
}

const Frame: React.FC<FrameProps> = ({ children, className, padding = 'default', hasBottomNav = false }) => {
  return (
    <div className="fixed inset-0 bg-black p-2 pointer-events-none">
      {/* Outermost layer for shadow and background */}
      <div className="relative w-full h-full bg-background-dark rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.7)] pointer-events-auto">
        
        {/* Decorative border layers */}
        <div className="absolute inset-0 border-4 border-gold-accent/20 rounded-lg pointer-events-none"></div>
        <div className="absolute inset-1 border-2 border-black/50 rounded-md pointer-events-none"></div>
        <div className="absolute inset-2 border-2 border-gold-accent/40 rounded-sm pointer-events-none"></div>
        
        {/* Inner shadow for depth */}
        <div className="absolute inset-2 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] rounded-sm pointer-events-none"></div>

        {/* Content area */}
        <div className={cn(
          "w-full h-full overflow-y-auto",
          padding === 'default' && 'p-2 sm:p-4',
          hasBottomNav && 'pb-20', // Add padding for the nav bar (h-16 is 64px, so ~80px is good)
          className
        )}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Frame;
