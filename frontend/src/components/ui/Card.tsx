import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-surface-200 bg-white shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}