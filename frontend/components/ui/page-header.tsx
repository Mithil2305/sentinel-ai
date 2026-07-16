import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  rightElement,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-control-gap border-b border-border pb-5 mb-section-gap">
      <div className="space-y-label-gap">
        <h1 className="text-page-title font-bold tracking-tight flex items-center gap-xs">
          {Icon && <Icon className="h-6 w-6 text-primary flex-shrink-0" />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-small-text text-muted leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>
      {rightElement && (
        <div className="flex items-center gap-control-gap self-start sm:self-auto flex-shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
};
