import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, children, ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && <label className="mb-1.5 block text-sm font-medium text-surface-700">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {/* Added break-words to prevent overflow */}
        {error && <p className="mt-1.5 text-xs text-red-600 break-words leading-tight">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';