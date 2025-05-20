import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {children && <div className="ml-auto">{children}</div>}
      </div>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
  );
}
