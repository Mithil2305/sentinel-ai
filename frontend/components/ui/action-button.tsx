import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all duration-150 rounded-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary/95 text-text border border-primary/20 shadow-lg transition-colors focus:outline-none',
    secondary: 'bg-secondary-surface border border-border hover:bg-border/40 text-text shadow-sm transition-colors focus:outline-none',
    outline: 'border border-border bg-transparent hover:bg-border/40 text-text transition-colors focus:outline-none',
    ghost: 'text-muted hover:bg-border/40 hover:text-text bg-transparent transition-colors focus:outline-none',
    danger: 'bg-critical hover:bg-critical/80 text-text shadow-lg border border-critical/20 transition-colors focus:outline-none',
    success: 'bg-success hover:bg-success/90 text-text shadow-lg border border-success/20 transition-colors focus:outline-none',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-5 text-small-text',
    lg: 'h-12 px-6 text-body',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
