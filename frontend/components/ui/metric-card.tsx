import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'warn' | 'stable';
  trendVal?: string;
  color?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendVal,
  color = 'text-primary',
  className = '',
}) => {
  const trendClasses = {
    up: 'bg-success/15 text-success border border-success/30',
    down: 'bg-primary/15 text-primary border border-primary/30',
    warn: 'bg-warning/15 text-warning border border-warning/30 animate-pulse',
    stable: 'bg-border/60 text-muted',
  };

  return (
    <div className={`glass-panel glass-panel-hover rounded-card p-card-padding flex flex-col justify-between h-40 relative group border border-border/80 shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-bold text-muted uppercase tracking-wider">{title}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      
      <div className="my-xs">
        <span className="text-display font-bold tracking-tight text-text leading-none">{value}</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
        <span className="text-[12px] text-muted font-normal truncate pr-xs">{subtext}</span>
        {trendVal && (
          <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 flex-shrink-0 ${trend ? trendClasses[trend] : ''}`}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trendVal}
          </span>
        )}
      </div>
    </div>
  );
};
