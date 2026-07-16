import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  badgeText?: string;
  children: React.ReactNode;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  badgeText = 'AI Generated',
  children,
  className = '',
}) => {
  return (
    <div className={`glass-panel rounded-card p-card-padding border border-primary/25 glow-primary relative overflow-hidden shadow-lg ${className}`}>
      {/* Decorative background sparkles */}
      <div className="absolute top-0 right-0 p-4 text-primary/5 pointer-events-none">
        <Sparkles className="h-24 w-24" />
      </div>
      
      <div className="flex items-start gap-md relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/20 text-primary border border-primary/35 flex-shrink-0 shadow-md">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div className="space-y-xs w-full">
          <div className="flex items-center gap-xs flex-wrap">
            <h4 className="font-bold text-[14px] text-text uppercase tracking-wider">
              {title}
            </h4>
            {badgeText && (
              <span className="bg-success/20 text-success text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-success/30">
                {badgeText}
              </span>
            )}
          </div>
          <div className="text-body text-muted leading-relaxed font-normal">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
