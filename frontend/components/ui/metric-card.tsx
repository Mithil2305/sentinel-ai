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
    up: 'bg-success/10 text-success border border-success/20',
    down: 'bg-primary/10 text-primary border border-primary/20',
    warn: 'bg-warning/10 text-warning border border-warning/20',
    stable: 'bg-[#1A1A1A] border border-border/40 text-[#71717A]',
  };

  return (
    <div className={`bg-[#151515] rounded-card p-6 flex flex-col justify-between h-40 relative group border border-border hover:border-primary/45 hover:bg-[#1A1A1A] transition-all duration-300 shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">{title}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      
      <div className="my-xs">
        <span className="text-display font-bold tracking-tight text-text leading-none">{value}</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
        <span className="text-[12px] text-[#A1A1AA] font-normal truncate pr-xs">{subtext}</span>
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
