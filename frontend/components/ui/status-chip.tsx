import React from 'react';

export type StatusType = 
  | 'critical' 
  | 'warning' 
  | 'healthy' 
  | 'offline' 
  | 'maintenance' 
  | 'pending' 
  | 'resolved' 
  | 'investigating';

interface StatusChipProps {
  status: StatusType | string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
  const normStatus = status.toLowerCase() as StatusType;

  const styles: Record<StatusType, { bg: string; dot: string; label: string }> = {
    critical: {
      bg: 'bg-critical/15 text-critical border-critical/30',
      dot: 'bg-critical animate-pulse shadow-sm shadow-critical',
      label: 'Critical',
    },
    warning: {
      bg: 'bg-warning/15 text-warning border-warning/30',
      dot: 'bg-warning',
      label: 'Warning',
    },
    healthy: {
      bg: 'bg-success/15 text-success border-success/30',
      dot: 'bg-success animate-cyber-pulse',
      label: 'Healthy',
    },
    offline: {
      bg: 'bg-border/60 text-muted border-border/80',
      dot: 'bg-muted',
      label: 'Offline',
    },
    maintenance: {
      bg: 'bg-warning/10 text-warning/85 border-warning/25',
      dot: 'bg-warning/80',
      label: 'Maintenance',
    },
    pending: {
      bg: 'bg-primary/15 text-primary border-primary/30',
      dot: 'bg-primary animate-pulse',
      label: 'Pending',
    },
    resolved: {
      bg: 'bg-success/10 text-success border-success/20',
      dot: 'bg-success',
      label: 'Resolved',
    },
    investigating: {
      bg: 'bg-warning/10 text-warning border-warning/20',
      dot: 'bg-warning animate-pulse',
      label: 'Investigating',
    },
  };

  const current = styles[normStatus] || {
    bg: 'bg-border/60 text-muted border-border/80',
    dot: 'bg-muted',
    label: status,
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-badge text-[12px] font-bold border uppercase tracking-wider ${current.bg} ${className}`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
